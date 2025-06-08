from .base import BaseDeployer


class AWSDeployer(BaseDeployer):
    def get_provider_type(self) -> str:
        return "aws"

    def deploy_to_cloud(self):
        # Aqui será implementada a lógica específica de deploy na AWS.
        self.log("AWS deploy logic not implemented yet.", "warning")
