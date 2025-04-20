from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone

# Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, nome=None, tipo_conta="docente", **extra_fields):
        if not email:
            raise ValueError("O email é obrigatório.")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, nome=nome, tipo_conta=tipo_conta, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, nome="admin", **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email=email, password=password, nome=nome, tipo_conta="coordenador", **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    nome = models.CharField(max_length=255)
    tipo_conta = models.CharField(
        max_length=20,
        choices=[('docente', 'Docente'), ('coordenador', 'Coordenador')],
        default='docente'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()  # Define o manager

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

    def __str__(self):
        return f"{self.utilizador.email} - {self.dia}"
