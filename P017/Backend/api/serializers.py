from rest_framework import serializers
from .models import User, Horario, Disponibilidade

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'nome', 'tipo_conta']
        read_only_fields = ['tipo_conta']

    def create(self, validated_data):
        validated_data['tipo_conta'] = 'pendente'
        return User.objects.create_user(**validated_data)

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = ['utilizador', 'dia', 'hora_inicio', 'hora_fim', 'semestre', 'unidade_curricular']

class DisponibilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilidade
        fields = ['utilizador', 'dia', 'hora_inicio', 'hora_fim']

class UserTipoContaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['tipo_conta']
