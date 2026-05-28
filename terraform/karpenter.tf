# ============================================================================
# KARPENTER
# Kubernetes-native autoscaler that provisions EC2 instances directly.
# Uses Pod Identity (not OIDC) for AWS permissions.
# 
# What Terraform provisions:
#   - IAM role for Karpenter controller (Pod Identity)
#   - IAM role + instance profile for Karpenter-provisioned nodes
#   - SQS queue + EventBridge rules for spot interruption handling
#   - Discovery tags on subnets and security groups
#
# What Helm provisions later (not here):
#   - Karpenter controller deployment
#   - NodePool CRD (defines instance constraints)
#   - EC2NodeClass CRD (defines AMI, subnets, SG)
# ============================================================================

# ---- KARPENTER CONTROLLER IAM ROLE ----
# The Karpenter pod assumes this role via Pod Identity to manage EC2 instances
resource "aws_iam_role" "karpenter" {
  name = "${var.project_name}-karpenter-role"

  # Pod Identity trust policy — allows EKS pods to assume this role
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
        Effect = "Allow"
        Principal = {
          Service = "pods.eks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-karpenter-role"
  }
}

# Karpenter controller policy — permissions to launch/terminate EC2 instances
resource "aws_iam_policy" "karpenter" {
  name        = "${var.project_name}-karpenter-policy"
  description = "Policy for Karpenter controller to manage EC2 instances"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EC2Permissions"
        Effect = "Allow"
        Action = [
          "ec2:CreateLaunchTemplate",
          "ec2:CreateFleet",
          "ec2:RunInstances",
          "ec2:CreateTags",
          "ec2:TerminateInstances",
          "ec2:DeleteLaunchTemplate",
          "ec2:DescribeLaunchTemplates",
          "ec2:DescribeInstances",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSubnets",
          "ec2:DescribeImages",
          "ec2:DescribeInstanceTypes",
          "ec2:DescribeInstanceTypeOfferings",
          "ec2:DescribeAvailabilityZones",
          "ec2:DescribeSpotPriceHistory"
        ]
        Resource = "*"
      },
      {
        Sid      = "PassRoleToNodes"
        Effect   = "Allow"
        Action   = "iam:PassRole"
        Resource = aws_iam_role.karpenter_node.arn
      },
      {
        Sid      = "EKSPermissions"
        Effect   = "Allow"
        Action   = ["eks:DescribeCluster"]
        Resource = aws_eks_cluster.main.arn
      },
      {
        Sid    = "IAMInstanceProfilePermissions"
        Effect = "Allow"
        Action = [
          "iam:GetInstanceProfile",
          "iam:CreateInstanceProfile",
          "iam:DeleteInstanceProfile",
          "iam:AddRoleToInstanceProfile",
          "iam:RemoveRoleFromInstanceProfile",
          "iam:TagInstanceProfile"
        ]
        Resource = "*"
      },
      {
        Sid      = "SSMPermissions"
        Effect   = "Allow"
        Action   = ["ssm:GetParameter"]
        Resource = "arn:aws:ssm:${var.aws_region}::parameter/aws/service/eks/optimized-ami/*"
      },
      {
        Sid    = "PricingPermissions"
        Effect = "Allow"
        Action = ["pricing:GetProducts"]
        Resource = "*"
      },
      {
        Sid    = "SQSPermissions"
        Effect = "Allow"
        Action = [
          "sqs:DeleteMessage",
          "sqs:GetQueueUrl",
          "sqs:ReceiveMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.karpenter_interruption.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "karpenter" {
  policy_arn = aws_iam_policy.karpenter.arn
  role       = aws_iam_role.karpenter.name
}

# ---- KARPENTER NODE IAM ROLE ----
# Nodes that Karpenter provisions assume this role.
# Similar to the managed node group role but separate for isolation.
resource "aws_iam_role" "karpenter_node" {
  name = "${var.project_name}-karpenter-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-karpenter-node-role"
  }
}

# Standard EKS node policies
resource "aws_iam_role_policy_attachment" "karpenter_node_worker" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.karpenter_node.name
}

resource "aws_iam_role_policy_attachment" "karpenter_node_cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.karpenter_node.name
}

resource "aws_iam_role_policy_attachment" "karpenter_node_ecr" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.karpenter_node.name
}

