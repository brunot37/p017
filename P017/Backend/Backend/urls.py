from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("Bem-vindo ao backend!")  # Página inicial para a URL raiz

urlpatterns = [
    path('', home),  # Rota para a página inicial
    path('admin/', admin.site.urls),  # Painel de administração
    path('api/', include('api.urls')),  # Inclua as URLs do app 'api'
]