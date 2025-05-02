const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  // User who requested the withdrawal
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type of withdrawal (creator or admin)
  withdrawalType: {
    type: String,
    enum: ['creator', 'admin'],
    default: 'creator'
  },

  // Amount requested for withdrawal (in Pakistani Rupees)
  amount: {
    type: Number,
    required: true,
    min: 0
  },

  // Payment method selected for withdrawal
  paymentMethod: {
    type: String,
    enum: ['jazzCash', 'easyPaisa', 'payFast', 'bankTransfer'],
    required: true
  },

  // Payment details used for this withdrawal
  paymentDetails: {
    accountName: { type: String },
    accountNumber: { type: String },
    bankName: { type: String }
  },

  // Status of the withdrawal request
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },

  // Reason for rejection (if applicable)
  rejectionReason: {
    type: String
  },

  // Admin who processed the withdrawal
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Timestamps
  requestDate: {
    type: Date,
    default: Date.now
  },

  processedDate: {
    type: Date
  },

  // Transaction reference (provided by payment processor)
  transactionReference: {
    type: String
  }
});

// Create indexes for faster queries
WithdrawalSchema.index({ user: 1, requestDate: -1 });
WithdrawalSchema.index({ status: 1 });

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