# SSM for node management and debugging
resource "aws_iam_role_policy_attachment" "karpenter_node_ssm" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  role       = aws_iam_role.karpenter_node.name
}

# Instance profile — attached to EC2 instances Karpenter launches
resource "aws_iam_instance_profile" "karpenter_node" {
  name = "${var.project_name}-karpenter-node-profile"
  role = aws_iam_role.karpenter_node.name
}

# ---- POD IDENTITY ASSOCIATION ----
# Binds the Karpenter IAM role to the "karpenter" service account in kube-system.
# When the Karpenter pod starts, it automatically gets AWS credentials.
resource "aws_eks_pod_identity_association" "karpenter" {
  cluster_name    = aws_eks_cluster.main.name
  namespace       = "kube-system"
  service_account = "karpenter"
  role_arn        = aws_iam_role.karpenter.arn

  depends_on = [aws_eks_addon.pod_identity_agent]
}

# ---- SPOT INTERRUPTION HANDLING ----
# SQS queue receives EC2 spot interruption events via EventBridge.
# Karpenter reads these events and gracefully drains nodes before termination.

resource "aws_sqs_queue" "karpenter_interruption" {
  name                      = "${var.project_name}-karpenter-interruption"
  message_retention_seconds = 300
  sqs_managed_sse_enabled   = true

  tags = {
    Name = "${var.project_name}-karpenter-interruption"
  }
}

# EventBridge rule: EC2 Spot Instance Interruption Warning
resource "aws_cloudwatch_event_rule" "spot_interruption" {
  name        = "${var.project_name}-spot-interruption"
  description = "Captures EC2 Spot Instance Interruption warnings"

  event_pattern = jsonencode({
    source      = ["aws.ec2"]
    detail-type = ["EC2 Spot Instance Interruption Warning"]
  })
}

resource "aws_cloudwatch_event_target" "spot_interruption" {
  rule      = aws_cloudwatch_event_rule.spot_interruption.name
  target_id = "karpenter-interruption-queue"
  arn       = aws_sqs_queue.karpenter_interruption.arn
}

# EventBridge rule: EC2 Instance Rebalance Recommendation
resource "aws_cloudwatch_event_rule" "instance_rebalance" {
  name        = "${var.project_name}-instance-rebalance"
  description = "Captures EC2 rebalance recommendations for proactive migration"

  event_pattern = jsonencode({
    source      = ["aws.ec2"]
    detail-type = ["EC2 Instance Rebalance Recommendation"]
  })
}

resource "aws_cloudwatch_event_target" "instance_rebalance" {
  rule      = aws_cloudwatch_event_rule.instance_rebalance.name
  target_id = "karpenter-interruption-queue"
  arn       = aws_sqs_queue.karpenter_interruption.arn
}

# EventBridge rule: EC2 Instance State-change (terminated, stopped)
resource "aws_cloudwatch_event_rule" "instance_state_change" {
  name        = "${var.project_name}-instance-state-change"
  description = "Captures EC2 instance state changes for cleanup"

  event_pattern = jsonencode({
    source      = ["aws.ec2"]
    detail-type = ["EC2 Instance State-change Notification"]
  })
}

resource "aws_cloudwatch_event_target" "instance_state_change" {
  rule      = aws_cloudwatch_event_rule.instance_state_change.name
  target_id = "karpenter-interruption-queue"
  arn       = aws_sqs_queue.karpenter_interruption.arn
}

# Allow EventBridge to send messages to the SQS queue
resource "aws_sqs_queue_policy" "karpenter_interruption" {
  queue_url = aws_sqs_queue.karpenter_interruption.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowEventBridge"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.karpenter_interruption.arn
      }
    ]
  })
}

# ---- DISCOVERY TAGS ----
# Karpenter uses these tags to find which subnets and security groups
# to use when launching new nodes. Must match the EC2NodeClass config.

# Tag private subnets so Karpenter launches nodes there
resource "aws_ec2_tag" "karpenter_subnet_discovery" {
  count       = 2
  resource_id = aws_subnet.private[count.index].id
  key         = "karpenter.sh/discovery"
  value       = "${var.project_name}-eks"
}

# Tag the cluster security group so Karpenter assigns it to new nodes
resource "aws_ec2_tag" "karpenter_sg_discovery" {
  resource_id = aws_security_group.eks_cluster.id
  key         = "karpenter.sh/discovery"
  value       = "${var.project_name}-eks"
}
