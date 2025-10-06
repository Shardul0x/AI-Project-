const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['success', 'investor_match', 'pitch_analysis'],
    required: true
  },
  input: mongoose.Schema.Types.Mixed,
  result: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
