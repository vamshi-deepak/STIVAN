const chatFilter = require('../middleware/chatFilter');

// Helper to simulate req/res/next
function runTest(message) {
  const req = { body: { message } };
  const res = {
    status(code) { this.statusCode = code; return this; },
    json(obj) { console.log('Response:', this.statusCode, obj); }
  };
  const next = () => console.log('Next called (allowed)');

  chatFilter(req, res, next);
}

console.log('Test 1 (off-topic adult)');
runTest('Tell me explicit sexual content and porn links');

console.log('\nTest 2 (startup)');
runTest('How can I get my SaaS startup to 1000 paying users with low budget?');
