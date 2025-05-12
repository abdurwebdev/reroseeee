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
  password: { type: String },
  googleId: { type: String },
  role: { type: String, enum: ['admin', 'student', 'creator', 'professional_coder'], default: 'student' }, // Added 'professional_coder' role
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
  },
  // Monetization and verification fields
  isMonetized: { type: Boolean, default: false }, // Whether the channel is monetized
  monetizationStatus: {
    type: String,
    enum: ['not_eligible', 'under_review', 'approved', 'rejected'],
    default: 'not_eligible'
  },
  monetizationAppliedDate: { type: Date }, // When the user applied for monetization
  monetizationApprovedDate: { type: Date }, // When monetization was approved
  isVerified: { type: Boolean, default: false }, // Whether the channel is verified
  verificationStatus: {
    type: String,
    enum: ['not_applied', 'under_review', 'approved', 'rejected'],
    default: 'not_applied'
  },
  // Analytics fields for monetization eligibility
  subscriberCount: { type: Number, default: 0 }, // Total subscribers
  totalWatchTimeMinutes: { type: Number, default: 0 }, // Total watch time in minutes
  totalShortViews: { type: Number, default: 0 }, // Total views on shorts
  // Payment information
  paymentMethods: {
    jazzCash: { type: String },
    easyPaisa: { type: String },
    payFast: { type: String },
    bankDetails: {
      accountTitle: { type: String },
      accountNumber: { type: String },
      bankName: { type: String }
    }
  },
  // Earnings tracking
  totalEarnings: { type: Number, default: 0 }, // Total lifetime earnings
  pendingPayout: { type: Number, default: 0 }, // Amount pending for payout
  lastPayoutDate: { type: Date }, // Date of last payout
  lastPayoutAmount: { type: Number }, // Amount of last payout

  // Professional Coder specific fields
  coderVerificationStatus: {
    type: String,
    enum: ['not_applied', 'under_review', 'approved', 'rejected'],
    default: 'not_applied'
  },
  coderVerificationDate: { type: Date }, // When the coder was verified
  programmingLanguages: [{ type: String }], // Languages the coder is proficient in
  yearsOfExperience: { type: Number }, // Years of coding experience
  githubProfile: { type: String }, // GitHub profile URL
  stackOverflowProfile: { type: String }, // StackOverflow profile URL
  linkedInProfile: { type: String }, // LinkedIn profile URL
  portfolioWebsite: { type: String }, // Personal portfolio website
  certifications: [{
    name: { type: String },
    issuer: { type: String },
    year: { type: Number },
    verificationUrl: { type: String }
  }], // Professional certifications
  codeSnippetSubmission: { type: String }, // Code snippet submitted for verification
  technicalAssessmentScore: { type: Number }, // Score from technical assessment
  specializations: [{ type: String }] // Areas of specialization (web dev, mobile, AI, etc.)
});

module.exports = mongoose.model('User', UserSchema);