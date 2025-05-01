const mongoose = require('mongoose');

const ChannelVerificationSchema = new mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Verification status
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

  // Verification requirements
  identityVerified: { type: Boolean, default: false },
  guidelinesAccepted: { type: Boolean, default: false },

  // Identity verification documents
  identityDocument: {
    documentType: {
      type: String,
      enum: ['national_id', 'passport', 'driving_license']
    },
    documentNumber: { type: String },
    documentImageUrl: { type: String },
    verificationDate: { type: Date }
  },

  // Contact information for verification
  contactPhone: { type: String },
  contactEmail: { type: String },

  // Admin who processed the verification
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
ChannelVerificationSchema.index({ status: 1 });
ChannelVerificationSchema.index({ applicationDate: 1 });

module.exports = mongoose.model('ChannelVerification', ChannelVerificationSchema);
