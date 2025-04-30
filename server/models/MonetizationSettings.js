const mongoose = require('mongoose');

const MonetizationSettingsSchema = new mongoose.Schema({
  // Global platform settings
  viewEarningRate: {
    type: Number,
    default: 0.01, // PKR per view
    min: 0
  },
  
  adImpressionRate: {
    type: Number,
    default: 0.05, // PKR per ad impression
    min: 0
  },
  
  adClickRate: {
    type: Number,
    default: 0.50, // PKR per ad click
    min: 0
  },
  
  subscriptionSharingRate: {
    type: Number,
    default: 70, // Percentage shared with creators
    min: 0,
    max: 100
  },
  
  minimumPayoutAmount: {
    type: Number,
    default: 1000, // Minimum PKR for payout
    min: 0
  },
  
  // Payment methods enabled
  paymentMethods: {
    jazzCash: { type: Boolean, default: true },
    easyPaisa: { type: Boolean, default: true },
    payFast: { type: Boolean, default: false },
    bankTransfer: { type: Boolean, default: false }
  },
  
  // Last updated timestamp
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Admin who last updated the settings
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Ensure only one settings document exists
MonetizationSettingsSchema.statics.getSettings = async function() {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }
  
  // Create default settings if none exist
  return await this.create({});
};

module.exports = mongoose.model('MonetizationSettings', MonetizationSettingsSchema);
