from django.contrib import admin

from .models import Deploy, Log, Provider


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "deploy",
        "slug",
        "status",
        "created_at",
        "updated_at",
    )
    search_fields = ("slug",)
    list_filter = ("status", "slug")


@admin.register(Deploy)
class DeployAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "github_repo_url",
        "created_at",
        "updated_at",
        "completed_at",
    )
    search_fields = ("github_repo_url",)


@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ("id", "deploy", "provider", "level", "timestamp", "message")
    search_fields = ("message",)
    list_filter = ("level", "provider")
