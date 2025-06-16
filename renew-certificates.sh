#!/bin/bash

# Script para renovar certificados Let's Encrypt automaticamente

# Verificar e limpar instâncias do certbot em execução
echo "### Verificando instâncias do certbot em execução..."

# Parar containers do certbot
docker-compose stop certbot 2>/dev/null || true
docker stop $(docker ps -q --filter "name=certbot") 2>/dev/null || true

# Remover arquivos de lock
if [ -d "./certbot/conf" ]; then
  echo "### Removendo possíveis arquivos de lock..."
  docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" certbot/certbot sh -c "
    find /etc/letsencrypt -name '*.lock' -delete 2>/dev/null || true
    find /etc/letsencrypt -name '.certbot.lock' -delete 2>/dev/null || true
  " 2>/dev/null || true
fi

# Aguardar um pouco para garantir que tudo foi limpo
sleep 2

echo "### Renovando certificados Let's Encrypt ..."
docker-compose run --rm certbot renew

echo "### Recarregando nginx ..."
docker-compose exec nginx nginx -s reload

echo "### Renovação concluída!"

# Para adicionar ao crontab, execute:
# crontab -e
# Adicione a linha:
# 0 12 * * * /caminho/para/este/script/renew-certificates.sh