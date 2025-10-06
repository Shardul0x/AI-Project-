const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  description: String,
  category: String,
  founded_year: Number,
  location: String,
  team_size: Number,
  funding: {
    total: Number,
    rounds: Number
  },
  predictions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Startup', startupSchema);
