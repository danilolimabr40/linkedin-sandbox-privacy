# Monday Meetings Checker

Este projeto usa a integração MCP Zapier e Google Calendar para verificar suas reuniões de segunda-feira.

## Configuração

### Opção 1: Google Calendar (Recomendado)

1. **Configure o Google Calendar:**
   ```bash
   node setup_google_auth.js
   ```
   
   Siga as instruções para:
   - Criar um projeto no Google Cloud Console
   - Ativar a Google Calendar API
   - Baixar as credenciais OAuth2
   - Autorizar o aplicativo

2. **Ou use uma API key simples:**
   ```bash
   export GOOGLE_CALENDAR_API_KEY="sua_api_key"
   ```

### Opção 2: Zapier

1. **Obtenha sua API Key do Zapier:**
   - Acesse: https://zapier.com/app/settings/api
   - Gere uma nova API key

2. **Configure a variável de ambiente:**
   ```bash
   export ZAPIER_API_KEY="sua_api_key_aqui"
   ```

### Instalação

```bash
npm install
```

## Uso

Para verificar suas reuniões de segunda-feira:

### Google Calendar:
```bash
node check_google_calendar.js
```

### Zapier:
```bash
npm run check-meetings
```

ou

```bash
node check_monday_meetings.js
```

## Configuração MCP

O arquivo `mcp-config.json` está configurado para usar o servidor MCP Zapier. Certifique-se de:

1. Substituir `YOUR_ZAPIER_API_KEY_HERE` pela sua API key real
2. Configurar o MCP em seu editor/IDE para usar este arquivo de configuração

## Funcionalidades

- ✅ Verifica automaticamente a data da próxima segunda-feira
- ✅ Lista todas as reuniões agendadas
- ✅ Mostra horário, local e descrição das reuniões
- ✅ Integração com calendários conectados ao Zapier

## Suporte

Se você encontrar problemas, verifique:
- Se sua API key está correta
- Se você tem calendários conectados ao Zapier
- Se as permissões estão configuradas corretamente