terraform {
  backend "s3" {
    bucket         = "pb-terraform-state-prod"
    key            = "lambda_codepipeline/pb-mathjax.tfstate"
    region         = "ca-central-1"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.region
}

module "lambda_users_pipeline" {
  source = "../modules/lambda_codepipeline"

  aws_region  = var.region
  environment = var.environment

  github_repo   = var.github_repo
  github_branch = var.github_branch
  codestar_connection_arn = var.codestar_connection_arn

  lambda_function_name = var.lambda_function_name
  lambda_function_arn  = var.lambda_function_arn

  chatbot_sns_topic_arn   = var.chatbot_sns_topic_arn
}
