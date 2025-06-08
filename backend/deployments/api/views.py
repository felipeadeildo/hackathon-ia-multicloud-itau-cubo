from deployments.models import Deploy, Log, Provider
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    DeployCreateSerializer,
    DeploySerializer,
    LogSerializer,
    ProviderSerializer,
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
            providers = Provider.objects.filter(slug__in=provider_slugs)
            deploy.providers.set(providers)
            deploy.save()

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
        providers = Provider.objects.all()
        serializer = ProviderSerializer(providers, many=True)
        return Response(serializer.data)
