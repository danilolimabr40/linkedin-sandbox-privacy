const axios = require('axios');

// Function to get Monday's date
function getMondayDate() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  
  // Calculate days to subtract to get to Monday (0 = Sunday, 1 = Monday, etc.)
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(today.getDate() - daysToSubtract);
  
  return monday.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

// Function to check Monday meetings using Google Calendar API
async function checkMondayMeetingsGoogle(apiKey) {
  try {
    const mondayDate = getMondayDate();
    console.log(`Checking meetings for Monday, ${mondayDate}...`);
    
    // Google Calendar API endpoint
    const response = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      params: {
        timeMin: `${mondayDate}T00:00:00Z`,
        timeMax: `${mondayDate}T23:59:59Z`,
        singleEvents: true,
        orderBy: 'startTime'
      }
    });
    
    const meetings = response.data.items || [];
    
    if (meetings.length === 0) {
      console.log('No meetings scheduled for Monday.');
    } else {
      console.log(`\nYou have ${meetings.length} meeting(s) on Monday:\n`);
      
      meetings.forEach((meeting, index) => {
        const start = meeting.start.dateTime || meeting.start.date;
        const end = meeting.end.dateTime || meeting.end.date;
        
        console.log(`${index + 1}. ${meeting.summary || 'Untitled Meeting'}`);
        console.log(`   Time: ${start} - ${end}`);
        if (meeting.location) {
          console.log(`   Location: ${meeting.location}`);
        }
        if (meeting.description) {
          console.log(`   Description: ${meeting.description.substring(0, 100)}...`);
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error checking meetings:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Function to check Monday meetings using Zapier API
async function checkMondayMeetingsZapier(apiKey) {
  try {
    const mondayDate = getMondayDate();
    console.log(`Checking meetings for Monday, ${mondayDate}...`);
    
    // Zapier API endpoint for calendar events
    const response = await axios.get('https://api.zapier.com/v1/calendar/events', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      params: {
        start_date: `${mondayDate}T00:00:00Z`,
        end_date: `${mondayDate}T23:59:59Z`
      }
    });
    
    const meetings = response.data;
    
    if (meetings.length === 0) {
      console.log('No meetings scheduled for Monday.');
    } else {
      console.log(`\nYou have ${meetings.length} meeting(s) on Monday:\n`);
      
      meetings.forEach((meeting, index) => {
        console.log(`${index + 1}. ${meeting.summary || 'Untitled Meeting'}`);
        console.log(`   Time: ${meeting.start_time} - ${meeting.end_time}`);
        if (meeting.location) {
          console.log(`   Location: ${meeting.location}`);
        }
        if (meeting.description) {
          console.log(`   Description: ${meeting.description.substring(0, 100)}...`);
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error checking meetings:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Main function to check which API to use
async function checkMondayMeetings() {
  const zapierApiKey = process.env.ZAPIER_API_KEY;
  const googleApiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  
  if (zapierApiKey) {
    console.log('Using Zapier API...');
    await checkMondayMeetingsZapier(zapierApiKey);
  } else if (googleApiKey) {
    console.log('Using Google Calendar API...');
    await checkMondayMeetingsGoogle(googleApiKey);
  } else {
    console.log('❌ No API key found!');
    console.log('\nPara verificar suas reuniões de segunda-feira, você precisa configurar uma das opções:');
    console.log('\n1. Zapier API:');
    console.log('   - Acesse: https://zapier.com/app/settings/api');
    console.log('   - Gere uma API key');
    console.log('   - Configure: export ZAPIER_API_KEY="sua_api_key"');
    console.log('\n2. Google Calendar API:');
    console.log('   - Acesse: https://console.cloud.google.com/');
    console.log('   - Ative a Google Calendar API');
    console.log('   - Gere uma API key');
    console.log('   - Configure: export GOOGLE_CALENDAR_API_KEY="sua_api_key"');
    console.log('\nDepois execute: node check_monday_meetings_alternative.js');
  }
}

checkMondayMeetings();