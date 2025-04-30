const mongoose = require('mongoose');

const LivestreamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  cloudinaryId: {
    type: String,
    required: true,
    unique: true
  },
  rtmpUrl: {
    type: String,
    required: true
  },
  streamKey: {
    type: String,
    required: true
  },
  playbackUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['idle', 'active', 'ended'],
    default: 'idle'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isScreenSharing: {
    type: Boolean,
    default: false
  },
  viewers: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Livestream', LivestreamSchema);
