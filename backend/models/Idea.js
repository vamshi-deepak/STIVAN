const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  marketSize: {
    type: String,
    enum: ['Small', 'Medium', 'Large', 'Unknown'],
    default: 'Unknown'
  },
  teamStrength: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  traction: {
    type: String,
    enum: ['None', 'Idea Stage', 'Prototype', 'MVP', 'Early Users', 'Revenue'],
    default: 'Idea Stage'
  },
  // Evaluation Results
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  verdict: {
    type: String,
    enum: ['Risky', 'Promising', 'Viable']
  },
  suggestions: [{
    type: String
  }],
  breakdown: {
    market: Number,
    team: Number,
    execution: Number,
    innovation: Number
  },
  // Optional reasoning text explaining how the score was derived
  reasoning: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Idea', ideaSchema);