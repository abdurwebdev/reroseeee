const mongoose = require('mongoose');

const EarningSchema = new mongoose.Schema({
  // Source of the earning (video, livestream, ad, subscription)
  source: { 
    type: String, 
    required: true,
    enum: ['video_view', 'livestream_view', 'ad_impression', 'ad_click', 'subscription']
  },
  
  // Reference to the content that generated the earning
  contentId: { 
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'contentModel'
  },
  
  // Model type for the contentId reference
  contentModel: {
    type: String,
    required: function() { return this.contentId != null; },
    enum: ['FreeVideo', 'Livestream']
  },
  
  // Creator who earned the revenue (if applicable)
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Amount earned (in Pakistani Rupees)
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Platform's cut (percentage)
  platformCut: {
    type: Number,
    required: true,
    default: 30 // Default 30% platform cut
  },
  
  // Date when the earning was recorded
  date: {
    type: Date,
    default: Date.now
  },
  
  // Additional metadata about the earning
  metadata: {
    type: Object
  }
});

// Create indexes for faster queries
EarningSchema.index({ source: 1, date: 1 });
EarningSchema.index({ creator: 1, date: 1 });

module.exports = mongoose.model('Earning', EarningSchema);
