from rest_framework import viewsets, permissions
from .models import User, Disponibilidade, Horario
from .serializers import UserSerializer, DisponibilidadeSerializer, HorarioSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class DisponibilidadeViewSet(viewsets.ModelViewSet):
    queryset = Disponibilidade.objects.all()
    serializer_class = DisponibilidadeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'docente':
            return self.queryset.filter(user=self.request.user)
        return self.queryset

class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    