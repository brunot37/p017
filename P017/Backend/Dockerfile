# Definição da imagem base
FROM python:3.11

# Variável de ambiente para evitar mensagens interativas
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de dependências
COPY requirements.txt .

RUN apt-get update && apt-get install -y \
    libldap2-dev \
    libsasl2-dev \
    gcc \
    && pip install --upgrade pip \
    && pip install -r requirements.txt

COPY . .

# Expõe a porta padrão do Django
EXPOSE 8000

# Comando para iniciar o servidor (pode ajustar para gunicorn em produção)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
