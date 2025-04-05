from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from django.utils import timezone

class Utilizador(models.Model):
    TIPO_CONTA_CHOICES = [
        ('docente', 'Docente'),
        ('coordenador', 'Coordenador'),
    ]
    nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    senha = models.CharField(max_length=128)  
    tipo_conta = models.CharField(max_length=20, choices=TIPO_CONTA_CHOICES)

    def __str__(self):
        return self.email
    
class Conta(models.Model):
    TIPO_CONTA_CHOICES = [
        ('docente', 'Docente'),
        ('coordenador', 'Coordenador'),
    ]

    tipo_conta = models.CharField(max_length=20, choices=TIPO_CONTA_CHOICES)
    utilizador = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    senha = models.CharField(max_length=128)  
    
    def __str__(self):
        return self.utilizador

class User(AbstractUser):
    tipo_conta = models.CharField(
        max_length=20,
        choices=[('docente', 'Docente'), ('coordenador', 'Coordenador')],
        default='docente'
    )
    

class Disponibilidade(models.Model):
    utilizador = models.ForeignKey('User', on_delete=models.CASCADE)
    dia = models.DateField(default=timezone.now)  
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()

    def __str__(self):
        return f"{self.utilizador} - {self.dia}"
    
class Horario(models.Model):
    utilizador = models.ForeignKey('User', on_delete=models.CASCADE, default=1)  
    dia = models.DateField(default=timezone.now)  
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()

    def __str__(self):
        return f"{self.utilizador} - {self.dia}"
