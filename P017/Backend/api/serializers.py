from rest_framework import serializers
from .models import Departamento, Escola, Disponibilidade, User, AprovacaoDisponibilidade

class DisponibilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilidade
        fields = '__all__'

class UserTipoContaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['tipo_conta']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'nome', 'password', 'tipo_conta']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = '__all__'

class EscolaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escola
        fields = '__all__'

class AprovacaoDisponibilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AprovacaoDisponibilidade
        fields = '__all__'
