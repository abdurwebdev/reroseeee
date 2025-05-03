const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    // Conversation this message belongs to
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    
    // Sender of the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Message content
    content: {
      type: String,
      required: true,
      trim: true
    },
    
    // Message type (text, image, etc.)
    type: {
      type: String,
      enum: ['text', 'image', 'audio', 'video', 'file'],
      default: 'text'
    },
    
    // Media URL (for non-text messages)
    mediaUrl: {
      type: String
    },
    
    // Read status for each participant
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    
    // Whether the message has been deleted
    isDeleted: {
      type: Boolean,
      default: false
    },
    
    // Whether the message has been edited
    isEdited: {
      type: Boolean,
      default: false
    },
    
    // Original content (if edited)
    originalContent: {
      type: String
    },
    
    // Reply to another message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  { timestamps: true }
);

// Create indexes for faster queries
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', MessageSchema);
