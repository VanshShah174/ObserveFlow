# ============================================================================
# AWS OBSERVABILITY INFRASTRUCTURE
# CloudWatch Logs, X-Ray, Amazon Managed Prometheus (AMP)
# ADOT Collector uses Pod Identity to write to these services.
# ============================================================================

# ---- CLOUDWATCH LOG GROUP ----
# Application logs from all services
resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/eks/${var.project_name}-eks/application"
  retention_in_days = 7 # Keep costs low for dev

  tags = {
    Name = "${var.project_name}-application-logs"
  }
}

# ---- AMAZON MANAGED PROMETHEUS (AMP) ----
# Serverless Prometheus — stores metrics, supports PromQL
resource "aws_prometheus_workspace" "main" {
  alias = "${var.project_name}-metrics"

  tags = {
    Name = "${var.project_name}-amp"
  }
}

# ---- ADOT COLLECTOR IAM ROLE (Pod Identity) ----
# The ADOT Collector pod assumes this role to write to CW, X-Ray, AMP
resource "aws_iam_role" "adot_collector" {
  name = "${var.project_name}-adot-collector-role"

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
    Name = "${var.project_name}-adot-collector-role"
  }
}

# ADOT Collector Policy — permissions to write to CW Logs, X-Ray, AMP
resource "aws_iam_policy" "adot_collector" {
  name        = "${var.project_name}-adot-collector-policy"
  description = "Policy for ADOT Collector to export telemetry to AWS services"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      },
      {
        Sid    = "XRay"
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords",
          "xray:GetSamplingRules",
          "xray:GetSamplingTargets",
          "xray:GetSamplingStatisticSummaries"
        ]
        Resource = "*"
      },
      {
        Sid    = "AMP"
        Effect = "Allow"
        Action = [
          "aps:RemoteWrite",
          "aps:GetSeries",
          "aps:GetLabels",
          "aps:GetMetricMetadata"
        ]
        Resource = aws_prometheus_workspace.main.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "adot_collector" {
  policy_arn = aws_iam_policy.adot_collector.arn
  role       = aws_iam_role.adot_collector.name
}

# Pod Identity Association — binds ADOT role to its service account
resource "aws_eks_pod_identity_association" "adot_collector" {
  cluster_name    = aws_eks_cluster.main.name
  namespace       = "observeflow"
  service_account = "adot-collector"
  role_arn        = aws_iam_role.adot_collector.arn

  depends_on = [aws_eks_addon.pod_identity_agent]
}

# ---- ADOT EKS Addon ----
# AWS-managed OTel Operator — handles auto-instrumentation injection
resource "aws_eks_addon" "adot" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "adot"

  depends_on = [aws_eks_node_group.main]
}
