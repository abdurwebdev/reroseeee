const mongoose = require('mongoose');

const UserHistorySchema = new mongoose.Schema({
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
  watchedAt: {
    type: Date,
    default: Date.now
  },
  watchTimeSeconds: {
    type: Number,
    default: 0
  }
});

// Compound index to ensure a user can only have one history entry per video
// (will update the existing entry if they watch the same video again)
UserHistorySchema.index({ user: 1, video: 1 }, { unique: true });

module.exports = mongoose.model('UserHistory', UserHistorySchema);
