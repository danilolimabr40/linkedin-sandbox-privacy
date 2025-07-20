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

// Function to check Monday meetings using Zapier
async function checkMondayMeetings(apiKey) {
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

// Check if API key is provided
const apiKey = process.env.ZAPIER_API_KEY;
if (!apiKey) {
  console.error('Please set your ZAPIER_API_KEY environment variable');
  console.log('You can get your API key from: https://zapier.com/app/settings/api');
  process.exit(1);
}

checkMondayMeetings(apiKey);