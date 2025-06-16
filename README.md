# Rally Sim Fans Extractor API

API para extrair dados de rally do site Rally Sim Fans, configurada com nginx e certificado SSL para o domínio rafaelbastiani.com.

## 🚀 Configuração e Deploy

### Pré-requisitos

- Docker e Docker Compose instalados
- Domínio rafaelbastiani.com apontando para o servidor
- Portas 80 e 443 abertas no firewall

### 1. Configuração Inicial

```bash
# Clone o repositório
git clone <seu-repositorio>
cd rallysimfans-extract

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 2. Configuração do SSL (Let's Encrypt)

```bash
# Execute o script de inicialização do SSL
./init-letsencrypt.sh
```

Este script irá:
- Criar certificados temporários
- Iniciar o nginx
- Solicitar certificados reais do Let's Encrypt
- Recarregar o nginx com os certificados válidos

### 3. Executar a Aplicação

```bash
# Construir e executar todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Verificar status dos containers
docker-compose ps
```

### 4. Renovação Automática de Certificados

Para configurar a renovação automática dos certificados SSL:

```bash
# Adicionar ao crontab
crontab -e

# Adicionar esta linha para renovar diariamente às 12h
0 12 * * * /caminho/completo/para/rallysimfans-extract/renew-certificates.sh
```

## 📡 Endpoints da API

A API estará disponível em `https://rafaelbastiani.com/`

### Endpoints Disponíveis:

- `GET /health` - Health check da aplicação
- `GET /api/online/rally-table` - Lista de rallies online
- `GET /api/online/rally-online-results` - Resultados de rally específico

### Exemplo de uso:

```bash
# Health check
curl https://rafaelbastiani.com/health

# Obter lista de rallies
curl https://rafaelbastiani.com/api/online/rally-table

# Obter resultados
curl https://rafaelbastiani.com/api/online/rally-online-results
```

## 🔧 Configuração do Nginx

O nginx está configurado como proxy reverso com:

- **SSL/TLS**: Certificados Let's Encrypt com renovação automática
- **Security Headers**: HSTS, X-Frame-Options, etc.
- **Rate Limiting**: 10 requests/segundo para endpoints da API
- **Gzip Compression**: Habilitado para melhor performance
- **HTTP to HTTPS Redirect**: Redirecionamento automático

## 🐳 Estrutura Docker

### Serviços:

1. **app**: Aplicação Node.js/TypeScript
2. **nginx**: Proxy reverso com SSL
3. **certbot**: Gerenciamento de certificados SSL

### Volumes:

- `./nginx/`: Configurações do nginx
- `./certbot/`: Certificados e configurações SSL
- `./.wwebjs/`: Dados do WhatsApp Web
- `./src/db/`: Banco de dados SQLite

## 🔒 Segurança

### Implementações de Segurança:

- **Non-root user**: Container executa com usuário não-privilegiado
- **SSL/TLS**: Certificados válidos com configurações seguras
- **Rate Limiting**: Proteção contra abuso da API
- **Security Headers**: Headers de segurança configurados
- **Health Checks**: Monitoramento automático da aplicação

## 📝 Logs e Monitoramento

```bash
# Ver logs da aplicação
docker-compose logs app

# Ver logs do nginx
docker-compose logs nginx

# Ver logs em tempo real
docker-compose logs -f

# Verificar status dos certificados
docker-compose run --rm certbot certificates
```

## 🛠️ Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Reconstruir e reiniciar
docker-compose up --build -d

# Renovar certificados manualmente
./renew-certificates.sh

# Verificar configuração do nginx
docker-compose exec nginx nginx -t

# Recarregar configuração do nginx
docker-compose exec nginx nginx -s reload
```

## 🚨 Troubleshooting

### Problemas Comuns:

1. **Certificado SSL não funciona**:
   - Verifique se o domínio está apontando corretamente
   - Execute `./init-letsencrypt.sh` novamente

2. **API não responde**:
   - Verifique logs: `docker-compose logs app`
   - Verifique se o container está rodando: `docker-compose ps`

3. **Nginx não inicia**:
   - Verifique configuração: `docker-compose exec nginx nginx -t`
   - Verifique logs: `docker-compose logs nginx`

## 📞 Suporte

Para suporte, verifique os logs e entre em contato com o desenvolvedor.

---

**Desenvolvido por Rafael Bastiani**