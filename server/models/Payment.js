const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // User who made the payment
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Amount of the payment in PKR
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment gateway used
  gateway: {
    type: String,
    enum: ['jazzCash', 'easyPaisa', 'payFast', 'bankTransfer'],
    required: true
  },
  
  // Payment purpose
  purpose: {
    type: String,
    enum: ['subscription', 'donation', 'premium', 'adCredit', 'other'],
    required: true
  },
  
  // Reference to related entity (e.g., channel ID for subscription)
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  
  // Model name for the reference
  referenceModel: {
    type: String,
    enum: ['User', 'Channel', 'Video', 'Subscription']
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Transaction ID from payment gateway
  transactionId: {
    type: String
  },
  
  // Payment gateway response data
  gatewayResponse: {
    type: Object
  },
  
  // Error message if payment failed
  errorMessage: {
    type: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date
  }
});

// Create indexes for faster queries
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
