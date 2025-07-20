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

// MCP Protocol functions
async function initializeMCP() {
  try {
    console.log('🔧 Inicializando conexão MCP com Zapier...');
    
    const response = await axios.post(`${MCP_ZAPIER_URL}/initialize`, {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: "monday-meetings-checker",
        version: "1.0.0"
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Conexão MCP inicializada com sucesso!');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao inicializar MCP:', error.message);
    return null;
  }
}

async function listTools() {
  try {
    console.log('🔍 Listando ferramentas disponíveis...');
    
    const response = await axios.post(`${MCP_ZAPIER_URL}/tools/list`, {
      arguments: {}
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Ferramentas disponíveis:', response.data.tools?.length || 0);
    return response.data.tools || [];
  } catch (error) {
    console.error('❌ Erro ao listar ferramentas:', error.message);
    return [];
  }
}

async function callTool(toolName, arguments) {
  try {
    console.log(`🔧 Chamando ferramenta: ${toolName}`);
    
    const response = await axios.post(`${MCP_ZAPIER_URL}/tools/call`, {
      name: toolName,
      arguments: arguments
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao chamar ferramenta ${toolName}:`, error.message);
    return null;
  }
}

async function checkCalendarWithMCP() {
  try {
    console.log('🚀 Iniciando verificação de reuniões via MCP Zapier...\n');
    
    // Initialize MCP connection
    const initResult = await initializeMCP();
    if (!initResult) {
      console.log('❌ Falha ao inicializar MCP. Tentando método direto...');
      return await tryDirectMethod();
    }

    // List available tools
    const tools = await listTools();
    
    if (tools.length === 0) {
      console.log('❌ Nenhuma ferramenta disponível. Tentando método direto...');
      return await tryDirectMethod();
    }

    console.log('\n📋 Ferramentas disponíveis:');
    tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name} - ${tool.description || 'Sem descrição'}`);
    });

    // Try to find calendar-related tools
    const calendarTools = tools.filter(tool => 
      tool.name.toLowerCase().includes('calendar') ||
      tool.name.toLowerCase().includes('event') ||
      tool.name.toLowerCase().includes('meeting') ||
      tool.description?.toLowerCase().includes('calendar') ||
      tool.description?.toLowerCase().includes('event') ||
      tool.description?.toLowerCase().includes('meeting')
    );

    if (calendarTools.length > 0) {
      console.log('\n📅 Ferramentas de calendário encontradas:');
      calendarTools.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name} - ${tool.description || 'Sem descrição'}`);
      });

      // Try to use the first calendar tool
      const nextMonday = getNextMonday();
      const startDate = new Date(nextMonday);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(nextMonday);
      endDate.setHours(23, 59, 59, 999);

      console.log(`\n📅 Verificando reuniões para: ${nextMonday.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);

      for (const tool of calendarTools) {
        try {
          const result = await callTool(tool.name, {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            date: nextMonday.toISOString().split('T')[0]
          });

          if (result && result.content) {
            console.log(`✅ Resultado da ferramenta ${tool.name}:`);
            console.log(result.content);
            return;
          }
        } catch (error) {
          console.log(`❌ Ferramenta ${tool.name} falhou:`, error.message);
        }
      }
    }

    // If no calendar tools found, try all tools
    console.log('\n🔄 Tentando todas as ferramentas disponíveis...');
    const nextMonday = getNextMonday();
    
    for (const tool of tools.slice(0, 5)) { // Try first 5 tools
      try {
        const result = await callTool(tool.name, {
          date: nextMonday.toISOString().split('T')[0],
          query: "meetings for next monday"
        });

        if (result && result.content) {
          console.log(`✅ Resultado da ferramenta ${tool.name}:`);
          console.log(result.content);
          return;
        }
      } catch (error) {
        console.log(`❌ Ferramenta ${tool.name} falhou:`, error.message);
      }
    }

    console.log('❌ Nenhuma ferramenta funcionou. Tentando método direto...');
    return await tryDirectMethod();

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return await tryDirectMethod();
  }
}

async function tryDirectMethod() {
  try {
    console.log('🔄 Tentando método direto...');
    
    const nextMonday = getNextMonday();
    const startDate = new Date(nextMonday);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(nextMonday);
    endDate.setHours(23, 59, 59, 999);

    console.log(`📅 Verificando reuniões para: ${nextMonday.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);

    // Try different possible endpoints
    const endpoints = [
      '/api/calendar/events',
      '/api/events',
      '/api/meetings',
      '/calendar/events',
      '/events',
      '/meetings'
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
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            date: nextMonday.toISOString().split('T')[0]
          },
          timeout: 5000
        });

        if (response.data) {
          console.log(`✅ Resposta recebida de ${endpoint}:`);
          console.log(JSON.stringify(response.data, null, 2));
          return;
        }
      } catch (endpointError) {
        console.log(`❌ Endpoint ${endpoint} não funcionou`);
      }
    }

    console.log('❌ Nenhum método funcionou. Verifique a configuração do MCP Zapier.');
    console.log('\n💡 Sugestões:');
    console.log('1. Verifique se a URL do MCP Zapier está correta');
    console.log('2. Verifique se o servidor MCP Zapier está ativo');
    console.log('3. Tente usar o Google Calendar diretamente');

  } catch (error) {
    console.error('❌ Erro no método direto:', error.message);
  }
}

// Main function
async function main() {
  await checkCalendarWithMCP();
}

main();