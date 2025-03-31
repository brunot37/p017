from rest_framework.routers import DefaultRouter
from .views import UserViewSet, DisponibilidadeViewSet, HorarioViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'disponibilidades', DisponibilidadeViewSet)
router.register(r'horarios', HorarioViewSet)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
]