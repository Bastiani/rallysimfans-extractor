#!/bin/bash

# Script para resolver problema de múltiplas instâncias do Certbot

echo "🔧 Resolvendo problema de múltiplas instâncias do Certbot..."

# Parar todos os containers relacionados ao certbot
echo "### Parando containers do certbot..."
docker-compose stop certbot 2>/dev/null || true
docker stop $(docker ps -q --filter "name=certbot") 2>/dev/null || true
docker stop $(docker ps -q --filter "ancestor=certbot/certbot") 2>/dev/null || true

# Remover containers parados do certbot
echo "### Removendo containers parados do certbot..."
docker rm $(docker ps -aq --filter "name=certbot") 2>/dev/null || true
docker rm $(docker ps -aq --filter "ancestor=certbot/certbot") 2>/dev/null || true

# Verificar e remover arquivos de lock do certbot
echo "### Verificando arquivos de lock..."
if [ -d "./certbot/conf" ]; then
    echo "Removendo possíveis arquivos de lock do certbot..."
    # Remover arquivos de lock dentro do volume do certbot
    docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" certbot/certbot sh -c "
        find /etc/letsencrypt -name '*.lock' -delete 2>/dev/null || true
        find /etc/letsencrypt -name '.certbot.lock' -delete 2>/dev/null || true
        find /var/lib/letsencrypt -name '.certbot.lock' -delete 2>/dev/null || true
    " 2>/dev/null || true
fi

# Verificar processos do certbot no sistema host (se houver acesso)
echo "### Verificando processos do certbot no sistema..."
if command -v pgrep >/dev/null 2>&1; then
    CERTBOT_PIDS=$(pgrep -f "certbot" 2>/dev/null || true)
    if [ ! -z "$CERTBOT_PIDS" ]; then
        echo "Encontrados processos do certbot: $CERTBOT_PIDS"
        echo "AVISO: Existem processos do certbot rodando no sistema host."
        echo "Você pode precisar executar: sudo pkill -f certbot"
    fi
fi

# Limpar volumes órfãos do Docker
echo "### Limpando volumes órfãos do Docker..."
docker volume prune -f 2>/dev/null || true

# Aguardar um pouco para garantir que tudo foi limpo
echo "### Aguardando limpeza completa..."
sleep 3

echo "✅ Limpeza concluída!"
echo ""
echo "Agora você pode tentar executar novamente:"
echo "  ./init-letsencrypt.sh"
echo "ou"
echo "  make ssl-init"
echo ""
echo "Se o problema persistir, verifique:"
echo "1. Se há processos do certbot rodando no sistema host"
echo "2. Os logs em /var/log/letsencrypt/letsencrypt.log"
echo "3. Execute: docker-compose logs certbot"