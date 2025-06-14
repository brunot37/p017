.PHONY: help dev prod clean logs shell test backup restore

# Makefile para gerenciamento de ambiente Docker
# Comandos temporarios para desenvolvimento e producao

# === VARIÁVEIS ===
COMPOSE_FILE=docker-compose.yml
COMPOSE_FILE_PROD=docker-compose.prod.yml
BACKUP_DIR=./backups

# === AJUDA ===
help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# === DESENVOLVIMENTO ===
dev: ## Inicia ambiente de desenvolvimento
	@echo "🚀 Iniciando ambiente de desenvolvimento..."
	docker compose -f $(COMPOSE_FILE) up -d
	@echo "✅ Ambiente iniciado! Acesse: http://localhost:3001"

dev-build: ## Rebuild completo para desenvolvimento
	@echo "🔄 Rebuilding desenvolvimento (sem cache)..."
	docker compose -f $(COMPOSE_FILE) down --volumes --remove-orphans
	docker system prune -f
	docker compose -f $(COMPOSE_FILE) build --no-cache
	docker compose -f $(COMPOSE_FILE) up -d
	@echo "✅ Rebuild completo!"

dev-stop: ## Para ambiente de desenvolvimento
	@echo "⏹️ Parando ambiente de desenvolvimento..."
	docker compose -f $(COMPOSE_FILE) down
	@echo "✅ Ambiente parado!"

dev-restart: ## Reinicia ambiente de desenvolvimento
	@echo "🔄 Reiniciando ambiente de desenvolvimento..."
	docker compose -f $(COMPOSE_FILE) restart
	@echo "✅ Ambiente reiniciado!"

dev-clean: ## Limpa tudo (containers, volumes, imagens)
	@echo "🧹 Limpando ambiente de desenvolvimento..."
	docker compose -f $(COMPOSE_FILE) down --volumes --remove-orphans
	docker system prune -af --volumes
	@echo "✅ Limpeza completa!"

# === PRODUÇÃO ===
prod: ## Inicia ambiente de produção
	@echo "🚀 Iniciando ambiente de produção..."
	docker compose -f $(COMPOSE_FILE_PROD) up -d
	@echo "✅ Ambiente de produção iniciado!"

prod-build: ## Rebuild completo para produção
	@echo "🔄 Rebuilding produção (sem cache)..."
	docker compose -f $(COMPOSE_FILE_PROD) down --volumes --remove-orphans
	docker compose -f $(COMPOSE_FILE_PROD) build --no-cache
	docker compose -f $(COMPOSE_FILE_PROD) up -d
	@echo "✅ Deploy de produção completo!"

prod-stop: ## Para ambiente de produção
	@echo "⏹️ Parando ambiente de produção..."
	docker compose -f $(COMPOSE_FILE_PROD) down
	@echo "✅ Ambiente de produção parado!"

prod-restart: ## Reinicia ambiente de produção
	@echo "🔄 Reiniciando ambiente de produção..."
	docker compose -f $(COMPOSE_FILE_PROD) restart
	@echo "✅ Ambiente de produção reiniciado!"

prod-deploy: ## Deploy rápido para produção (sem rebuild)
	@echo "🚀 Deploy rápido para produção..."
	docker compose -f $(COMPOSE_FILE_PROD) pull
	docker compose -f $(COMPOSE_FILE_PROD) up -d
	@echo "✅ Deploy rápido completo!"

# === SERVIÇOS INDIVIDUAIS ===
web-build: ## Rebuild apenas o serviço web
	@echo "🔄 Rebuilding serviço web..."
	docker compose -f $(COMPOSE_FILE) build --no-cache web
	docker compose -f $(COMPOSE_FILE) up -d web
	@echo "✅ Serviço web rebuilded!"

react-build: ## Rebuild apenas o serviço react
	@echo "🔄 Rebuilding serviço react..."
	docker compose -f $(COMPOSE_FILE) build --no-cache react-app
	docker compose -f $(COMPOSE_FILE) up -d react-app
	@echo "✅ Serviço react rebuilded!"

db-restart: ## Reinicia apenas o banco de dados
	@echo "🔄 Reiniciando banco de dados..."
	docker compose -f $(COMPOSE_FILE) restart db
	@echo "✅ Banco de dados reiniciado!"

# === LOGS E DEBUG ===
logs: ## Mostra logs de todos os serviços
	docker compose -f $(COMPOSE_FILE) logs -f

