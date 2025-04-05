from django.urls import path
from .views import RegistoView, LoginView

urlpatterns = [
    path('registo/', RegistoView.as_view(), name='registo'),
    path('login/', LoginView.as_view(), name='login'),
]