from rest_framework import serializers
from .models import User, Disponibilidade, Horario

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class DisponibilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilidade
        fields = ['id', 'user', 'dia_semana', 'horario_inicio', 'horario_fim', 'restricao']

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = ['id', 'docente', 'dia_semana', 'horario_inicio', 'horario_fim', 'criado_em']
