import os
import shutil
import subprocess
import tempfile
from abc import ABC, abstractmethod

from django.utils import timezone

from deployments.models import Deploy, DeployProvider, Log, Provider


class BaseDeployer(ABC):
    def __init__(self, deploy: Deploy):
        self.deploy = deploy
        self.provider = None
        self.deploy_provider = None
        self.temp_dir = ""

    def execute_deployment(self):
        try:
            self.log("Starting deployment process", "info")
            self.setup_provider()
            self.clone_repository()
            self.validate_project_structure()
            self.deploy_to_cloud()
            self.update_deployment_status("completed")
        except Exception as e:
            self.log(f"Deployment failed: {str(e)}", "error")
            self.update_deployment_status("failed")
            raise
        finally:
            self.cleanup()

    def setup_provider(self):
        provider_type = self.get_provider_type()
        provider, _ = Provider.objects.get_or_create(
            provider_type=provider_type,
            defaults={
                "slug": provider_type,
                "name": provider_type.capitalize(),
                "status": "in_progress",
            },
        )
        self.provider = provider
        self.deploy_provider, _ = DeployProvider.objects.get_or_create(
            deploy=self.deploy,
            provider=provider,
            defaults={"status": "in_progress"},
        )

    def clone_repository(self):
        repo_url = self.deploy.github_repo_url
        self.temp_dir = tempfile.mkdtemp()
        try:
            subprocess.check_call(["git", "clone", repo_url, self.temp_dir])
            self.log(f"Cloned repository: {repo_url}", "info")
        except subprocess.CalledProcessError as e:
            self.log(f"Git clone failed: {str(e)}", "error")
            raise

    def validate_project_structure(self):
        docker_compose_path = os.path.join(self.temp_dir, "docker-compose.yml")
        if not os.path.exists(docker_compose_path):
            self.log("docker-compose.yml not found in repository", "error")
            raise FileNotFoundError("docker-compose.yml not found")
        self.log("docker-compose.yml found", "info")

    @abstractmethod
    def deploy_to_cloud(self):
        pass

    @abstractmethod
    def get_provider_type(self) -> str:
        pass

    def log(self, message: str, level: str = "info"):
        Log.objects.create(
            deploy=self.deploy,
            provider=self.provider,
            message=message,
            level=level,
            timestamp=timezone.now(),
        )

    def update_deployment_status(self, status: str):
        self.deploy.status = status
        self.deploy.save(update_fields=["status"])
        if self.deploy_provider:
            self.deploy_provider.status = status
            self.deploy_provider.save(update_fields=["status"])

    def cleanup(self):
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
            self.log("Cleaned up temporary files", "debug")
