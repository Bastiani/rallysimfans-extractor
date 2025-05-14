# Stage 1: Build da aplicação
FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Stage 2: Configuração do ambiente de produção
FROM node:20-alpine

# Instalar dependências necessárias
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init \
    openssl \
    nginx

# Criar diretório para certificados SSL e logs
RUN mkdir -p /etc/nginx/ssl /var/log/nginx

# Criar usuário não-root para a aplicação
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copiar arquivos da aplicação
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./
COPY --from=build --chown=nodejs:nodejs /app/node_modules/ ./node_modules/
COPY --from=build --chown=nodejs:nodejs /app/src/ ./src/
COPY --from=build --chown=nodejs:nodejs /app/dist/ ./dist/

# Configurar variáveis de ambiente para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PUPPETEER_DISABLE_DEV_SHM_USAGE=true \
    PUPPETEER_ARGS="--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-setuid-sandbox --no-first-run --no-zygote --single-process"

# Configurar variáveis de ambiente da aplicação
ENV NODE_ENV=production \
    PORT=3000

# Copiar configurações do Nginx e script de inicialização
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Expor portas (API e SSL)
EXPOSE 80
EXPOSE 443
EXPOSE 3000

# Garantir permissões corretas para o Nginx
RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R nodejs:nodejs /var/cache/nginx /var/run /var/log/nginx /etc/nginx/ssl

# Mudar para usuário não-root
USER nodejs

ENTRYPOINT ["/docker-entrypoint.sh"]