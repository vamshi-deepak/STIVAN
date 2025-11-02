const fetch = require('node-fetch');
require('dotenv').config();

const BASE = `http://localhost:${process.env.PORT || 5050}`;

async function run() {
  console.log('Integration test: signup/login/evaluate/chat/history');

  // 1) Signup a temporary user
  const email = `testuser${Date.now()}@example.com`;
  const signupRes = await fetch(`${BASE}/api/auth/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
  });
  const signupData = await signupRes.json();
  console.log('Signup:', signupRes.status, signupData.message || signupData.error || '');

  // 2) Login
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) { console.error('Login failed', loginData); return; }
  const token = loginData.token;
  console.log('Logged in, token length:', token?.length || 0);

  // 3) Evaluate idea
  const ideaPayload = {
    title: 'IntegrationTest Idea', description: 'A test idea created by integration script', marketSize: 'Medium', teamStrength: 6, traction: 'Idea Stage'
  };
  const evalRes = await fetch(`${BASE}/api/ideas/evaluate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(ideaPayload)
  });
  const evalData = await evalRes.json();
  console.log('Evaluate:', evalRes.status, evalData.message || evalData.error || '');
  if (!evalRes.ok) return;
  const ideaId = evalData.data._id;
  console.log('Idea ID:', ideaId);

  // 4) Chat about the idea
  const chatRes = await fetch(`${BASE}/api/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ message: 'How can I improve the go-to-market plan?', ideaId })
  });
  const chatData = await chatRes.json();
  console.log('Chat response status:', chatRes.status, 'reply length:', chatData.reply?.length || 0);

  // 5) Fetch chat history for the idea
  const historyRes = await fetch(`${BASE}/api/chat/history?ideaId=${ideaId}`, { headers: { 'Authorization': `Bearer ${token}` } });
  const historyData = await historyRes.json();
  console.log('History count:', historyData.data?.length);
  console.log(historyData.data?.map(m => ({ role: m.role, textPreview: m.text.slice(0,60) })));
}

run().catch(err => console.error('Integration test failed:', err));
