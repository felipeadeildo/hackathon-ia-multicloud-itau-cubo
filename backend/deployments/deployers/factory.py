from .aws import AWSDeployer
from .oracle import OracleDeployer


class DeployerFactory:
    @staticmethod
    def create_deployer(provider_slug: str, deploy):
        deployers = {
            "aws": AWSDeployer,
            "oracle": OracleDeployer,
        }
        deployer_class = deployers.get(provider_slug)
        if not deployer_class:
            raise ValueError(f"Unsupported provider: {provider_slug}")

        # Passa o provider_slug para o deployer
        deployer = deployer_class(deploy)
        deployer.provider_slug = provider_slug
        return deployer
