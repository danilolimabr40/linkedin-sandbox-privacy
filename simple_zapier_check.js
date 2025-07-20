const axios = require('axios');

// Function to get next Monday's date
function getNextMonday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  return nextMonday;
}

async function checkZapierAccess() {
  console.log('🔍 Verificando acesso ao Zapier...\n');
  
  const nextMonday = getNextMonday();
  console.log(`📅 Verificando reuniões para: ${nextMonday.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  
  // Try different Zapier endpoints
  const endpoints = [
    'https://api.zapier.com/v1/calendar/events',
    'https://api.zapier.com/v1/events',
    'https://api.zapier.com/v1/meetings',
    'https://hooks.zapier.com/hooks/catch/',
    'https://mcp.zapier.com/',
    'https://zapier.com/api/v1/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔗 Testando: ${endpoint}`);
      
      const response = await axios.get(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Monday-Meetings-Checker/1.0'
        },
        params: {
          start_date: nextMonday.toISOString().split('T')[0],
          end_date: nextMonday.toISOString().split('T')[0]
        },
        timeout: 5000
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📄 Tipo de conteúdo: ${response.headers['content-type']}`);
      
      if (response.data) {
        console.log('📋 Resposta recebida:');
        console.log(JSON.stringify(response.data, null, 2));
        return;
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Tipo: ${error.response.headers['content-type']}`);
      }
    }
  }
  
  console.log('\n❌ Nenhum endpoint do Zapier funcionou.');
  console.log('\n💡 O MCP Zapier pode estar:');
  console.log('1. Temporariamente indisponível');
  console.log('2. Requerendo autenticação específica');
  console.log('3. Usando um protocolo diferente');
  console.log('4. A URL pode estar incorreta');
  
  console.log('\n🔧 Alternativas:');
  console.log('1. Use o Google Calendar diretamente');
  console.log('2. Configure uma API key do Zapier');
  console.log('3. Use outro provedor de calendário');
}

// Also try to decode the base64 URL to understand the structure
function decodeZapierURL() {
  console.log('\n🔍 Decodificando URL do MCP Zapier...');
  
  const encodedPart = 'OWZhMDJkZDgtNGRjYS00YmMzLWFjZDctMDNkZTY5Y2MwZDc5OmFkYzk4MDhiLTZmNDgtNGZmNS1hMWUyLTBiYjBiYzY5ZmVjNw==';
  
  try {
    const decoded = Buffer.from(encodedPart, 'base64').toString('utf-8');
    console.log('✅ URL decodificada:', decoded);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(decoded);
      console.log('📋 Estrutura da URL:', JSON.stringify(parsed, null, 2));
    } catch (parseError) {
      console.log('📋 Conteúdo da URL:', decoded);
    }
    
  } catch (error) {
    console.log('❌ Erro ao decodificar:', error.message);
  }
}

async function main() {
  decodeZapierURL();
  await checkZapierAccess();
}

main();