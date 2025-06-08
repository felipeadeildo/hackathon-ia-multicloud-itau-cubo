from deployments.models import Deploy, Log, Provider
from rest_framework import serializers


class ProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = [
            "id",
            "slug",
            "status",
            "created_at",
            "updated_at",
        ]


class DeploySerializer(serializers.ModelSerializer):
    providers = ProviderSerializer(many=True, read_only=True)

    class Meta:
        model = Deploy
        fields = [
            "id",
            "github_repo_url",
            "providers",
            "created_at",
            "updated_at",
            "completed_at",
        ]


class DeployCreateSerializer(serializers.ModelSerializer):
    providers = serializers.ListField(child=serializers.CharField(), write_only=True)

    class Meta:
        model = Deploy
        fields = ["github_repo_url", "providers"]


class LogSerializer(serializers.ModelSerializer):
    provider = ProviderSerializer(read_only=True)

    class Meta:
        model = Log
        fields = ["id", "deploy", "provider", "message", "level", "timestamp"]
