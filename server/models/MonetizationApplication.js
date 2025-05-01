const mongoose = require('mongoose');

const MonetizationApplicationSchema = new mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Application status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Application details
  applicationDate: { type: Date, default: Date.now },
  approvalDate: { type: Date },
  rejectionDate: { type: Date },
  rejectionReason: { type: String },

  // Eligibility metrics at time of application
  metricsAtApplication: {
    subscriberCount: { type: Number, required: true },
    totalWatchTimeMinutes: { type: Number, required: true },
    totalShortViews: { type: Number, required: true },
    totalVideos: { type: Number, required: true },
    totalShorts: { type: Number, required: true },
    channelAgeInDays: { type: Number, required: true }
  },

  // Monetization requirements
  guidelinesAccepted: { type: Boolean, default: false },
  contentPolicyAccepted: { type: Boolean, default: false },
  ageVerified: { type: Boolean, default: false },

  // Payment information
  paymentMethod: {
    type: String,
    enum: ['jazzCash', 'easyPaisa', 'payFast', 'bankTransfer'],
    required: true
  },
  paymentDetails: {
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    additionalInfo: { type: String }
  },

  // Tax information
  taxInformation: {
    taxId: { type: String },
    taxDocumentUrl: { type: String }
  },

  // Admin who processed the application
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Notes from admin
  adminNotes: { type: String },

  // Last updated timestamp
  lastUpdated: { type: Date, default: Date.now }
});

// Create indexes for faster queries
// Note: channelId already has an index due to unique: true
MonetizationApplicationSchema.index({ status: 1 });
MonetizationApplicationSchema.index({ applicationDate: 1 });

module.exports = mongoose.model('MonetizationApplication', MonetizationApplicationSchema);
