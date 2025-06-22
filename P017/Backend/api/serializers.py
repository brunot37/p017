from rest_framework import serializers
from .models import Coordenador, Departamento, Escola, Horario, Disponibilidade, User, AprovacaoDisponibilidade, Notificacao

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = ['id', 'dia', 'hora_inicio', 'hora_fim', 'semestre', 'ano_letivo']

class DisponibilidadeSerializer(serializers.ModelSerializer):
    docente_nome = serializers.SerializerMethodField()
    dia_semana = serializers.SerializerMethodField()
    
    class Meta:
        model = Disponibilidade
        fields = ['id', 'docente', 'docente_nome', 'dia', 'dia_semana', 'hora_inicio', 'hora_fim', 'semestre', 'ano_letivo', 'intervalo']
    
    def get_docente_nome(self, obj):
        if obj.docente and obj.docente.user:
            return obj.docente.user.nome
        return None
    
    def get_dia_semana(self, obj):
        if obj.dia:
            dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
            return dias[obj.dia.weekday()]
        return None

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


class NotificacaoSerializer(serializers.ModelSerializer):
    tempo_relativo = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacao
        fields = ['id', 'tipo', 'titulo', 'mensagem', 'lida', 'data_criacao', 'tempo_relativo']
    
    def get_tempo_relativo(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        agora = timezone.now()
        diff = agora - obj.data_criacao
        
        if diff < timedelta(minutes=1):
            return "Agora mesmo"
        elif diff < timedelta(hours=1):
            minutos = int(diff.total_seconds() / 60)
            return f"Há {minutos} minuto{'s' if minutos > 1 else ''}"
        elif diff < timedelta(days=1):
            horas = int(diff.total_seconds() / 3600)
            return f"Há {horas} hora{'s' if horas > 1 else ''}"
        elif diff < timedelta(days=7):
            dias = diff.days
            return f"Há {dias} dia{'s' if dias > 1 else ''}"
        else:
            return obj.data_criacao.strftime("%d/%m/%Y às %H:%M")
