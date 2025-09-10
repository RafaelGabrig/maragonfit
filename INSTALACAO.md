# 🚀 Guia de Instalação - MaragonFit

## 📋 Pré-requisitos

Antes de instalar o MaragonFit, certifique-se de ter:

- **Node.js** versão 14.0 ou superior
- **npm** (incluído com Node.js)
- **Sistema operativo**: Windows, macOS ou Linux
- **Navegador moderno**: Chrome, Firefox, Safari ou Edge

## 📦 Instalação Passo a Passo

### 1. **Preparar o Ambiente**

1. Baixe e extraia o arquivo MaragonFit.zip
2. Abra o terminal/prompt de comando
3. Navegue até a pasta do projeto:
```bash
cd maragonfit
```

### 2. **Instalar Dependências**

Execute o comando para instalar todas as dependências:
```bash
npm install
```

*Este processo pode demorar alguns minutos dependendo da sua conexão.*

### 3. **Configuração Inicial (Opcional)**

Para personalizar as configurações:
1. Copie o arquivo `.env.example` para `.env`
2. Edite as configurações conforme necessário:
   - Porta do servidor
   - Capacidades padrão
   - Informações da empresa

### 4. **Iniciar o Sistema**

Execute o comando para iniciar o servidor:
```bash
npm start
```

### 5. **Acessar o Sistema**

Abra o seu navegador e acesse:
```
http://localhost:3000
```

## ✅ Verificação da Instalação

### Teste Básico
1. **Página inicial carrega**: ✓ Logo e formulários visíveis
2. **Registro funciona**: ✓ Criar novo usuário
3. **Login funciona**: ✓ Entrar no sistema
4. **Painel administrativo**: ✓ Acesso admin/admin

### Teste de Funcionalidades
1. **Criar aula**: ✓ Panel admin → Nova aula
2. **Ver aulas**: ✓ Lista de aulas na página do usuário
3. **Fazer reserva**: ✓ Reservar uma aula
4. **Cancelar reserva**: ✓ Cancelar reserva feita

## 🔧 Configurações Avançadas

### Mudar Porta do Servidor
No arquivo `server/server.js`, altere a linha:
```javascript
const PORT = process.env.PORT || 3000;
```

### Personalizar Logo
Substitua o arquivo:
```
public/assets/images/logofit.jpeg
```

### Configurar Capacidades
No painel administrativo, ao criar aulas, defina a capacidade desejada.

## 🛡️ Configurações de Segurança

### Para Ambiente de Produção
1. **Altere senhas padrão** do administrador
2. **Configure HTTPS** no seu servidor
3. **Use senha forte** para admin
4. **Faça backup** da base de dados regularmente

### Backup da Base de Dados
A base de dados está localizada em:
```
server/database/maragonfit.db
```

## 🌐 Deploy em Servidor

### Servidor Local/VPS
1. Instale Node.js no servidor
2. Transfira os arquivos do projeto
3. Execute `npm install`
4. Configure um processo manager (PM2)
5. Configure proxy reverso (Nginx)

### Exemplo com PM2
```bash
npm install -g pm2
pm2 start server/server.js --name "maragonfit"
pm2 startup
pm2 save
```

## 🔍 Resolução de Problemas

### Problema: "Porta já em uso"
**Solução**: Pare outros serviços na porta 3000 ou altere a porta

### Problema: "Módulo não encontrado"
**Solução**: Execute `npm install` novamente

### Problema: "Erro de permissões"
**Solução**: Execute o terminal como administrador (Windows) ou use `sudo` (Mac/Linux)

### Problema: "Base de dados não encontrada"
**Solução**: A base de dados é criada automaticamente na primeira execução

## 📞 Suporte

Para questões técnicas:
1. Verifique a documentação no README.md
2. Consulte os logs do servidor no terminal
3. Verifique se todas as dependências foram instaladas

## 🎯 Configurações Recomendadas

### Para Ginásios Pequenos (até 50 clientes)
- Capacidade padrão: 10 pessoas por aula
- Horários: 6h às 22h
- Reservas: até 24h antes

### Para Ginásios Médios (50-200 clientes)
- Capacidade padrão: 15 pessoas por aula
- Horários: 5h às 23h
- Reservas: até 48h antes

### Para Ginásios Grandes (200+ clientes)
- Capacidade padrão: 20 pessoas por aula
- Horários: 24h (se aplicável)
- Reservas: até 72h antes

## ✨ Primeiros Passos Após Instalação

### 1. Configurar Administrador
- Acesse o painel administrativo
- Altere a senha padrão
- Configure informações da empresa

### 2. Criar Aulas Iniciais
- Crie 3-5 aulas de exemplo
- Defina horários realistas
- Configure instrutores

### 3. Testar com Usuários
- Crie alguns usuários de teste
- Teste o processo de reserva
- Verifique cancelamentos

### 4. Personalizar Visual
- Substitua o logo pela sua marca
- Ajuste cores se necessário
- Teste em dispositivos móveis

## 🚀 Sistema Pronto!

Parabéns! O MaragonFit está agora instalado e funcionando.

**O seu sistema de gestão profissional está pronto para usar!**
