# Generated by Django 5.1.6 on 2025-05-30 23:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_departamento_escola_disponibilidade_ano_letivo_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='tipo_conta',
            field=models.CharField(choices=[('pendente', 'Pendente'), ('docente', 'Docente'), ('coordenador', 'Coordenador'), ('adm', 'Administrador')], default='pendente', max_length=20),
        ),
    ]
