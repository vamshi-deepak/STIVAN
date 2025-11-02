/**
 * Quick test script for Perplexity API
 * Tests if your API key works with different model names
 */

const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.PERPLEXITY_API_KEY;
const ENDPOINT = 'https://api.perplexity.ai/chat/completions';

// Models to test (from most to least likely to work)
const MODELS_TO_TEST = [
  'llama-3.1-sonar-small-128k-online',
  'llama-3.1-sonar-large-128k-online',
  'sonar-small-online',
  'sonar-medium-online',
  'sonar-pro'
];

async function testModel(modelName) {
  console.log(`\n🧪 Testing model: ${modelName}`);
  
  try {
    const response = await axios.post(
      ENDPOINT,
      {
        model: modelName,
        messages: [
          {
            role: 'user',
            content: 'List 3 major AI health monitoring companies.'
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log(`✅ SUCCESS with ${modelName}`);
    console.log(`📊 Response: ${response.data.choices[0].message.content.substring(0, 200)}...`);
    return modelName;
  } catch (error) {
    console.log(`❌ FAILED with ${modelName}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data).substring(0, 150)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return null;
  }
}

async function testAll() {
  console.log('🔍 Testing Perplexity API Key...');
  console.log(`🔑 API Key: ${API_KEY?.substring(0, 15)}...`);
  console.log(`🌐 Endpoint: ${ENDPOINT}`);
  
  if (!API_KEY) {
    console.log('❌ No API key found in .env file!');
    return;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Testing all available models...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let workingModel = null;
  
  for (const model of MODELS_TO_TEST) {
    const result = await testModel(model);
    if (result) {
      workingModel = result;
      break; // Found working model!
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (workingModel) {
    console.log(`✅ RESULT: Working model found!`);
    console.log(`🎯 Use this in aiModels.js: "${workingModel}"`);
    console.log('\nUpdate backend/config/aiModels.js:');
    console.log(`   model: '${workingModel}',`);
  } else {
    console.log('❌ RESULT: No working models found!');
    console.log('\nPossible issues:');
    console.log('1. API key expired or invalid');
    console.log('2. Perplexity changed their API');
    console.log('3. Account needs upgrade/payment');
    console.log('\nCheck: https://www.perplexity.ai/settings/api');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run the test
testAll().catch(console.error);
