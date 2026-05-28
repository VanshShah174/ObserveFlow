# ============================================================================
# OUTPUTS
# Values exported after terraform apply.
# Used by Helm charts, CI/CD pipelines, and kubectl configuration.
# ============================================================================

# ---- VPC ----

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs (where nodes run)"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "Public subnet IDs (where load balancers live)"
  value       = aws_subnet.public[*].id
}

# ---- EKS ----

output "eks_cluster_name" {
  description = "EKS cluster name — use with: aws eks update-kubeconfig --name <this>"
  value       = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "eks_cluster_certificate_authority" {
  description = "EKS cluster CA certificate (base64 encoded)"
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
}

output "node_group_name" {
  description = "Managed node group name (runs system pods + Karpenter)"
  value       = aws_eks_node_group.main.node_group_name
}

# ---- ECR ----

output "ecr_repository_urls" {
  description = "ECR repository URLs — use in CI/CD to push images"
  value = {
    for service, repo in aws_ecr_repository.services :
    service => repo.repository_url
  }
}

# ---- KARPENTER ----

output "karpenter_role_arn" {
  description = "IAM role ARN for Karpenter controller (used in Helm values)"
  value       = aws_iam_role.karpenter.arn
}

output "karpenter_node_role_name" {
  description = "IAM role name for Karpenter-provisioned nodes (used in EC2NodeClass)"
  value       = aws_iam_role.karpenter_node.name
}

output "karpenter_instance_profile_name" {
  description = "Instance profile for Karpenter nodes (used in EC2NodeClass)"
  value       = aws_iam_instance_profile.karpenter_node.name
}

output "karpenter_interruption_queue_name" {
  description = "SQS queue for spot interruption events (used in Karpenter Helm values)"
  value       = aws_sqs_queue.karpenter_interruption.name
}
