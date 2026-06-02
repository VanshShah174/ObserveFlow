# ============================================================================
# INPUT VARIABLES
# All configurable values for the infrastructure
# Override defaults in terraform.tfvars
# ============================================================================

variable "aws_region" {
  description = "AWS region to deploy all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name — used as prefix for all resource names"
  type        = string
  default     = "observeflow"
}

# ---- VPC ----

variable "vpc_cidr" {
  description = "CIDR block for the VPC (provides 65,536 IPs)"
  type        = string
  default     = "10.0.0.0/16"
}

# ---- EKS ----

variable "eks_cluster_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.35"
}

variable "node_instance_type" {
  description = "EC2 instance type for the managed node group (runs system pods + Karpenter)"
  type        = string
  default     = "t3.medium"
}

variable "node_desired_size" {
  description = "Desired number of nodes in the managed node group"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum number of nodes (keep at 2 for HA)"
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "Maximum number of nodes the managed group can scale to"
  type        = number
  default     = 3
}

# ---- ECR ----

variable "services" {
  description = "List of microservice names — one ECR repository per service"
  type        = list(string)
  default = [
    "frontend-service",
    "product-service",
    "cart-service",
    "order-service",
    "user-service",
    "notification-service",
    "inventory-service"
  ]
}

# ---- GITHUB ----

variable "github_repo" {
  description = "GitHub repository in format 'owner/repo' — used for OIDC trust policy"
  type        = string
  default     = "VanshShah174/ObserveFlow"
}
