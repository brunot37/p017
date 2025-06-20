#!/usr/bin/env python
"""
Script para migrar dados para a nova estrutura de models
Este script deve ser executado antes de aplicar as novas migrações
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from api.models import User, Disponibilidade, Coordenador, Docente

def migrar_dados():
    """
    Migra os dados existentes para a nova estrutura
    """
    print("Iniciando migração de dados...")
    
    # 1. Criar perfis de Coordenador e Docente para usuários existentes
    users = User.objects.all()
    
    for user in users:
        # Se o usuário tem tipo_conta coordenador, criar perfil de coordenador
        if hasattr(user, 'tipo_conta') and user.tipo_conta == 'coordenador':
            coordenador, created = Coordenador.objects.get_or_create(user=user)
            if created:
                print(f"Criado perfil de coordenador para {user.email}")
        
        # Se o usuário tem tipo_conta docente, criar perfil de docente
        elif hasattr(user, 'tipo_conta') and user.tipo_conta == 'adm':
            docente, created = User.objects.get_or_create(user=user)
            if created:
                print(f"Criado perfil de docente para {user.email}")
    
    # 2. Migrar disponibilidades existentes
    # Esta parte será implementada depois que os novos campos forem adicionados
    
    print("Migração de dados concluída!")

if __name__ == '__main__':
    migrar_dados()
