# ============================================================================
# ECR (Elastic Container Registry)
# One private repository per microservice.
# GitHub Actions pushes images here; EKS pulls from here.
# ============================================================================

# Create a repository for each service
resource "aws_ecr_repository" "services" {
  for_each = toset(var.services)

  name                 = "${var.project_name}/${each.value}"
  image_tag_mutability = "IMMUTABLE" # Prevents image tag overwriting (CKV_AWS_51)
  force_delete         = true        # Allow deletion even if images exist (dev convenience)

  # Scan images for vulnerabilities on every push
  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name    = "${var.project_name}-${each.value}"
    Service = each.value
  }
}

# Lifecycle policy — auto-cleanup to save storage costs
# Rule 1: Delete untagged images after 1 day (failed/intermediate builds)
# Rule 2: Keep only the last 10 tagged images (old releases get cleaned up)
resource "aws_ecr_lifecycle_policy" "services" {
  for_each   = toset(var.services)
  repository = aws_ecr_repository.services[each.key].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Remove untagged images after 1 day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep only last 10 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
