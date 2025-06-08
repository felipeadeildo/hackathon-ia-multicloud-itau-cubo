from deployments.models import Deploy, Log, Provider
from django.shortcuts import get_object_or_404
from pydantic_ai import Agent
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import json
import os
import logging

from .serializers import (
    DeployCreateSerializer,
    DeploySerializer,
    LogSerializer,
    ProviderSerializer,
)

# Configurar logging
logger = logging.getLogger(__name__)

agent = Agent(
    model="openai:gpt-4o-mini",
    instructions="""
    Você é um especialista em infraestrutura cloud que analisa deployments e recomenda 
    o melhor provedor baseado em dados técnicos e requisitos específicos.
    
    Considere sempre:
    - Latência para a região do usuário
    - Custo-benefício
    - Recursos necessários vs disponíveis
    - Complexidade de deployment
    - Confiabilidade e SLA
    
    Forneça uma resposta estruturada com justificativa clara.
    """,
)


class DeployListCreateView(APIView):
    def get(self, request):
        deployments = Deploy.objects.all().order_by("-created_at")
        serializer = DeploySerializer(deployments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DeployCreateSerializer(data=request.data)
        if serializer.is_valid():
            github_repo_url = serializer.validated_data["github_repo_url"]  # type: ignore
            provider_slugs = serializer.validated_data["providers"]  # type: ignore
            deploy = Deploy.objects.create(github_repo_url=github_repo_url)

            # Dispara tasks assíncronas para cada provider
            from deployments.tasks import deploy_to_provider_task

            for provider_slug in provider_slugs:
                deploy_to_provider_task.delay(deploy.pk, provider_slug)  # type: ignore

            return Response(
                DeploySerializer(deploy).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeployDetailView(APIView):
    def get(self, request, pk):
        deploy = get_object_or_404(Deploy, pk=pk)
        serializer = DeploySerializer(deploy)
        return Response(serializer.data)


class LogListView(APIView):
    def get(self, request, deploy_id):
        logs = Log.objects.filter(deploy_id=deploy_id)
        provider = request.GET.get("provider")
        level = request.GET.get("level")
        if provider:
            logs = logs.filter(provider__slug=provider)
        if level:
            logs = logs.filter(level=level)
        logs = logs.order_by("timestamp")
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)


class ProviderListView(APIView):
    def get(self, request):
        # Agora providers são específicos por deploy
        deploy_id = request.GET.get("deploy_id")
        if deploy_id:
            providers = Provider.objects.filter(deploy_id=deploy_id)
        else:
            providers = Provider.objects.all()
        serializer = ProviderSerializer(providers, many=True)
        return Response(serializer.data)


class DeploymentAIView(APIView):
    def get(self, request, deploy_id):
        deploy = get_object_or_404(Deploy, pk=deploy_id)
        serializer = DeploySerializer(deploy)

        # Carrega dados das clouds do arquivo JSON
        cloud_data = self.load_cloud_data()
        
        # Monta o prompt com os dados das clouds
        prompt = f"""
        Me diga qual provider usar para deployar o repo {deploy.github_repo_url} 
        dado os seguintes dados do deploy: {serializer.data}
        
        E considerando as seguintes informações das clouds disponíveis:
        {json.dumps(cloud_data, indent=2, ensure_ascii=False)}
        
        Leve em consideração fatores como latência, custo, recursos disponíveis e localização.
        """
        
        result = agent.run_sync(prompt)
        return Response({
            "result": result.output,
            "cloud_data_used": cloud_data
        })
    
    def load_cloud_data(self):
        """Carrega dados das clouds do arquivo JSON"""
        try:
            # Caminho para o arquivo JSON (ajuste conforme sua estrutura)
            json_file_path = os.path.join(settings.BASE_DIR, 'data', 'cloud_providers.json')
            
            with open(json_file_path, 'r', encoding='utf-8') as file:
                cloud_data = json.load(file)
            
            return cloud_data
            
        except FileNotFoundError:
            # Fallback caso o arquivo não exista
            return {
                "error": "Arquivo de dados das clouds não encontrado",
                "providers": []
            }
        except json.JSONDecodeError:
            return {
                "error": "Erro, vai na view.py do back",
                "providers": []
            }
        except Exception as e:
            return {
                "error": f"Erro inesperado: {str(e)}",
                "providers": []
            }
