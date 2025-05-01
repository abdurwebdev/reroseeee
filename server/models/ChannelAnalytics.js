const mongoose = require('mongoose');

const DailyAnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  views: { type: Number, default: 0 },
  watchTimeMinutes: { type: Number, default: 0 },
  subscribersGained: { type: Number, default: 0 },
  subscribersLost: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 }
});

const VideoAnalyticsSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'FreeVideo', required: true },
  title: { type: String, required: true },
  views: { type: Number, default: 0 },
  watchTimeMinutes: { type: Number, default: 0 },
  averageViewDurationSeconds: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  dailyData: [DailyAnalyticsSchema]
});

const LivestreamAnalyticsSchema = new mongoose.Schema({
  livestreamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Livestream', required: true },
  title: { type: String, required: true },
  peakConcurrentViewers: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  watchTimeMinutes: { type: Number, default: 0 },
  averageViewDurationSeconds: { type: Number, default: 0 },
  chatMessages: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  startTime: { type: Date },
  endTime: { type: Date },
  duration: { type: Number } // Duration in minutes
});

const ChannelAnalyticsSchema = new mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Overall channel metrics
  totalViews: { type: Number, default: 0 },
  totalWatchTimeMinutes: { type: Number, default: 0 },
  totalSubscribers: { type: Number, default: 0 },
  totalVideos: { type: Number, default: 0 },
  totalShorts: { type: Number, default: 0 },
  totalLivestreams: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },

  // Daily analytics data
  dailyData: [DailyAnalyticsSchema],

  // Video-specific analytics
  videoAnalytics: [VideoAnalyticsSchema],

  // Livestream-specific analytics
  livestreamAnalytics: [LivestreamAnalyticsSchema],

  // Audience demographics (simplified)
  demographics: {
    ageGroups: {
      under18: { type: Number, default: 0 }, // Percentage
      age18to24: { type: Number, default: 0 },
      age25to34: { type: Number, default: 0 },
      age35to44: { type: Number, default: 0 },
      age45to54: { type: Number, default: 0 },
      age55plus: { type: Number, default: 0 }
    },
    genderDistribution: {
      male: { type: Number, default: 0 }, // Percentage
      female: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    topCountries: [{
      country: { type: String },
      percentage: { type: Number }
    }]
  },

  // Traffic sources
  trafficSources: {
    direct: { type: Number, default: 0 }, // Percentage
    suggested: { type: Number, default: 0 },
    search: { type: Number, default: 0 },
    external: { type: Number, default: 0 },
    notifications: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },

  // Last updated timestamp
  lastUpdated: { type: Date, default: Date.now }
});

// Create indexes for faster queries
// Note: channelId already has an index due to unique: true
ChannelAnalyticsSchema.index({ 'videoAnalytics.videoId': 1 });
ChannelAnalyticsSchema.index({ 'livestreamAnalytics.livestreamId': 1 });

module.exports = mongoose.model('ChannelAnalytics', ChannelAnalyticsSchema);
