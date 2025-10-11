const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 5000 },
  // Optional linkage to an evaluated idea
  idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea' },
  // Cached metrics for quick sorting
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
