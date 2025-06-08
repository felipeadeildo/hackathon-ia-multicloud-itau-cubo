import base64
import os
import zipfile

import oci

from .base import BaseDeployer


class OracleDeployer(BaseDeployer):
    def get_provider_type(self) -> str:
        return "oracle"

    def deploy_to_cloud(self):
        # 1) Carrega configuração OCI (arquivo e perfil via env vars ou defaults)
        config_file = os.getenv("OCI_CONFIG_FILE", os.path.expanduser("~/.oci/config"))
        profile = os.getenv("OCI_PROFILE", "DEFAULT")
        config = oci.config.from_file(config_file, profile)

        # 2) Zip da pasta de deploy
        zip_path = os.path.join(self.temp_dir, "app.zip")
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, _, files in os.walk(self.temp_dir):
                for f in files:
                    full = os.path.join(root, f)
                    rel = os.path.relpath(full, self.temp_dir)
                    zf.write(full, rel)

        # 3) Upload para Object Storage
        bucket_name = os.getenv("OCI_BUCKET_NAME")
        compartment_id = os.getenv("OCI_COMPARTMENT_ID")
        namespace = oci.object_storage.ObjectStorageClient(config).get_namespace().data
        object_client = oci.object_storage.ObjectStorageClient(config)
        object_name = f"{self.deploy.pk}/app.zip"
        with open(zip_path, "rb") as stream:
            object_client.put_object(
                namespace_name=namespace,
                bucket_name=bucket_name,
                object_name=object_name,
                put_object_body=stream,
            )
        self.log(f"Uploaded package to OCI bucket “{bucket_name}”", "info")

        # 4) Criação do Resource Manager Stack
        rm = oci.resource_manager.ResourceManagerClient(config)
        zip_bytes = open(zip_path, "rb").read()
        zip_b64 = base64.b64encode(zip_bytes).decode("utf-8")

        stack_details = oci.resource_manager.models.CreateStackDetails(
            compartment_id=compartment_id,
            display_name=f"deploy-{self.deploy.pk}",
            config_source=oci.resource_manager.models.CreateZipUploadConfigSourceDetails(
                zip_file_base64_=zip_b64
            ),
        )
        rm.create_stack(stack_details)
        self.log("Resource Manager stack creation initiated", "info")
