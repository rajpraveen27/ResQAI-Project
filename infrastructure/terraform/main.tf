provider "aws" {
  region = "ap-south-1"
}

# ── VPC ───────────────────────────────────────────────────────────────────────
resource "aws_vpc" "resqai_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "resqai-vpc", Project = "ResQAI" }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.resqai_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true
  tags = { Name = "resqai-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.resqai_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = true
  tags = { Name = "resqai-public-b" }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.resqai_vpc.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "ap-south-1a"
  tags = { Name = "resqai-private-a" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.resqai_vpc.id
  tags = { Name = "resqai-igw" }
}

# ── EKS Cluster ───────────────────────────────────────────────────────────────
resource "aws_eks_cluster" "resqai" {
  name     = "resqai-cluster"
  role_arn = aws_iam_role.eks_role.arn
  version  = "1.28"

  vpc_config {
    subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  }

  tags = { Name = "resqai-eks", Environment = "production" }
}

resource "aws_iam_role" "eks_role" {
  name = "resqai-eks-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "eks.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_role.name
}

# ── RDS PostgreSQL ────────────────────────────────────────────────────────────
resource "aws_db_instance" "resqai_db" {
  identifier           = "resqai-postgres"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.medium"
  allocated_storage    = 50
  max_allocated_storage = 200
  db_name              = "resqai_db"
  username             = "resqai_admin"
  password             = var.db_password
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name = aws_db_subnet_group.resqai.name
  backup_retention_period = 7
  multi_az             = true
  skip_final_snapshot  = false
  tags = { Name = "resqai-postgres", Project = "ResQAI" }
}

resource "aws_db_subnet_group" "resqai" {
  name       = "resqai-db-subnet"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.public_b.id]
}

resource "aws_security_group" "db_sg" {
  name   = "resqai-db-sg"
  vpc_id = aws_vpc.resqai_vpc.id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

# ── ElastiCache Redis ─────────────────────────────────────────────────────────
resource "aws_elasticache_cluster" "resqai_redis" {
  cluster_id           = "resqai-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

# ── S3 for media uploads ──────────────────────────────────────────────────────
resource "aws_s3_bucket" "resqai_media" {
  bucket = "resqai-disaster-media-uploads"
  tags   = { Name = "resqai-media", Project = "ResQAI" }
}

resource "aws_s3_bucket_versioning" "media_versioning" {
  bucket = aws_s3_bucket.resqai_media.id
  versioning_configuration { status = "Enabled" }
}

# ── Variables ─────────────────────────────────────────────────────────────────
variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

# ── Outputs ───────────────────────────────────────────────────────────────────
output "eks_cluster_endpoint" {
  value = aws_eks_cluster.resqai.endpoint
}
output "rds_endpoint" {
  value = aws_db_instance.resqai_db.address
}
output "redis_endpoint" {
  value = aws_elasticache_cluster.resqai_redis.cache_nodes[0].address
}
