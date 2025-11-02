const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: false },
  role: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
