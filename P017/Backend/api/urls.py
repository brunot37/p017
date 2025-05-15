from django.urls import path
from .views import (
    RegistoView,
    LoginView,
    UserTipoContaView,
    UserTipoContaUpdateView,
    ListUsersView,  # Novo endpoint
)

urlpatterns = [
    path('registo', RegistoView.as_view(), name='registo'),
    path('login', LoginView.as_view(), name='login'),
    path('user/tipo-conta', UserTipoContaView.as_view(), name='user_tipo_conta'),
    path('user/<int:id>/tipo-conta', UserTipoContaUpdateView.as_view(), name='update_tipo_conta'),
    path('users/', ListUsersView.as_view(), name='list_users'),  # Novo endpoint
]
