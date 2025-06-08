import os
import subprocess
import zipfile
from pathlib import Path

import boto3

from deployments.deployers.base import BaseDeployer


class AWSDeployer(BaseDeployer):
    """
    Deployer that:
      1. Packages application into a ZIP
      2. Uploads ZIP to S3
      3. Converts docker-compose.yml to CloudFormation template
      4. Creates or updates a CloudFormation stack
    """

    def __init__(self, deploy):
        super().__init__(deploy)
        # Initialize AWS clients once
        aws_params = {
            "aws_access_key_id": os.getenv("AWS_ACCESS_KEY_ID"),
            "aws_secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY"),
            "region_name": os.getenv("AWS_DEFAULT_REGION", "sa-east-1"),
        }
        self.s3_client = boto3.client("s3", **aws_params)
        self.cf_client = boto3.client("cloudformation", **aws_params)
        self.bucket = os.getenv("AWS_S3_BUCKET", "hackathon-itau")

    def get_provider_type(self) -> str:
        return "aws"

    def deploy_to_cloud(self):
        try:
            # 1) Package and upload
            zip_path = self._package_app()
            s3_key = f"{self.deploy.pk}/app.zip"
            self._upload_to_s3(zip_path, s3_key)

            # 2) Convert Compose to CloudFormation
            cf_template = self._convert_compose()

            # 3) Create or update CF stack
            self._deploy_cloudformation(cf_template)

        except Exception as exc:
            self.log(f"Deployment error: {exc}", "error")
            raise

    def _package_app(self) -> Path:
        """
        Zips up the contents of self.temp_dir into a temporary ZIP file.
        Returns Path to ZIP.
        """
        self.log("Packaging application into ZIP", "info")
        zip_path = Path(self.temp_dir) / "app.zip"

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, files in os.walk(self.temp_dir):
                # skip hidden dirs
                dirs[:] = [d for d in dirs if not d.startswith(".")]
                for fname in files:
                    if fname.endswith((".zip", ".pyc")) or fname.startswith("."):
                        continue
                    full = Path(root) / fname
                    rel = full.relative_to(self.temp_dir)
                    if ".git" in rel.parts or rel.name == "app.zip":
                        continue
                    try:
                        zf.write(full, rel)
                    except Exception as e:
                        self.log(f"Warning: skipped {rel}: {e}", "warning")

        if not zip_path.exists():
            raise FileNotFoundError(f"ZIP not created at {zip_path}")

        size = zip_path.stat().st_size
        self.log(f"Created ZIP ({size} bytes)", "debug")
        return zip_path

    def _upload_to_s3(self, zip_path: Path, s3_key: str):
        """
        Uploads the ZIP file to S3.
        """
        # Validate ZIP file exists before attempting upload
        if not zip_path.exists():
            raise FileNotFoundError(f"ZIP file not found: {zip_path}")

        self.log(f"Uploading {zip_path} to s3://{self.bucket}/{s3_key}", "info")
        try:
            self.s3_client.upload_file(str(zip_path), self.bucket, s3_key)
            self.log("Upload successful", "info")

            # Only cleanup the ZIP file after successful upload
            # The temp directory cleanup will be handled by base class
            try:
                zip_path.unlink()
                self.log(f"Cleaned up ZIP file {zip_path}", "debug")
            except OSError as e:
                self.log(
                    f"Warning: Could not remove ZIP file {zip_path}: {e}", "warning"
                )

        except self.s3_client.exceptions.ClientError as e:
            self.log(f"S3 upload failed: {e}", "error")
            raise
        except Exception as e:
            self.log(f"Unexpected error during upload: {e}", "error")
            raise

    def _convert_compose(self) -> Path:
        """
        Converts docker-compose.yml to a CloudFormation template.
        Returns Path to generated CloudFormation YAML.
        """
        self.log("Converting docker-compose.yml to CloudFormation template", "info")
        target = Path(self.temp_dir) / "template.yml"
        compose_file = Path(self.temp_dir) / "docker-compose.yml"
        try:
            subprocess.check_call(
                [
                    "docker",
                    "compose",
                    "-f",
                    str(compose_file),
                    "convert",
                    "-o",
                    str(target),
                ]
            )
        except subprocess.CalledProcessError as e:
            self.log(f"Compose conversion failed: {e}", "error")
            raise

        if not target.exists():
            raise FileNotFoundError("template.yml not found after conversion")
        self.log("Conversion complete", "debug")
        return target

    def _deploy_cloudformation(self, template_path: Path):
        """
        Creates or updates a CloudFormation stack using the given template.
        """
        stack_name = f"deploy-{self.deploy.pk}"
        self.log(f"Deploying CloudFormation stack: {stack_name}", "info")

        with open(template_path) as f:
            template_body = f.read()

        # Try update, fallback to create
        try:
            self.cf_client.update_stack(
                StackName=stack_name,
                TemplateBody=template_body,
                Capabilities=["CAPABILITY_IAM"],
            )
            action = "update"
        except self.cf_client.exceptions.ClientError as e:
            if "No updates are to be performed" in str(e):
                self.log("No changes detected; stack is up to date", "info")
                return
            if "does not exist" in str(e):
                self.cf_client.create_stack(
                    StackName=stack_name,
                    TemplateBody=template_body,
                    Capabilities=["CAPABILITY_IAM"],
                )
                action = "create"
            else:
                self.log(f"CloudFormation error: {e}", "error")
                raise

        self.log(f"CloudFormation stack {action} initiated", "info")
