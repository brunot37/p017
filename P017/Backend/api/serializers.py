from rest_framework import serializers
from .models import Coordenador, Departamento, Escola, Horario, Disponibilidade, User, AprovacaoDisponibilidade

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = ['id', 'dia', 'hora_inicio', 'hora_fim', 'semestre', 'ano_letivo']

class DisponibilidadeSerializer(serializers.ModelSerializer):
    utilizador_nome = serializers.CharField(source='utilizador.nome', read_only=True)
    dia_semana = serializers.SerializerMethodField()
    
    class Meta:
        model = Disponibilidade
        fields = ['id', 'utilizador', 'utilizador_nome', 'dia', 'dia_semana', 'hora_inicio', 'hora_fim', 'semestre', 'ano_letivo']
    
    def get_dia_semana(self, obj):
        dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
        return dias[obj.dia.weekday()]

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

class CoordenadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coordenador
        fields = ['id', 'nome', 'cargo', 'departamento']

class AprovacaoDisponibilidadeSerializer(serializers.ModelSerializer):
    docente_nome = serializers.CharField(source='disponibilidade.utilizador.nome', read_only=True)
    
    class Meta:
        model = AprovacaoDisponibilidade
        fields = ['id', 'disponibilidade', 'coordenador', 'status', 'data_aprovacao', 'observacoes', 'docente_nome']
