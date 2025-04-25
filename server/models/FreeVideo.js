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

// Main FreeVideo schema
const FreeVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  uploader: { type: String, required: true },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['video', 'short'], required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('FreeVideo', FreeVideoSchema);