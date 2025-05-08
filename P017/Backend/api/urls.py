from django.urls import path
from .views import RegistoView, LoginView, SubmeterHorarioView

urlpatterns = [
    path('registo', RegistoView.as_view(), name='registo'),
    path('login', LoginView.as_view(), name='login'),
    path('submeter-horario', SubmeterHorarioView.as_view(), name='submeter_horario'),
]
