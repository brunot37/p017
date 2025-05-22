from django.urls import path
from . import views

urlpatterns = [
    path('registo', views.RegistoView.as_view(), name='registo'),
    path('login', views.LoginView.as_view(), name='login'),
    path('user/tipo-conta', views.UserTipoContaView.as_view(), name='user-tipo-conta'),
    path('user/tipo-conta/<int:id>/update', views.UserTipoContaUpdateView.as_view(), name='update-tipo-conta'),
    path('users/list', views.ListUsersView.as_view(), name='list-users'),
    path('horarios', views.SubmeterHorarioView.as_view(), name='submeter-horario'),
    path('docentes-com-horario', views.ListarDocentesComHorarioView.as_view(), name='listar-docentes-com-horario'),
]
