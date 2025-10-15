require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('No API key found');
    return;
  }
  
  console.log('Checking available models...\n');
  
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.models) {
      console.log('Available models:');
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
        console.log(`  Methods: ${model.supportedGenerationMethods?.join(', ') || 'none'}`);
      });
    } else {
      console.log('Failed to list models');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log('Error:', error.message);
  }
}

listModels();