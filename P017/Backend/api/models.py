from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, username=None, **extra_fields):
        if not email:
            raise ValueError("O email é obrigatório.")
        if not password:
            raise ValueError("A password é obrigatória.")
        
        email = self.normalize_email(email)
        
        user = self.model(
            email=email, 
            username=username or email.split('@')[0], 
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and return a superuser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('tipo_conta', 'adm')  # Set tipo_conta to 'adm' for superusers
        
        # If no name provided, use a default name or extract from email
        if not extra_fields.get('nome'):
            extra_fields['nome'] = f"Admin {email.split('@')[0]}"
    
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
            
        return self.create_user(email, password, **extra_fields)


class Departamento(models.Model):
    nome = models.CharField(max_length=255)
    
    def __str__(self):
        return self.nome


class Escola(models.Model):
    nome = models.CharField(max_length=255)
    departamento = models.ForeignKey(Departamento, on_delete=models.CASCADE, related_name='escolas', null=True, blank=True)

    def __str__(self):
        return self.nome


class User(AbstractBaseUser, PermissionsMixin):
    TIPO_CONTA_CHOICES = [
        ('pendente', 'Pendente'),
        ('coordenador', 'Coordenador'),
        ('docente', 'Docente'),
        ('admin', 'Administrador'),
    ]
    
    username = models.CharField(max_length=150, blank=True, null=True)
    nome = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    tipo_conta = models.CharField(max_length=20, choices=TIPO_CONTA_CHOICES, default='pendente')
    is_staff = models.BooleanField(default=False)
    departamento = models.ForeignKey(Departamento, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    last_login = models.DateTimeField(blank=True, null=True)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.nome or self.username} ({self.email})"
    
    
class Horario(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, default=1, related_name='horarios')
    dia = models.DateField(default=timezone.now)
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()
    semestre = models.CharField(max_length=20, null=True, blank=True)
    ano_letivo = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.utilizador.email} - {self.dia}"



class Coordenador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='coordenador')

    def __str__(self):
        return f"Coordenador: {self.user.nome or self.user.username}"


class Docente(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='docente')
    coordenador = models.ForeignKey(Coordenador, on_delete=models.CASCADE, related_name='docentes', null=True, blank=True)

    def __str__(self):
        return f"Docente: {self.user.nome or self.user.username}"


class Disponibilidade(models.Model):
    docente = models.ForeignKey(Docente, on_delete=models.CASCADE, related_name='disponibilidades', null=True, blank=True)
    dia = models.DateField(null=True, blank=True)
    hora_inicio = models.TimeField(null=True, blank=True)
    hora_fim = models.TimeField(null=True, blank=True)
    semestre = models.CharField(max_length=20, null=True, blank=True)
    ano_letivo = models.CharField(max_length=20, null=True, blank=True)
    intervalo = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        if self.docente:
            return f"{self.docente.user.nome or self.docente.user.username} - {self.dia or 'N/A'} - {self.semestre or 'N/A'}"
        return f"Disponibilidade - {self.dia or 'N/A'} - {self.semestre or 'N/A'}"


class AprovacaoDisponibilidade(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovado', 'Aprovado'),
        ('rejeitado', 'Rejeitado'),
    ]
    
    disponibilidade = models.ForeignKey(Disponibilidade, on_delete=models.CASCADE, related_name='aprovacoes')
    coordenador = models.ForeignKey(Coordenador, on_delete=models.CASCADE, related_name='aprovacoes', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    observacoes = models.TextField(blank=True, null=True)
    data_aprovacao = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.disponibilidade.docente.user.nome or self.disponibilidade.docente.user.username} - {self.status}"


class Notificacao(models.Model):
    TIPO_CHOICES = [
        ('disponibilidade_aprovada', 'Disponibilidade Aprovada'),
        ('disponibilidade_rejeitada', 'Disponibilidade Rejeitada'),
        ('horario_criado', 'Horário Criado'),
        ('docente_adicionado', 'Docente Adicionado'),
        ('coordenador_atribuido', 'Coordenador Atribuído'),
        ('departamento_alterado', 'Departamento Alterado'),
        ('geral', 'Geral'),
    ]
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notificacoes')
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=255)
    mensagem = models.TextField()
    lida = models.BooleanField(default=False)
    data_criacao = models.DateTimeField(auto_now_add=True)
    
    # Campos opcionais para referências específicas
    disponibilidade_ref = models.ForeignKey(Disponibilidade, on_delete=models.CASCADE, null=True, blank=True)
    horario_ref = models.ForeignKey(Horario, on_delete=models.CASCADE, null=True, blank=True)
    user_ref = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='notificacoes_referencia')
    
    class Meta:
        ordering = ['-data_criacao']
    
    def __str__(self):
        return f"{self.usuario.nome} - {self.titulo}"
