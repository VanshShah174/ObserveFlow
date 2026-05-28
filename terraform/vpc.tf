# ============================================================================
# VPC & NETWORKING
# Creates an isolated network with public and private subnets across 2 AZs.
# Public subnets: Load Balancers, NAT Gateway
# Private subnets: EKS worker nodes (not directly internet-accessible)
# ============================================================================

# Main VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true # Required for EKS
  enable_dns_support   = true # Required for EKS

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# Fetch available AZs in the region
data "aws_availability_zones" "available" {
  state = "available"
}

# ---- PUBLIC SUBNETS ----
# Used for: Load Balancers, NAT Gateway
# Instances here get public IPs automatically
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index) # 10.0.0.0/24, 10.0.1.0/24
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-${count.index + 1}"
    # Tags required for EKS to discover subnets for external load balancers
    "kubernetes.io/role/elb"                        = "1"
    "kubernetes.io/cluster/${var.project_name}-eks" = "shared"
  }
}

# ---- PRIVATE SUBNETS ----
# Used for: EKS worker nodes, application pods
# No direct internet access — outbound traffic goes through NAT Gateway
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10) # 10.0.10.0/24, 10.0.11.0/24
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-private-${count.index + 1}"
    # Tags required for EKS to discover subnets for internal load balancers
    "kubernetes.io/role/internal-elb"               = "1"
    "kubernetes.io/cluster/${var.project_name}-eks" = "shared"
  }
}

# ---- INTERNET GATEWAY ----
# Allows public subnets to reach the internet
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# ---- NAT GATEWAY ----
# Single NAT (cost saving: ~$32/mo instead of $96/mo for multi-AZ)
# Allows private subnets to make outbound calls (pull images, AWS API calls)
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip"
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id # Placed in first public subnet

  tags = {
    Name = "${var.project_name}-nat"
  }

  depends_on = [aws_internet_gateway.main]
}

# ---- ROUTE TABLES ----

# Public route table: traffic goes directly to Internet Gateway
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# Private route table: outbound traffic goes through NAT Gateway
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-private-rt"
  }
}

# ---- ROUTE TABLE ASSOCIATIONS ----
# Link subnets to their respective route tables

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
