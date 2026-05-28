# ============================================================================
# TERRAFORM CONFIGURATION & PROVIDERS
# ============================================================================

terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state stored in S3 with native S3 locking (no DynamoDB needed)
  # The S3 bucket must be created manually before running terraform init
  backend "s3" {
    bucket       = "observeflow-terraform-state"
    key          = "state/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }
}

# AWS Provider — all resources will be created in this region
provider "aws" {
  region = var.aws_region

  # Default tags applied to every resource created by Terraform
  default_tags {
    tags = {
      Project     = "ObserveFlow"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
