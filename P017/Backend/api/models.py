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
        if tipo_conta == 'coordenador':
            extra_fields.setdefault("is_staff", True)
            extra_fields.setdefault("is_superuser", False)
        elif tipo_conta == 'adm':
            extra_fields.setdefault("is_staff", True)
            extra_fields.setdefault("is_superuser", True)
        else:
            extra_fields.setdefault("is_staff", False)
            extra_fields.setdefault("is_superuser", False)
        
        user = self.model(email=email, nome=nome or email.split('@')[0], tipo_conta=tipo_conta, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, nome='admin', **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser precisa de is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser precisa de is_superuser=True.")
        
        return self.create_user(email, password, nome=nome or "Admin", tipo_conta="adm", **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    nome = models.CharField(max_length=255)
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
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']  

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.nome} ({self.email})"


class Disponibilidade(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE)
    dia = models.DateField(default=timezone.now)
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()
    semestre = models.CharField(max_length=20, null=True, blank=True)
    ano_letivo = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.utilizador.email} - {self.dia}"


class Horario(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
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
    escola = models.ForeignKey(Escola, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.nome


class Coordenador(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    departamento = models.ForeignKey(Departamento, null=True, blank=True, on_delete=models.SET_NULL)
    cargo_status = models.CharField(
        max_length=20,
        choices=[('Ativo', 'Ativo'), ('Pendente', 'Pendente')],
        default='Pendente'
    )

    def __str__(self):
        return f"{self.user.nome} - {self.departamento}"


class Docente(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    coordenador = models.ForeignKey(Coordenador, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.user.nome
