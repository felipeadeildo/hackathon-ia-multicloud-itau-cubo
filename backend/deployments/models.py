from django.db import models


class Deploy(models.Model):
    github_repo_url = models.URLField()
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Deploy {self.pk} - {self.github_repo_url}"


class Provider(models.Model):
    STATUS_CHOICES = [
        ("in_progress", "In Progress"),
        ("up", "Up"),
        ("down", "Down"),
    ]

    deploy = models.ForeignKey(
        Deploy, on_delete=models.CASCADE, related_name="providers"
    )
    slug = models.CharField(max_length=20)  # "aws", "oracle"
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="in_progress"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("deploy", "slug")

    def __str__(self):
        return f"{self.slug} for Deploy {self.deploy.pk}"


class Log(models.Model):
    LOG_LEVEL_CHOICES = [
        ("debug", "Debug"),
        ("info", "Info"),
        ("warning", "Warning"),
        ("error", "Error"),
        ("critical", "Critical"),
    ]

    deploy = models.ForeignKey(Deploy, on_delete=models.CASCADE, related_name="logs")
    provider = models.ForeignKey(
        Provider, on_delete=models.CASCADE, related_name="logs"
    )
    message = models.TextField()
    level = models.CharField(max_length=20, choices=LOG_LEVEL_CHOICES, default="info")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.level.upper()}] {self.timestamp} - {self.provider}: {self.message[:50]}"
