const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Function to get next Monday's date
function getNextMonday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  return nextMonday;
}

// Function to format date for Google Calendar API
function formatDateForAPI(date) {
  return date.toISOString();
}

// Function to check Google Calendar meetings
async function checkGoogleCalendarMeetings() {
  try {
    console.log('🔍 Verificando suas reuniões da próxima segunda-feira...');
    
    // Check if credentials file exists
    const credentialsPath = path.join(__dirname, 'credentials.json');
    if (!fs.existsSync(credentialsPath)) {
      console.log('❌ Arquivo de credenciais não encontrado!');
      console.log('\nPara usar o Google Calendar, você precisa:');
      console.log('1. Criar um projeto no Google Cloud Console');
      console.log('2. Ativar a Google Calendar API');
      console.log('3. Criar credenciais OAuth2');
      console.log('4. Salvar as credenciais como "credentials.json" neste diretório');
      console.log('\nOu configure uma API key:');
      console.log('export GOOGLE_CALENDAR_API_KEY="sua_api_key"');
      return;
    }

    // Load credentials
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    // Create OAuth2 client
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if token file exists
    const tokenPath = path.join(__dirname, 'token.json');
    if (!fs.existsSync(tokenPath)) {
      console.log('❌ Token de autenticação não encontrado!');
      console.log('Execute o script de autenticação primeiro.');
      return;
    }

    // Load token
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    oAuth2Client.setCredentials(token);

    // Create Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // Get next Monday
    const nextMonday = getNextMonday();
    const startDate = new Date(nextMonday);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(nextMonday);
    endDate.setHours(23, 59, 59, 999);

    console.log(`📅 Verificando reuniões para: ${nextMonday.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);

    // Get events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    if (events.length === 0) {
      console.log('✅ Nenhuma reunião agendada para segunda-feira!');
    } else {
      console.log(`\n📋 Você tem ${events.length} reunião(ões) na segunda-feira:\n`);
      
      events.forEach((event, index) => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        
        console.log(`${index + 1}. 📅 ${event.summary || 'Reunião sem título'}`);
        
        // Format time
        if (event.start.dateTime) {
          const startTime = new Date(start).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const endTime = new Date(end).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          console.log(`   ⏰ Horário: ${startTime} - ${endTime}`);
        } else {
          console.log(`   📅 Dia inteiro`);
        }
        
        if (event.location) {
          console.log(`   📍 Local: ${event.location}`);
        }
        
        if (event.description) {
          const description = event.description.length > 100 
            ? event.description.substring(0, 100) + '...' 
            : event.description;
          console.log(`   📝 Descrição: ${description}`);
        }
        
        if (event.attendees && event.attendees.length > 0) {
          const attendeeCount = event.attendees.length;
          console.log(`   👥 Participantes: ${attendeeCount} pessoa(s)`);
        }
        
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar o calendário:', error.message);
    if (error.code === 401) {
      console.log('🔑 Token expirado. Execute o script de autenticação novamente.');
    }
  }
}

// Alternative function using API key
async function checkGoogleCalendarWithAPIKey() {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  
  if (!apiKey) {
    console.log('❌ API key do Google Calendar não configurada!');
    console.log('Configure: export GOOGLE_CALENDAR_API_KEY="sua_api_key"');
    return;
  }

  try {
    console.log('🔍 Verificando suas reuniões da próxima segunda-feira...');
    
    const calendar = google.calendar({ version: 'v3', auth: apiKey });
    
    const nextMonday = getNextMonday();
    const startDate = new Date(nextMonday);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(nextMonday);
    endDate.setHours(23, 59, 59, 999);

    console.log(`📅 Verificando reuniões para: ${nextMonday.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    if (events.length === 0) {
      console.log('✅ Nenhuma reunião agendada para segunda-feira!');
    } else {
      console.log(`\n📋 Você tem ${events.length} reunião(ões) na segunda-feira:\n`);
      
      events.forEach((event, index) => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        
        console.log(`${index + 1}. 📅 ${event.summary || 'Reunião sem título'}`);
        
        if (event.start.dateTime) {
          const startTime = new Date(start).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const endTime = new Date(end).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          console.log(`   ⏰ Horário: ${startTime} - ${endTime}`);
        } else {
          console.log(`   📅 Dia inteiro`);
        }
        
        if (event.location) {
          console.log(`   📍 Local: ${event.location}`);
        }
        
        if (event.description) {
          const description = event.description.length > 100 
            ? event.description.substring(0, 100) + '...' 
            : event.description;
          console.log(`   📝 Descrição: ${description}`);
        }
        
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar o calendário:', error.message);
  }
}

// Main function
async function main() {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  
  if (apiKey) {
    await checkGoogleCalendarWithAPIKey();
  } else {
    await checkGoogleCalendarMeetings();
  }
}

main();