from celery import shared_task
from django.utils import timezone

from deployments.deployers.factory import DeployerFactory
from deployments.models import Deploy


@shared_task
def deploy_to_provider_task(deploy_id, provider_slug):
    """
    Task para fazer deploy em um provider específico.
    Roda de forma assíncrona para cada provider selecionado.
    """
    try:
        deploy = Deploy.objects.get(pk=deploy_id)

        # Cria o deployer específico para o provider
        deployer = DeployerFactory.create_deployer(provider_slug, deploy)

        # Executa o deployment
        deployer.execute_deployment()

        return f"Deploy {deploy_id} completed successfully on {provider_slug}"

    except Deploy.DoesNotExist:
        return f"Deploy {deploy_id} not found"
    except Exception as e:
        return f"Deploy {deploy_id} failed on {provider_slug}: {str(e)}"


@shared_task
def cleanup_deployment_task(deploy_id):
    """
    Task para limpeza final após todos os deployments terminarem.
    Pode ser usada para notificações, atualizações de status final, etc.
    """
    try:
        deploy = Deploy.objects.get(pk=deploy_id)

        # Verifica se todos os providers terminaram
        providers = deploy.providers.all()  # type: ignore
        all_completed = all(provider.status in ["up", "down"] for provider in providers)

        if all_completed:
            # Atualiza timestamp de conclusão
            deploy.completed_at = timezone.now()
            deploy.save()

        return f"Cleanup completed for deploy {deploy_id}"

    except Deploy.DoesNotExist:
        return f"Deploy {deploy_id} not found for cleanup"
    except Exception as e:
        return f"Cleanup failed for deploy {deploy_id}: {str(e)}"
