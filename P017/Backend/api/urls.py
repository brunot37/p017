from django.urls import path
from .views import RegistoView, LoginView, SubmeterHorarioView, ListarDocentesComHorarioView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('registo', RegistoView.as_view(), name='registo'),
    path('login', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('submeter-horario', SubmeterHorarioView.as_view(), name='submeter_horario'),
    path('docentes/com-horarios', ListarDocentesComHorarioView.as_view(), name='listar_docentes_com_horarios'),
]
