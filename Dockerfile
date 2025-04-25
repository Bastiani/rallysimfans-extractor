FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

COPY package*.json ./

# Configurar variáveis de ambiente do Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PUPPETEER_ARGS="--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-setuid-sandbox --no-first-run --no-zygote --single-process"

# Instalar dependências e Chrome com otimizações
USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && which google-chrome-stable \
    && npm ci --only=production \
    && apt-get purge -y --auto-remove wget gnupg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && npm cache clean --force

# Verificar e ajustar permissões do Chrome
RUN if [ -f /usr/bin/google-chrome-stable ]; then \
    chmod -R o+rx /usr/bin/google-chrome-stable && \
    ls -la /usr/bin/google-chrome-stable && \
    google-chrome-stable --version; \
    else \
    echo "Chrome não foi instalado corretamente" && exit 1; \
    fi

COPY . .

# Garantir permissões corretas para o usuário pptruser
RUN chown -R pptruser:pptruser /app

USER pptruser

EXPOSE 3000

CMD ["npm", "start"]