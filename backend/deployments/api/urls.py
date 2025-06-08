from django.urls import path

from .views import DeployDetailView, DeployListCreateView, LogListView, ProviderListView

urlpatterns = [
    path("deployments/", DeployListCreateView.as_view(), name="deploy-list-create"),
    path("deployments/<int:pk>/", DeployDetailView.as_view(), name="deploy-detail"),
    path(
        "deployments/<int:deploy_id>/logs/", LogListView.as_view(), name="deploy-logs"
    ),
    path("providers/", ProviderListView.as_view(), name="provider-list"),
]
