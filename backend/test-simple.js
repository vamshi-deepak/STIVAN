/**
 * Simple Test - STIVAN Analyst Zero
 * Quick test to diagnose issues
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5051';

async function simpleTest() {
  console.log('🧪 Simple STIVAN Analyst Zero Test\n');
  
  const testData = {
    idea_title: 'HealthTrack AI',
    idea_summary: 'AI health monitoring',
    idea_what: 'Predicts diseases before symptoms',
    idea_how: 'Uses wearable data and ML',
    idea_audience: 'Health-conscious adults',
    idea_market_size: 'Large',
    idea_team_strength: 9,
    idea_traction: 'MVP'
  };

  try {
    console.log('📡 Calling POST /api/vision/evaluate...\n');
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${API_BASE}/api/vision/evaluate`, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 second timeout
    });

    console.log('\n✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('\nResponse data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ ERROR!');
    
    if (error.response) {
      // Server responded with error
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // No response from server
      console.error('No response received from server');
      console.error('Is backend running on port 5051?');
    } else {
      // Other error
      console.error('Error message:', error.message);
    }
    
    console.error('\nFull error:', error);
  }
}

simpleTest();
