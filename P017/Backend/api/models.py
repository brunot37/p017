from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    tipo_conta = models.CharField(
        max_length=20,
        choices=[('docente', 'Docente'), ('coordenador', 'Coordenador')],
        default='docente'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class Utilizador(models.Model):
    TIPO_CONTA_CHOICES = [
        ('docente', 'Docente'),
        ('coordenador', 'Coordenador'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    nome = models.CharField(max_length=255)
    tipo_conta = models.CharField(max_length=20, choices=TIPO_CONTA_CHOICES)

    def __str__(self):
        return self.nome


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