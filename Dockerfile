FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

COPY package*.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PUPPETEER_ARGS="--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-setuid-sandbox --no-first-run --no-zygote --single-process"

RUN npm ci --only=production

COPY . .

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    npm cache clean --force

EXPOSE 3000

CMD ["npm", "start"]