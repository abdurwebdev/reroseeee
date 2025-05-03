const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    // Participants in the conversation
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    
    // Last message in the conversation (for preview)
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    
    // Conversation type (individual or group)
    type: {
      type: String,
      enum: ['individual', 'group'],
      default: 'individual'
    },
    
    // Group name (only for group conversations)
    name: {
      type: String,
      trim: true
    },
    
    // Group image (only for group conversations)
    image: {
      type: String
    },
    
    // Group admin (only for group conversations)
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Unread message counts for each participant
    unreadCounts: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        count: {
          type: Number,
          default: 0
        }
      }
    ],
    
    // Whether the conversation is archived for each participant
    archived: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        status: {
          type: Boolean,
          default: false
        }
      }
    ],
    
    // Whether the conversation is muted for each participant
    muted: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        status: {
          type: Boolean,
          default: false
        },
        until: {
          type: Date
        }
      }
    ]
  },
  { timestamps: true }
);

// Index for faster queries
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ 'unreadCounts.user': 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
