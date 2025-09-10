# 🚀 Deploy MaragonFit no Fly.io

## 📋 Pré-requisitos

1. **Instalar Fly CLI**:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Ou baixar de: https://github.com/superfly/flyctl/releases
   ```

2. **Criar conta no Fly.io**:
   - Acesse: https://fly.io/app/sign-up
   - Confirme o email
   - Adicione cartão de crédito (necessário mesmo para plano gratuito)

## 🚀 Deploy Passo a Passo

### 1. **Login no Fly**
```bash
fly auth login
```

### 2. **Navegar para o projeto**
```bash
cd c:\Users\rafae\OneDrive\Desktop\projetoAula
```

### 3. **Criar volume para banco de dados**
```bash
fly volumes create maragonfit_data --region gru --size 1
```

### 4. **Deploy inicial**
```bash
fly launch --no-deploy
```
- Escolha nome: `maragonfit` ou similar
- Região: `gru` (São Paulo)
- Configure PostgreSQL: **NÃO** (usamos SQLite)
- Deploy agora: **NÃO**

### 5. **Deploy final**
```bash
fly deploy
```

### 6. **Abrir aplicação**
```bash
fly open
```

## 🔧 Comandos Úteis

```bash
# Ver status
fly status

# Ver logs
fly logs

# Escalar aplicação
fly scale count 1

# SSH na máquina
fly ssh console

# Ver volumes
fly volumes list

# Redeploy
fly deploy
```

## 🌐 **URLs**
- **App**: https://maragonfit.fly.dev
- **Dashboard**: https://fly.io/apps/maragonfit

## 💰 **Custos**
- **Plano gratuito**: 3 máquinas compartilhadas
- **Volume 1GB**: Gratuito
- **Tráfego**: 160GB/mês gratuito

## 🔍 **Monitoramento**
- Logs em tempo real: `fly logs`
- Métricas: Dashboard Fly.io
- Health checks: Configurados automaticamente

## 🆘 **Troubleshooting**

### Se der erro de deploy:
```bash
fly deploy --verbose
```

### Se não conseguir conectar BD:
```bash
fly ssh console
cd /app/server/database
ls -la
```

### Reiniciar aplicação:
```bash
fly apps restart maragonfit
```

## ✅ **Checklist Final**
- [ ] Fly CLI instalado
- [ ] Conta criada no Fly.io
- [ ] Volume criado
- [ ] Deploy realizado
- [ ] Aplicação funcionando
- [ ] Banco de dados persistindo
