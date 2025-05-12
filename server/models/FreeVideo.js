const mongoose = require('mongoose');

// Define the nested schemas first
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
  isCreator: { type: Boolean, default: false }
});

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  reactions: [ReactionSchema],
  replies: [ReplySchema],
  isCreator: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false }
});

// Define coding-specific schemas
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

// Main FreeVideo schema
const FreeVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  uploader: { type: String, required: true },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['video', 'short'], required: true },

  // Coding-specific fields
  description: { type: String },
  programmingLanguages: [{ type: String }], // Primary languages used
  frameworks: [{ type: String }], // Frameworks or libraries used
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  codeSnippets: [CodeSnippetSchema], // Code snippets featured in the video
  resources: [ResourceSchema], // Additional resources related to the video

  // Standard video fields
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Additional metadata
  tags: [{ type: String }], // Searchable tags
  duration: { type: Number } // Video duration in seconds
});

// Add text indexes for search functionality
FreeVideoSchema.index({
  title: 'text',
  description: 'text',
  programmingLanguages: 'text',
  frameworks: 'text',
  tags: 'text'
});

module.exports = mongoose.model('FreeVideo', FreeVideoSchema);