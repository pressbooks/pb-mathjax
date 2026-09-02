provider "aws" {
  region = var.aws_region
}

############################
# Artifacts bucket (per env/account)
############################
data "aws_s3_bucket" "codepipeline_artifacts" {
  bucket = "pb-codepipeline-artifacts-${var.environment}"
}

############################
# IAM roles (per pipeline)
############################

resource "aws_iam_role" "codepipeline_role" {
  name = "codepipeline-role-${replace(var.github_repo, "/", "-")}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "codepipeline.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "codepipeline_policy" {
  name = "codepipeline-role-${replace(var.github_repo, "/", "-")}"
  role = aws_iam_role.codepipeline_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject",
          "s3:ListBucket"
        ],
        Resource = [
          data.aws_s3_bucket.codepipeline_artifacts.arn,
          "${data.aws_s3_bucket.codepipeline_artifacts.arn}/*"
        ]
      },
      {
        Effect = "Allow",
        Action = [
          "codebuild:BatchGetBuilds",
          "codebuild:StartBuild"
        ],
        Resource = "*" # tighten later if you want
      },
      {
        Effect   = "Allow",
        Action   = ["codestar-connections:UseConnection"],
        Resource = var.codestar_connection_arn
      }
    ]
  })
}

resource "aws_iam_role" "codebuild_role" {
  name = "codebuild-role-${replace(var.github_repo, "/", "-")}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "codebuild.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "codebuild_policy" {
  name = "codebuild-policy-${replace(var.github_repo, "/", "-")}"
  role = aws_iam_role.codebuild_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject"
        ],
        Resource = [
          data.aws_s3_bucket.codepipeline_artifacts.arn,
          "${data.aws_s3_bucket.codepipeline_artifacts.arn}/*"
        ]
      },
      {
        Effect = "Allow",
        Action = [
          "lambda:UpdateFunctionCode",
          "lambda:GetFunctionConfiguration"
        ],
        Resource = var.lambda_function_arn
      }
    ]
  })
}

############################
# CodeBuild project
############################

resource "aws_codebuild_project" "lambda_build" {
  name          = "${replace(var.github_repo, "/", "-")}-${var.environment}-deploy"
  service_role  = aws_iam_role.codebuild_role.arn
  build_timeout = 30

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type    = "BUILD_GENERAL1_SMALL"
    image           = "aws/codebuild/standard:7.0"
    type            = "LINUX_CONTAINER"
    privileged_mode = false

    environment_variable {
      name  = "LAMBDA_FUNCTION_NAME"
      value = var.lambda_function_name
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = <<-EOF
      version: 0.2

      phases:
        install:
          runtime-versions:
            nodejs: 24
          commands:
            - echo "Installing dependencies..."
            - npm ci || npm install
        build:
          commands:
            - echo "Running tests (if any)..."
            - npm test || echo "No tests"
            - echo "Zipping function code..."
            - zip -r function.zip ./*
        post_build:
          commands:
            - echo "Updating Lambda function..."
            - echo "LAMBDA_FUNCTION_NAME is $LAMBDA_FUNCTION_NAME"
            - aws lambda update-function-code --function-name "$LAMBDA_FUNCTION_NAME" --zip-file fileb://function.zip

      artifacts:
        files:
          - function.zip
    EOF
  }
}

############################
# CodePipeline
############################

resource "aws_codepipeline" "lambda_pipeline" {
  name     = "${replace(var.github_repo, "/", "-")}-${var.environment}-deploy"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    type     = "S3"
    location = data.aws_s3_bucket.codepipeline_artifacts.bucket
  }

  stage {
    name = "Source"

    action {
      name             = "GitHub_Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["SourceArtifact"]

      configuration = {
        ConnectionArn        = var.codestar_connection_arn
        FullRepositoryId     = var.github_repo
        BranchName           = var.github_branch
        OutputArtifactFormat = "CODE_ZIP"
      }
    }
  }

  stage {
    name = "Build_Deploy"

    action {
      name             = "Build_and_Deploy_to_Lambda"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["SourceArtifact"]
      output_artifacts = ["BuildArtifact"]

      configuration = {
        ProjectName = aws_codebuild_project.lambda_build.name
      }
    }
  }
}

############################
# Notifications to Slack via Chatbot
############################

data "aws_sns_topic" "chatbot" {
  name = "${var.environment}-notifications"
}

resource "aws_codestarnotifications_notification_rule" "lambda_pipeline_notifications" {
  name        = "lambda-pipeline-slack-notifications-${replace(var.github_repo, "/", "-")}"
  detail_type = "FULL"
  resource    = aws_codepipeline.lambda_pipeline.arn
  status      = "ENABLED"

  event_type_ids = [
    "codepipeline-pipeline-pipeline-execution-started",
    "codepipeline-pipeline-pipeline-execution-succeeded",
    "codepipeline-pipeline-pipeline-execution-failed"
  ]

  target {
    type    = "SNS"
    address = data.aws_sns_topic.chatbot.arn
  }
}
