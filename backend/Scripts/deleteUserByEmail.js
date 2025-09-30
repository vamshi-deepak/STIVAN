const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivan';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function deleteByEmail(email) {
  try {
    await connect();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`No user found with email: ${email}`);
    } else {
      await User.deleteOne({ _id: user._id });
      console.log(`Deleted user with email: ${email}`);
    }
  } catch (err) {
    console.error('Error deleting user:', err);
  } finally {
    mongoose.connection.close();
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/deleteUserByEmail.js <email>');
  process.exit(1);
}

deleteByEmail(email).catch((e) => {
  console.error(e);
  process.exit(1);
});
