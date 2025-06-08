from django.db import models


class Provider(models.Model):
    PROVIDER_CHOICES = [
        ("aws", "Amazon Web Services"),
        ("oracle", "Oracle Cloud"),
        ("azure", "Microsoft Azure"),
        ("gcp", "Google Cloud Platform"),
    ]

    STATUS_CHOICES = [
        ("in_progress", "In Progress"),
        ("up", "Up"),
        ("down", "Down"),
    ]

    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    provider_type = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="down")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.provider_type})"


class Deploy(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    github_repo_url = models.URLField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    providers = models.ManyToManyField(Provider, through="DeployProvider")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Deploy {self.pk} - {self.github_repo_url}"


class DeployProvider(models.Model):
    deploy = models.ForeignKey(Deploy, on_delete=models.CASCADE)
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Provider.STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.deploy} on {self.provider}"


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
