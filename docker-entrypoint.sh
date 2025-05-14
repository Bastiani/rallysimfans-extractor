#!/bin/sh

# Gerar certificado SSL auto-assinado se não existir
if [ ! -f /etc/nginx/ssl/cert.pem ] || [ ! -f /etc/nginx/ssl/key.pem ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/C=BR/ST=State/L=City/O=Organization/CN=api.rafaelbastiani.com" \
        -addext "subjectAltName=DNS:api.rafaelbastiani.com"
fi

# Iniciar Nginx em background
nginx

# Iniciar a aplicação Node.js
exec npm start