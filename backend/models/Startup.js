const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // ONE STARTUP PER USER
  },
  name: { 
    type: String, 
    required: true 
  },
  description: {
    type: String,
    required: true
  },
  problem_solving: {
    type: String,
    required: true
  },
  target_audience: {
    type: String,
    required: true
  },
  unique_value_proposition: {
    type: String,
    required: true
  },
  business_model: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  founded_year: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  team_size: {
    type: Number,
    required: true
  },
  funding: {
    total: {
      type: Number,
      default: 0
    },
    rounds: {
      type: Number,
      default: 0
    }
  },
  key_strengths: {
    type: [String],
    default: []
  },
  main_challenges: {
    type: [String],
    default: []
  },
  predictions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction'
  }]
}, { 
  timestamps: true 
});

// Create index for fast lookups
startupSchema.index({ userId: 1 });

module.exports = mongoose.model('Startup', startupSchema);
