.PHONY: help build up down logs restart ssl-init ssl-renew clean status

# Default target
help:
	@echo "Rally Sim Fans API - Comandos disponíveis:"
	@echo ""
	@echo "  build        - Construir as imagens Docker"
	@echo "  up           - Iniciar todos os serviços"
	@echo "  down         - Parar todos os serviços"
	@echo "  restart      - Reiniciar todos os serviços"
	@echo "  logs         - Visualizar logs em tempo real"
	@echo "  status       - Verificar status dos containers"
	@echo "  ssl-init     - Inicializar certificados SSL"
	@echo "  ssl-renew    - Renovar certificados SSL"
	@echo "  ssl-check    - Verificar certificados SSL"
	@echo "  clean        - Limpar containers e volumes"
	@echo "  shell-app    - Acessar shell do container da aplicação"
	@echo "  shell-nginx  - Acessar shell do container nginx"
	@echo ""

# Build Docker images
build:
	@echo "🔨 Construindo imagens Docker..."
	docker-compose build

# Start all services
up:
	@echo "🚀 Iniciando serviços..."
	docker-compose up -d
	@echo "✅ Serviços iniciados!"
	@echo "📡 API disponível em: https://rafaelbastiani.com"

# Stop all services
down:
	@echo "🛑 Parando serviços..."
	docker-compose down

# Restart all services
restart: down up

# View logs
logs:
	@echo "📋 Visualizando logs..."
	docker-compose logs -f

# Check container status
status:
	@echo "📊 Status dos containers:"
	docker-compose ps
	@echo ""
	@echo "💾 Uso de recursos:"
	docker stats --no-stream

# Initialize SSL certificates
ssl-init:
	@echo "🔒 Inicializando certificados SSL..."
	./init-letsencrypt.sh

# Renew SSL certificates
ssl-renew:
	@echo "🔄 Renovando certificados SSL..."
	./renew-certificates.sh

# Check SSL certificates
ssl-check:
	@echo "🔍 Verificando certificados SSL..."
	docker-compose run --rm certbot certificates

# Clean up containers and volumes
clean:
	@echo "🧹 Limpando containers e volumes..."
	docker-compose down -v
	docker system prune -f

# Access application container shell
shell-app:
	@echo "🐚 Acessando shell do container da aplicação..."
	docker-compose exec app sh

# Access nginx container shell
shell-nginx:
	@echo "🐚 Acessando shell do container nginx..."
	docker-compose exec nginx sh

# Test nginx configuration
nginx-test:
	@echo "🧪 Testando configuração do nginx..."
	docker-compose exec nginx nginx -t

# Reload nginx configuration
nginx-reload:
	@echo "🔄 Recarregando configuração do nginx..."
	docker-compose exec nginx nginx -s reload

# Show API endpoints
endpoints:
	@echo "📡 Endpoints da API:"
	@echo ""
	@echo "  GET  https://rafaelbastiani.com/health"
	@echo "  GET  https://rafaelbastiani.com/api/online/rally-table"
	@echo "  GET  https://rafaelbastiani.com/api/online/rally-online-results"
	@echo ""

# Development mode
dev:
	@echo "🔧 Iniciando em modo desenvolvimento..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production deployment
deploy: build ssl-init up
	@echo "🚀 Deploy em produção concluído!"
	@echo "📡 API disponível em: https://rafaelbastiani.com"