from rest_framework import serializers
from .models import Horario, Disponibilidade, User

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = ['id', 'dia', 'hora_inicio', 'hora_fim', 'semestre', 'ano_letivo']

class DisponibilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilidade
        fields = ['id', 'dia', 'hora_inicio', 'hora_fim']

class UserTipoContaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['tipo_conta']

    def validate_tipo_conta(self, value):
        valid_types = ['pendente', 'docente', 'coordenador']
        if value not in valid_types:
            raise serializers.ValidationError(f"Tipo de conta deve ser um dos: {', '.join(valid_types)}")
        return value

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'nome', 'password', 'tipo_conta']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user
