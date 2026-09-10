variable "github_repo" {
  description = "GitHub repo in the form owner/repo"
  type        = string
}

variable "github_branch" {
  description = "Git branch to deploy from"
  type        = string
  default     = "dev"
}

variable "lambda_function_name" {
  description = "Name of the existing Lambda function"
  type        = string
}

variable "lambda_function_arn" {
  description = "ARN of the existing Lambda function"
  type        = string
}

variable "chatbot_sns_topic_arn" {
  description = "SNS topic ARN that AWS Chatbot posts to Slack from"
  type        = string
}
variable "region" {
  description = "Region that this service is deployed"
  type = string
  default = "ca-central-1"
}
variable "environment" {
  description = "The name of your environment (development, staging, production)"
  type = string
  default = "development"
}
variable "codestar_connection_arn" {
  description = "The ARN of your CodeStar Connection for accessing the service's repository"
  type = string
}
