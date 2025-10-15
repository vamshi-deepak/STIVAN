require('dotenv').config();
const { getChatReply } = require('../services/chatService');

async function run() {
  const msg = process.argv.slice(2).join(' ') || 'Hi, give me 3 quick ideas to grow a SaaS at seed stage.';
  console.log('Testing chat with message:', msg);
  const reply = await getChatReply(msg);
  console.log('Reply:', reply);
}

run();
