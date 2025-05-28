from rest_framework import serializers
from .models import Coordenador, Departamento, Escola, Horario, Disponibilidade, User

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = ['id', 'dia', 'hora_inicio', 'hora_fim', 'semestre', 'ano_letivo']

class DisponibilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilidade
        fields = ['id', 'dia', 'hora_inicio', 'hora_fim', 'semestre', 'ano_letivo'] 

class UserTipoContaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['tipo_conta']

    def validate_tipo_conta(self, value):
        valid_types = ['pendente', 'docente', 'coordenador', 'adm']
        if value not in valid_types:
            raise serializers.ValidationError(f"Tipo de conta deve ser um dos: {', '.join(valid_types)}")
        return value

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'email', 'nome', 'password', 'tipo_conta']

    def validate_tipo_conta(self, value):
        valid_types = ['pendente', 'docente', 'coordenador', 'adm']
        if value not in valid_types:
            raise serializers.ValidationError(f"Tipo de conta deve ser um dos: {', '.join(valid_types)}")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            email=validated_data['email'],
            nome=validated_data['nome'],
            tipo_conta=validated_data.get('tipo_conta', 'pendente'),
            password=password
        )
        return user

class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = ['id', 'nome']


class EscolaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escola
        fields = ['id', 'nome']

        from django.db import models

class CoordenadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coordenador
        fields = ['id', 'nome', 'cargo', 'departamento']
