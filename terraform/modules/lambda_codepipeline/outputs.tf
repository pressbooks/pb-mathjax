output "pipeline_name" {
  value = aws_codepipeline.lambda_pipeline.name
}

output "pipeline_arn" {
  value = aws_codepipeline.lambda_pipeline.arn
}

output "codepipeline_role_arn" {
  value = aws_iam_role.codepipeline_role.arn
}

output "codebuild_role_arn" {
  value = aws_iam_role.codebuild_role.arn
}
