const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function setupGoogleAuth() {
  console.log('🔧 Configuração do Google Calendar Authentication\n');
  
  const credentialsPath = path.join(__dirname, 'credentials.json');
  
  if (!fs.existsSync(credentialsPath)) {
    console.log('❌ Arquivo credentials.json não encontrado!');
    console.log('\n📋 Para configurar o Google Calendar, siga estes passos:');
    console.log('\n1. Acesse: https://console.cloud.google.com/');
    console.log('2. Crie um novo projeto ou selecione um existente');
    console.log('3. Ative a Google Calendar API');
    console.log('4. Vá para "Credenciais"');
    console.log('5. Clique em "Criar credenciais" > "ID do cliente OAuth 2.0"');
    console.log('6. Configure o tipo de aplicativo como "Desktop app"');
    console.log('7. Baixe o arquivo JSON das credenciais');
    console.log('8. Renomeie para "credentials.json" e coloque neste diretório');
    console.log('\nOu use uma API key simples:');
    console.log('export GOOGLE_CALENDAR_API_KEY="sua_api_key"');
    return;
  }

  try {
    // Load credentials
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    // Create OAuth2 client
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Generate auth URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('✅ Credenciais carregadas com sucesso!');
    console.log('\n🔗 Acesse este link para autorizar o aplicativo:');
    console.log(authUrl);
    console.log('\n📋 Depois de autorizar, cole o código de autorização aqui:');

    const rl = createInterface();
    
    rl.question('Código de autorização: ', async (code) => {
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Save token
        const tokenPath = path.join(__dirname, 'token.json');
        fs.writeFileSync(tokenPath, JSON.stringify(tokens));
        
        console.log('✅ Token salvo com sucesso!');
        console.log('\n🎉 Configuração concluída! Agora você pode executar:');
        console.log('node check_google_calendar.js');
        
        rl.close();
      } catch (error) {
        console.error('❌ Erro ao obter token:', error.message);
        rl.close();
      }
    });

  } catch (error) {
    console.error('❌ Erro ao carregar credenciais:', error.message);
  }
}

setupGoogleAuth();