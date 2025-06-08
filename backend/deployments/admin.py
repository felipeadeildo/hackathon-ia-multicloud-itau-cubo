from django.contrib import admin

from .models import Deploy, DeployProvider, Log, Provider


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "provider_type",
        "status",
        "slug",
        "created_at",
        "updated_at",
    )
    search_fields = ("name", "slug", "provider_type")
    list_filter = ("provider_type", "status")


@admin.register(Deploy)
class DeployAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "github_repo_url",
        "status",
        "created_at",
        "updated_at",
        "completed_at",
    )
    search_fields = ("github_repo_url",)
    list_filter = ("status",)


@admin.register(DeployProvider)
class DeployProviderAdmin(admin.ModelAdmin):
    list_display = ("id", "deploy", "provider", "status", "created_at", "updated_at")
    list_filter = ("status", "provider")


@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ("id", "deploy", "provider", "level", "timestamp", "message")
    search_fields = ("message",)
    list_filter = ("level", "provider")
