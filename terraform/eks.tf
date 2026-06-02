# ============================================================================
# EKS CLUSTER & NODE GROUP
# EKS Standard with Managed Node Group.
# The managed node group runs system pods (CoreDNS, kube-proxy, Karpenter).
# Application workloads will be scheduled on Karpenter-provisioned nodes.
# ============================================================================

# ---- EKS CLUSTER ----
resource "aws_eks_cluster" "main" {
  name     = "${var.project_name}-eks"
  version  = var.eks_cluster_version
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    # Cluster spans both public and private subnets
    subnet_ids              = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
    endpoint_private_access = true  # Nodes can reach API server privately
    endpoint_public_access  = true  # kubectl access from your machine
    security_group_ids      = [aws_security_group.eks_cluster.id]
  }

  # Use API mode for access management (supports Pod Identity)
  access_config {
    authentication_mode = "API_AND_CONFIG_MAP"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller,
  ]

  tags = {
    Name = "${var.project_name}-eks"
  }
}

# ---- MANAGED NODE GROUP ----
# These nodes run system workloads: CoreDNS, kube-proxy, Karpenter controller.
# Application pods will be scheduled on Karpenter-managed nodes instead.
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-system-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = aws_subnet.private[*].id # Nodes in private subnets only

  instance_types = [var.node_instance_type]
  capacity_type  = "ON_DEMAND" # System nodes should be stable (no spot)

  scaling_config {
    desired_size = var.node_desired_size
    min_size     = var.node_min_size
    max_size     = var.node_max_size
  }

  # During rolling updates, allow 1 node to be unavailable
  update_config {
    max_unavailable = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ecr_read_only,
  ]

  tags = {
    Name = "${var.project_name}-system-nodes"
  }
}

# ---- EKS ADDONS ----

# Pod Identity Agent — enables pods to assume IAM roles without OIDC
# Used by Karpenter and later by ADOT for AWS permissions
resource "aws_eks_addon" "pod_identity_agent" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "eks-pod-identity-agent"

  depends_on = [aws_eks_node_group.main]
}

# VPC CNI — pod networking (assigns ENIs/IPs to pods)
resource "aws_eks_addon" "vpc_cni" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "vpc-cni"

  depends_on = [aws_eks_node_group.main]
}

# CoreDNS — cluster DNS resolution
resource "aws_eks_addon" "coredns" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "coredns"

  depends_on = [aws_eks_node_group.main]
}

# kube-proxy — service networking (iptables/IPVS rules)
resource "aws_eks_addon" "kube_proxy" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "kube-proxy"

  depends_on = [aws_eks_node_group.main]
}

# ---- SECURITY GROUP ----
# Controls network access to/from the EKS cluster
resource "aws_security_group" "eks_cluster" {
  name        = "${var.project_name}-eks-cluster-sg"
  description = "Security group for EKS cluster control plane and nodes"
  vpc_id      = aws_vpc.main.id

  # Allow all internal VPC traffic (nodes ↔ control plane ↔ pods)
  ingress {
    description = "Allow all traffic within VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  # Allow all outbound (nodes need to pull images, call AWS APIs, etc.)
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-eks-cluster-sg"
  }
}
