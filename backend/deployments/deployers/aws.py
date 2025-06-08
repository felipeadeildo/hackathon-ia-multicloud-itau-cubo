import os
import subprocess
import zipfile

import boto3

from deployments.deployers.base import BaseDeployer


class AWSDeployer(BaseDeployer):
    def get_provider_type(self) -> str:
        return "aws"

    def deploy_to_cloud(self):
        # 1) zip + upload para S3
        zip_path = os.path.join(self.temp_dir, "app.zip")
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, _, files in os.walk(self.temp_dir):
                for f in files:
                    full = os.path.join(root, f)
                    rel = os.path.relpath(full, self.temp_dir)
                    zf.write(full, rel)
        s3 = boto3.client("s3")
        bucket = "meu-bucket-deploys"
        s3.upload_file(zip_path, bucket, f"{self.deploy.pk}/app.zip")
        self.log("Uploaded package to S3", "info")

        # 2) converter Compose -> CloudFormation
        cf_template = os.path.join(self.temp_dir, "template.yml")
        subprocess.check_call(
            [
                "docker",
                "compose",
                "convert",
                "-f",
                os.path.join(self.temp_dir, "docker-compose.yml"),
                "-o",
                cf_template,
            ]
        )
        self.log("Converted docker-compose to CloudFormation", "info")

        # 3) criar stack
        cf = boto3.client("cloudformation")
        with open(cf_template) as f:
            body = f.read()
        cf.create_stack(
            StackName=f"deploy-{self.deploy.pk}",
            TemplateBody=body,
            Capabilities=["CAPABILITY_IAM"],
        )
        self.log("CloudFormation stack creation initiated", "info")
