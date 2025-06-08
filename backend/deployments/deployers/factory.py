from .aws import AWSDeployer
from .oracle import OracleDeployer


class DeployerFactory:
    @staticmethod
    def create_deployer(provider_type: str, deploy):
        deployers = {
            "aws": AWSDeployer,
            "oracle": OracleDeployer,
        }
        deployer_class = deployers.get(provider_type)
        if not deployer_class:
            raise ValueError(f"Unsupported provider: {provider_type}")
        return deployer_class(deploy)