logs-web: ## Mostra logs apenas do serviço web
	docker compose -f $(COMPOSE_FILE) logs -f web

logs-react: ## Mostra logs apenas do serviço react
	docker compose -f $(COMPOSE_FILE) logs -f react-app

logs-db: ## Mostra logs apenas do banco de dados
	docker compose -f $(COMPOSE_FILE) logs -f db

logs-prod: ## Mostra logs da produção
	docker compose -f $(COMPOSE_FILE_PROD) logs -f

# === SHELL E DEBUG ===
shell: ## Acesso shell ao container web
	docker compose -f $(COMPOSE_FILE) exec web bash

shell-react: ## Acesso shell ao container react
	docker compose -f $(COMPOSE_FILE) exec react-app sh

shell-db: ## Acesso shell ao container do banco
	docker compose -f $(COMPOSE_FILE) exec db psql -U bruno -d P017

django-shell: ## Acesso ao Django shell
	docker compose -f $(COMPOSE_FILE) exec web python manage.py shell

# === DJANGO COMMANDS ===
migrate: ## Executa migrações do Django
	@echo "🔄 Executando migrações..."
	docker compose -f $(COMPOSE_FILE) exec web python manage.py migrate
	@echo "✅ Migrações executadas!"

makemigrations: ## Cria novas migrações
	@echo "🔄 Criando migrações..."
	docker compose -f $(COMPOSE_FILE) exec web python manage.py makemigrations
	@echo "✅ Migrações criadas!"

collectstatic: ## Coleta arquivos estáticos
	@echo "🔄 Coletando arquivos estáticos..."
	docker compose -f $(COMPOSE_FILE) exec web python manage.py collectstatic --noinput
	@echo "✅ Arquivos estáticos coletados!"

createsuperuser: ## Cria superusuário Django
	docker compose -f $(COMPOSE_FILE) exec web python manage.py createsuperuser

# === BACKUP E RESTORE ===
backup: ## Backup do banco de dados
	@echo "💾 Criando backup do banco de dados..."
	@mkdir -p $(BACKUP_DIR)
	docker compose -f $(COMPOSE_FILE) exec -T db pg_dump -U bruno P017 > $(BACKUP_DIR)/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup criado em $(BACKUP_DIR)/"

restore: ## Restaura backup do banco (use: make restore FILE=backup.sql)
	@echo "🔄 Restaurando backup do banco de dados..."
	@if [ -z "$(FILE)" ]; then echo "❌ Use: make restore FILE=nome_do_arquivo.sql"; exit 1; fi
	docker compose -f $(COMPOSE_FILE) exec -T db psql -U bruno -d P017 < $(BACKUP_DIR)/$(FILE)
	@echo "✅ Backup restaurado!"

# === STATUS E MONITORAMENTO ===
status: ## Mostra status dos containers
	@echo "📊 Status dos containers:"
	docker compose -f $(COMPOSE_FILE) ps

health: ## Verifica saúde dos serviços
	@echo "🏥 Verificando saúde dos serviços..."
	@echo "Web: http://localhost:8000/api/"
	@curl -f http://localhost:8000/api/ > /dev/null 2>&1 && echo "✅ Web OK" || echo "❌ Web com problemas"
	@echo "React: http://localhost:3001/"
	@curl -f http://localhost:3001/ > /dev/null 2>&1 && echo "✅ React OK" || echo "❌ React com problemas"
	@echo "Database:"
	@docker compose -f $(COMPOSE_FILE) exec db pg_isready -U bruno -d P017 > /dev/null 2>&1 && echo "✅ Database OK" || echo "❌ Database com problemas"

stats: ## Mostra estatísticas dos containers
	docker stats --no-stream

# === DESENVOLVIMENTO RÁPIDO ===
quick-restart: ## Restart rápido (apenas restart dos containers)
	@echo "⚡ Restart rápido..."
	docker compose -f $(COMPOSE_FILE) restart web react-app
	@echo "✅ Restart rápido completo!"

hot-reload: ## Força hot reload do Django
	@echo "🔥 Forçando hot reload..."
	docker compose -f $(COMPOSE_FILE) exec web touch /app/manage.py
	@echo "✅ Hot reload ativado!"

# === ALIASES ÚTEIS ===
up: dev ## Alias para dev
down: dev-stop ## Alias para dev-stop
build: dev-build ## Alias para dev-build
restart: dev-restart ## Alias para dev-restart
