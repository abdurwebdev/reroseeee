const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'FreeVideo' },
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['upload', 'like', 'comment', 'subscribe'] },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  thumbnailUrl: { type: String }, // Video thumbnail URL
  uploader: { type: String }, // Channel name
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Channel ID
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student', 'creator'], default: 'student' }, // Added 'creator' role
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  profileImageUrl: { type: String }, // Optional profile image
  bannerImageUrl: { type: String }, // Channel banner image
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users this user is subscribed to
  notifications: [NotificationSchema], // Array of notifications
  lastNotificationSeen: { type: Date, default: Date.now }, // Track when user last checked notifications
  // Channel-related fields
  channelDescription: { type: String, default: '' }, // About section text
  channelJoinDate: { type: Date, default: Date.now }, // When the channel was created
  totalViews: { type: Number, default: 0 }, // Total channel views
  location: { type: String }, // Channel location
  socialLinks: {
    website: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    facebook: { type: String }
  }
});

module.exports = mongoose.model('User', UserSchema);