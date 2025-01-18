from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import UserViewSet, DisponibilidadeViewSet, HorarioViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'disponibilidades', DisponibilidadeViewSet)
router.register(r'horarios', HorarioViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
