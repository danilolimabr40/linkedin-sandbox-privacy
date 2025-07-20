# Monday Meetings Checker

Este projeto usa a integração MCP Zapier para verificar suas reuniões de segunda-feira.

## Configuração

1. **Obtenha sua API Key do Zapier:**
   - Acesse: https://zapier.com/app/settings/api
   - Gere uma nova API key

2. **Configure a variável de ambiente:**
   ```bash
   export ZAPIER_API_KEY="sua_api_key_aqui"
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

## Uso

Para verificar suas reuniões de segunda-feira:

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