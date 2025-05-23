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
        user = self.model(email=email, nome=nome, tipo_conta=tipo_conta, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, nome="admin", **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser precisa de is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser precisa de is_superuser=True.")
        return self.create_user(email, password, nome, tipo_conta="coordenador", **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    nome = models.CharField(max_length=255)
    tipo_conta = models.CharField(
        max_length=20,
        choices=[
            ('pendente', 'Pendente'),
            ('docente', 'Docente'),
            ('coordenador', 'Coordenador')
        ],
        default='pendente'
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class Disponibilidade(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE)
    dia = models.DateField(default=timezone.now)
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()

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
