require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  console.log('Testing Gemini API...\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('No API key found!');
    return;
  }
  
  console.log('API Key found\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    console.log('Testing: gemini-2.0-flash');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say hello");
    const response = result.response.text();
    
    console.log('SUCCESS!');
    console.log('Response:', response);
    
  } catch (error) {
    console.log('Failed:', error.message);
  }
}

testGemini();