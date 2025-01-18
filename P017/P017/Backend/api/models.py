from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now

class User(AbstractUser):
    ROLE_CHOICES = [
        ('docente', 'Docente'),
        ('coordenador', 'Coordenador'),
        ('administrador', 'Administrador')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='docente')

class Disponibilidade(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dia_semana = models.CharField(max_length=20, choices=[
        ('segunda', 'Segunda-feira'),
        ('terca', 'Terça-feira'),
        ('quarta', 'Quarta-feira'),
        ('quinta', 'Quinta-feira'),
        ('sexta', 'Sexta-feira')
    ])
    horario_inicio = models.TimeField()
    horario_fim = models.TimeField()
    restricao = models.BooleanField(default=False)

class Horario(models.Model):
    docente = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'docente'})
    dia_semana = models.CharField(max_length=20)
    horario_inicio = models.TimeField()
    horario_fim = models.TimeField()
    criado_em = models.DateTimeField(default=now)
