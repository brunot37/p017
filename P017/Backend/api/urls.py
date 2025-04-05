from django.urls import path
from .views import RegistoView

urlpatterns = [
    path('registo', RegistoView.as_view(), name='registo'), 
    path('login', RegistoView.as_view(), name='login'),    
]