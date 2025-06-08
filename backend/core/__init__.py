# Isso garantirá que o app seja sempre importado quando
# Django iniciar para que shared_task use esta app.
from .celery import app as celery_app

__all__ = ("celery_app",)
