variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "environment" {
  type        = string
  description = "Environment name, e.g. dev/stage/prod"
}

variable "github_repo" {
  type        = string
  description = "GitHub repo in the form owner/repo"
}

variable "github_branch" {
  type        = string
  description = "Git branch to deploy from"
  default     = "main"
}

variable "lambda_function_name" {
  type        = string
  description = "Name of the existing Lambda function"
}

variable "lambda_function_arn" {
  type        = string
  description = "ARN of the existing Lambda function"
}

variable "codestar_connection_arn" {
  type        = string
  description = "Existing CodeStar connection ARN for GitHub"
}

variable "chatbot_sns_topic_arn" {
  type        = string
  description = "SNS topic ARN wired to Slack via AWS Chatbot"
}
