#!/bin/bash

# Script para renovar certificados Let's Encrypt automaticamente

echo "### Renovando certificados Let's Encrypt ..."
docker-compose run --rm certbot renew

echo "### Recarregando nginx ..."
docker-compose exec nginx nginx -s reload

echo "### Renovação concluída!"

# Para adicionar ao crontab, execute:
# crontab -e
# Adicione a linha:
# 0 12 * * * /caminho/para/este/script/renew-certificates.sh