const mongoose = require('mongoose');

// Replace this with your actual MONGODB_URI from Render
const MONGODB_URI = 'mongodb+srv://stivanhelp_db_user:mqdtXCZGBmaEmUIS@stivan.ebz5ojr.mongodb.net/stivan?retryWrites=true&w=majority&appName=STIVAN';

console.log('Testing MongoDB Atlas connection...');
console.log('URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB Atlas');
    console.log('Connection state:', mongoose.connection.readyState);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILED! Connection error:', error.message);
    console.error('Error name:', error.name);
    if (error.reason) {
      console.error('Reason:', JSON.stringify(error.reason, null, 2));
    }
    process.exit(1);
  });
