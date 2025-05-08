from rest_framework import serializers
from .models import User, Horario, Disponibilidade

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'nome', 'tipo_conta']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = ['utilizador', 'dia', 'hora_inicio', 'hora_fim']

class DisponibilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilidade
        fields = ['utilizador', 'dia', 'hora_inicio', 'hora_fim']
