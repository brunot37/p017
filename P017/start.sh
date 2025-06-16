#!/bin/bash

echo "Aguardando base de dados..."
sleep 5

echo "Criando migrações..."
python manage.py makemigrations

echo "Aplicando migrações..."
python manage.py migrate

echo "Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000