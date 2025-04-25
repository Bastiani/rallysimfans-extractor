FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

COPY package*.json ./

# Configurar variáveis de ambiente do Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PUPPETEER_ARGS="--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-setuid-sandbox --no-first-run --no-zygote --single-process"

# Instalar dependências e Chrome com otimizações
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg2 \
    ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && npm ci --only=production \
    && apt-get purge -y --auto-remove wget gnupg2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && npm cache clean --force \
    && chmod -R o+rx /usr/bin/google-chrome-stable \
    && ls -la /usr/bin/google-chrome-stable \
    && google-chrome-stable --version

COPY . .

# Garantir permissões corretas para o usuário pptruser
RUN chown -R pptruser:pptruser /app

USER pptruser

EXPOSE 3000

# Verificar a existência do Chrome antes de iniciar
CMD ["sh", "-c", "ls -la /usr/bin/google-chrome-stable && google-chrome-stable --version && npm start"]