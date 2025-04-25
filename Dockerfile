FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

COPY package*.json ./

# Configurar variáveis de ambiente do Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
ENV PUPPETEER_ARGS="--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-setuid-sandbox --no-first-run --no-zygote --single-process"

# Instalar dependências e Chrome com otimizações
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg2 \
    ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && ln -sf /usr/bin/google-chrome-stable /usr/bin/google-chrome \
    && npm ci --only=production \
    && apt-get purge -y --auto-remove wget gnupg2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && npm cache clean --force

# Verificar a instalação do Chrome
RUN google-chrome --version || echo "Chrome não instalado corretamente"

COPY . .

USER pptruser

EXPOSE 3000

CMD ["npm", "start"]