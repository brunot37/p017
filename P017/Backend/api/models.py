from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, nome=None, tipo_conta="pendente", **extra_fields):
        if not email:
            raise ValueError("O email é obrigatório.")
        if not password:
            raise ValueError("A password é obrigatória.")
        
        email = self.normalize_email(email)
        
        user = self.model(email=email, nome=nome or email.split('@')[0], tipo_conta=tipo_conta, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, nome='admin', **extra_fields):
        extra_fields.setdefault("is_superuser", True)
        
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser precisa de is_superuser=True.")
        
        return self.create_user(email, password, nome=nome or "Admin", tipo_conta="adm", **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    nome = models.CharField(max_length=255)
    departamento = models.ForeignKey('Departamento', on_delete=models.SET_NULL, null=True, blank=True, related_name='user_docentes')
    coordenador = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='docentes_supervisionados')
    tipo_conta = models.CharField(
        max_length=20,
        choices=[
            ('pendente', 'Pendente'),
            ('docente', 'Docente'),
            ('coordenador', 'Coordenador'),
            ('adm', 'Administrador')
        ],
        default='pendente'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']  

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.nome} ({self.email})"

    # Propriedades para compatibilidade com o sistema de autenticação do Django
    @property
    def is_active(self):
        """Usuário está sempre ativo baseado no tipo_conta"""
        return self.tipo_conta != 'pendente'
    
    @property
    def is_staff(self):
        """Determina se o usuário pode acessar o admin"""
        return self.tipo_conta in ['coordenador', 'adm']


class Disponibilidade(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disponibilidades')
    dia = models.DateField(default=timezone.now)
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()
    semestre = models.CharField(max_length=20, null=True, blank=True)
    ano_letivo = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.utilizador.email} - {self.dia}"


class Escola(models.Model):
    nome = models.CharField(max_length=255)

    def __str__(self):
        return self.nome


class Departamento(models.Model):
    nome = models.CharField(max_length=255)
    escola = models.ForeignKey('Escola', on_delete=models.CASCADE, related_name='departamentos', null=True, blank=True)
    
    def __str__(self):
        return self.nome


class Coordenador(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='perfil_coordenador')
    departamento = models.ForeignKey(Departamento, null=True, blank=True, on_delete=models.SET_NULL, related_name='coordenadores')

    def __str__(self):
        return f"{self.user.nome} - {self.departamento}"


class Docente(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='perfil_docente')
    coordenador = models.ForeignKey(Coordenador, null=True, blank=True, on_delete=models.SET_NULL, related_name='docentes_supervisionados_perfil')

    def __str__(self):
        return self.user.nome


class AprovacaoDisponibilidade(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovado', 'Aprovado'),
        ('rejeitado', 'Rejeitado'),
    ]
    
    disponibilidade = models.ForeignKey(Disponibilidade, on_delete=models.CASCADE, related_name='aprovacoes')
    coordenador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='aprovacoes_feitas')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    data_aprovacao = models.DateTimeField(auto_now=True)
    observacoes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['disponibilidade', 'coordenador']
    
    def __str__(self):
        return f"{self.disponibilidade.utilizador.nome} - {self.status}"
