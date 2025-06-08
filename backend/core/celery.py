import os

from celery import Celery

# Define o módulo de configurações padrão do Django para o programa 'celery'.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

app = Celery("core")

# Usar string aqui significa que o worker não precisará serializar
# o objeto de configuração para processos filhos.
# - namespace='CELERY' significa que todas as configurações relacionadas ao celery
#   devem ter um prefixo `CELERY_`.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Carrega módulos de tasks de todas as apps Django registradas.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
