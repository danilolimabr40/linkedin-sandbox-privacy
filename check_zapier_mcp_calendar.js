const axios = require('axios');

// MCP Zapier server URL from your config
const MCP_ZAPIER_URL = "https://mcp.zapier.com/api/mcp/s/OWZhMDJkZDgtNGRjYS00YmMzLWFjZDctMDNkZTY5Y2MwZDc5OmFkYzk4MDhiLTZmNDgtNGZmNS1hMWUyLTBiYjBiYzY5ZmVjNw==/mcp";

// Function to get next Monday's date
function getNextMonday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  return nextMonday;
}

// Function to format date for API
function formatDateForAPI(date) {
  return date.toISOString();
}

// Function to check calendar using MCP Zapier
async function checkCalendarWithMCPZapier() {
  try {
    console.log('🔍 Verificando suas reuniões da próxima segunda-feira via MCP Zapier...');
    
    const nextMonday = getNextMonday();
    const startDate = new Date(nextMonday);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(nextMonday);
    endDate.setHours(23, 59, 59, 999);

    console.log(`📅 Verificando reuniões para: ${nextMonday.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);

    // Try to get calendar events using MCP Zapier
    const response = await axios.get(`${MCP_ZAPIER_URL}/calendar/events`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        calendar_id: 'primary'
      },
      timeout: 10000
    });

    const events = response.data || [];

    if (events.length === 0) {
      console.log('✅ Nenhuma reunião agendada para segunda-feira!');
    } else {
      console.log(`\n📋 Você tem ${events.length} reunião(ões) na segunda-feira:\n`);
      
      events.forEach((event, index) => {
        console.log(`${index + 1}. 📅 ${event.summary || event.title || 'Reunião sem título'}`);
        
        if (event.start_time || event.start) {
          const startTime = new Date(event.start_time || event.start).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const endTime = new Date(event.end_time || event.end).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          console.log(`   ⏰ Horário: ${startTime} - ${endTime}`);
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
    console.error('❌ Erro ao verificar calendário via MCP Zapier:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    
    console.log('\n🔧 Tentando método alternativo...');
    await tryAlternativeMethod();
  }
}

// Alternative method using different endpoints
async function tryAlternativeMethod() {
  try {
    console.log('🔄 Tentando método alternativo...');
    
    const nextMonday = getNextMonday();
    const startDate = new Date(nextMonday);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(nextMonday);
    endDate.setHours(23, 59, 59, 999);

    // Try different possible endpoints
    const endpoints = [
      '/events',
      '/calendar',
      '/meetings',
      '/appointments'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Tentando endpoint: ${endpoint}`);
        
        const response = await axios.get(`${MCP_ZAPIER_URL}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          params: {
            date: nextMonday.toISOString().split('T')[0],
            start: startDate.toISOString(),
            end: endDate.toISOString()
          },
          timeout: 5000
        });

        if (response.data && response.data.length > 0) {
          console.log(`✅ Encontrado ${response.data.length} evento(s) via ${endpoint}`);
          displayEvents(response.data);
          return;
        }
      } catch (endpointError) {
        console.log(`❌ Endpoint ${endpoint} não funcionou`);
      }
    }

    console.log('❌ Nenhum endpoint funcionou. Verifique a configuração do MCP Zapier.');

  } catch (error) {
    console.error('❌ Erro no método alternativo:', error.message);
  }
}

// Function to display events
function displayEvents(events) {
  if (events.length === 0) {
    console.log('✅ Nenhuma reunião agendada para segunda-feira!');
  } else {
    console.log(`\n📋 Você tem ${events.length} reunião(ões) na segunda-feira:\n`);
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. 📅 ${event.summary || event.title || event.name || 'Reunião sem título'}`);
      
      if (event.start_time || event.start || event.startTime) {
        const startTime = new Date(event.start_time || event.start || event.startTime).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        const endTime = new Date(event.end_time || event.end || event.endTime).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        console.log(`   ⏰ Horário: ${startTime} - ${endTime}`);
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
}

// Main function
async function main() {
  console.log('🚀 Iniciando verificação de reuniões via MCP Zapier...\n');
  await checkCalendarWithMCPZapier();
}

main();