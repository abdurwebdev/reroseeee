const mongoose = require('mongoose');

const WatchLaterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FreeVideo',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can only have one watch later entry per video
WatchLaterSchema.index({ user: 1, video: 1 }, { unique: true });

module.exports = mongoose.model('WatchLater', WatchLaterSchema);
