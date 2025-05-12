const mongoose = require('mongoose');

// Define the nested schemas first
const CodeSnippetSchema = new mongoose.Schema({
  language: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  startTime: { type: Number }, // Timestamp in video where this code appears
  endTime: { type: Number } // Timestamp in video where this code ends
});

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['documentation', 'github', 'article', 'tool', 'other'], required: true }
});

const ReactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'dislike'], required: true }
});

const ReplySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  reactions: [ReactionSchema],
  isCreator: { type: Boolean, default: false },
  userProfileImage: { type: String }
});

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  reactions: [ReactionSchema],
  replies: [ReplySchema],
  isCreator: { type: Boolean, default: false },
  userProfileImage: { type: String },
  timestamp: { type: Number } // Optional timestamp in the video
});

// Main CodingVideo schema
const CodingVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  uploader: { type: String, required: true },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['video', 'short'], default: 'video' }, // Video type (regular or short)

  // Coding-specific fields
  programmingLanguages: [{ type: String, required: true }], // Primary languages used
  frameworks: [{ type: String }], // Frameworks or libraries used
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  codeSnippets: [CodeSnippetSchema], // Code snippets featured in the video
  resources: [ResourceSchema], // Additional resources related to the video

  // Standard video fields
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },

  // Additional metadata
  tags: [{ type: String }], // Searchable tags
  duration: { type: Number }, // Video duration in seconds
  isVerified: { type: Boolean, default: false }, // Whether the code has been verified
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationNotes: { type: String }, // Notes from the verification process

  // Educational metadata
  learningOutcomes: [{ type: String }], // What viewers will learn
  prerequisites: [{ type: String }], // Required knowledge before watching
  series: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoSeries' }, // If part of a series
  seriesOrder: { type: Number } // Order in the series if applicable
});

// Add text indexes for search functionality
CodingVideoSchema.index({
  title: 'text',
  description: 'text',
  programmingLanguages: 'text',
  frameworks: 'text',
  tags: 'text'
});

module.exports = mongoose.model('CodingVideo', CodingVideoSchema);
