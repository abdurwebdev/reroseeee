const User = require('../models/User');
const FreeVideo = require('../models/FreeVideo');
const Livestream = require('../models/Livestream');
const Earning = require('../models/Earnings');
const ChannelAnalytics = require('../models/ChannelAnalytics');
const ChannelVerification = require('../models/ChannelVerification');
const MonetizationApplication = require('../models/MonetizationApplication');
const MonetizationSettings = require('../models/MonetizationSettings');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/verification';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for documents
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed'));
  }
};

// Create multer upload instance
exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Get studio dashboard overview
 * @public
 */
exports.getStudioOverview = async (req, res) => {
  try {
    const channelId = req.user._id;
    
    // Get channel info
    const channel = await User.findById(channelId).select('-password -notifications');
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }
    
    // Get recent videos (last 5)
    const recentVideos = await FreeVideo.find({ uploaderId: channelId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recent livestreams (last 5)
    const recentLivestreams = await Livestream.find({ user: channelId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recent earnings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEarnings = await Earning.aggregate([
      {
        $match: {
          creator: channelId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get channel analytics
    let analytics = await ChannelAnalytics.findOne({ channelId });
    
    // If no analytics exist yet, create a new document
    if (!analytics) {
      analytics = await ChannelAnalytics.create({
        channelId,
        totalViews: channel.totalViews || 0,
        totalSubscribers: channel.subscriberCount || 0
      });
    }
    
    // Check monetization eligibility
    const isEligibleForMonetization = await checkMonetizationEligibility(channelId);
    
    // Get monetization application status if exists
    const monetizationApplication = await MonetizationApplication.findOne({ channelId });
    
    // Get verification status if exists
    const verificationStatus = await ChannelVerification.findOne({ channelId });
    
    res.status(200).json({
      success: true,
      data: {
        channel,
        recentVideos,
        recentLivestreams,
        recentEarnings: recentEarnings[0] || { totalAmount: 0, count: 0 },
        analytics: {
          totalViews: analytics.totalViews,
          totalWatchTimeMinutes: analytics.totalWatchTimeMinutes,
          totalSubscribers: analytics.totalSubscribers,
          totalVideos: analytics.totalVideos,
          totalShorts: analytics.totalShorts,
          totalLivestreams: analytics.totalLivestreams,
          totalEarnings: analytics.totalEarnings
        },
        monetization: {
          isEligible: isEligibleForMonetization,
          status: channel.monetizationStatus,
          application: monetizationApplication ? {
            status: monetizationApplication.status,
            applicationDate: monetizationApplication.applicationDate
          } : null
        },
        verification: verificationStatus ? {
          status: verificationStatus.status,
          applicationDate: verificationStatus.applicationDate
        } : null
      }
    });
  } catch (error) {
    console.error('Error getting studio overview:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get channel content (videos, shorts, livestreams)
 * @public
 */
exports.getChannelContent = async (req, res) => {
  try {
    const channelId = req.user._id;
    const { type, page = 1, limit = 10, sort = 'newest' } = req.query;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { uploaderId: channelId };
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'most-viewed':
        sortOptions = { views: -1 };
        break;
      case 'least-viewed':
        sortOptions = { views: 1 };
        break;
      case 'most-liked':
        sortOptions = { likes: -1 };
        break;
      default: // newest
        sortOptions = { createdAt: -1 };
    }
    
    // Get videos with pagination
    const videos = await FreeVideo.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await FreeVideo.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        videos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting channel content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get channel analytics
 * @public
 */
exports.getChannelAnalytics = async (req, res) => {
  try {
    const channelId = req.user._id;
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '365d':
        startDate.setDate(startDate.getDate() - 365);
        break;
      default: // 30d
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Get channel analytics
    let analytics = await ChannelAnalytics.findOne({ channelId });
    
    // If no analytics exist yet, create a new document
    if (!analytics) {
      const channel = await User.findById(channelId);
      analytics = await ChannelAnalytics.create({
        channelId,
        totalViews: channel.totalViews || 0,
        totalSubscribers: channel.subscriberCount || 0
      });
    }
    
    // Filter daily data by date range
    const filteredDailyData = analytics.dailyData.filter(data => {
      const dataDate = new Date(data.date);
      return dataDate >= startDate && dataDate <= endDate;
    });
    
    // Get top performing videos
    const topVideos = analytics.videoAnalytics
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    // Get top performing livestreams
    const topLivestreams = analytics.livestreamAnalytics
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalViews: analytics.totalViews,
          totalWatchTimeMinutes: analytics.totalWatchTimeMinutes,
          totalSubscribers: analytics.totalSubscribers,
          totalVideos: analytics.totalVideos,
          totalShorts: analytics.totalShorts,
          totalLivestreams: analytics.totalLivestreams,
          totalEarnings: analytics.totalEarnings
        },
        period: {
          startDate,
          endDate,
          dailyData: filteredDailyData
        },
        topContent: {
          videos: topVideos,
          livestreams: topLivestreams
        },
        demographics: analytics.demographics,
        trafficSources: analytics.trafficSources
      }
    });
  } catch (error) {
    console.error('Error getting channel analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get monetization status and earnings
 * @public
 */
exports.getMonetizationStatus = async (req, res) => {
  try {
    const channelId = req.user._id;
    
    // Get channel info
    const channel = await User.findById(channelId).select('-password -notifications');
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }
    
    // Check monetization eligibility
    const isEligibleForMonetization = await checkMonetizationEligibility(channelId);
    
    // Get monetization application if exists
    const monetizationApplication = await MonetizationApplication.findOne({ channelId });
    
    // Get monetization settings
    const settings = await MonetizationSettings.getSettings();
    
    // Get earnings data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const earningsData = await Earning.aggregate([
      {
        $match: {
          creator: channelId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$source',
          totalEarnings: { $sum: '$amount' },
          creatorEarnings: {
            $sum: {
              $multiply: ['$amount', { $divide: [{ $subtract: [100, '$platformCut'] }, 100] }]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get total earnings
    const totalEarnings = await Earning.aggregate([
      {
        $match: {
          creator: channelId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          creatorTotal: {
            $sum: {
              $multiply: ['$amount', { $divide: [{ $subtract: [100, '$platformCut'] }, 100] }]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get daily earnings for chart
    const dailyEarnings = await Earning.aggregate([
      {
        $match: {
          creator: channelId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          amount: { $sum: '$amount' },
          creatorAmount: {
            $sum: {
              $multiply: ['$amount', { $divide: [{ $subtract: [100, '$platformCut'] }, 100] }]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        monetizationStatus: {
          isEligible: isEligibleForMonetization,
          status: channel.monetizationStatus,
          application: monetizationApplication ? {
            status: monetizationApplication.status,
            applicationDate: monetizationApplication.applicationDate,
            rejectionReason: monetizationApplication.rejectionReason
          } : null,
          requirements: {
            subscribers: {
              required: 1000,
              current: channel.subscriberCount || 0,
              met: (channel.subscriberCount || 0) >= 1000
            },
            watchTime: {
              required: 4000 * 60, // 4000 hours in minutes
              current: channel.totalWatchTimeMinutes || 0,
              met: (channel.totalWatchTimeMinutes || 0) >= (4000 * 60)
            },
            shortViews: {
              required: 10000000, // 10 million
              current: channel.totalShortViews || 0,
              met: (channel.totalShortViews || 0) >= 10000000
            }
          }
        },
        earnings: {
          summary: {
            total: totalEarnings[0] || { totalAmount: 0, creatorTotal: 0, count: 0 },
            bySource: earningsData
          },
          dailyEarnings,
          pendingPayout: channel.pendingPayout || 0,
          lastPayout: {
            date: channel.lastPayoutDate,
            amount: channel.lastPayoutAmount
          },
          paymentMethods: channel.paymentMethods || {},
          settings: {
            platformCut: 100 - settings.subscriptionSharingRate,
            minimumPayoutAmount: settings.minimumPayoutAmount,
            paymentMethods: settings.paymentMethods
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting monetization status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Apply for monetization
 * @public
 */
exports.applyForMonetization = async (req, res) => {
  try {
    const channelId = req.user._id;
    const {
      paymentMethod,
      accountName,
      accountNumber,
      additionalInfo,
      taxId
    } = req.body;
    
    // Check if already applied
    const existingApplication = await MonetizationApplication.findOne({ channelId });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for monetization'
      });
    }
    
    // Check eligibility
    const isEligible = await checkMonetizationEligibility(channelId);
    if (!isEligible) {
      return res.status(400).json({
        success: false,
        message: 'Your channel does not meet the eligibility requirements for monetization'
      });
    }
    
    // Get channel info for metrics
    const channel = await User.findById(channelId);
    const channelCreationDate = channel.channelJoinDate || channel.createdAt;
    const channelAgeInDays = Math.floor((Date.now() - channelCreationDate) / (1000 * 60 * 60 * 24));
    
    // Get video counts
    const videoCount = await FreeVideo.countDocuments({ uploaderId: channelId, type: 'video' });
    const shortCount = await FreeVideo.countDocuments({ uploaderId: channelId, type: 'short' });
    
    // Create monetization application
    const application = new MonetizationApplication({
      channelId,
      paymentMethod,
      paymentDetails: {
        accountName,
        accountNumber,
        additionalInfo
      },
      taxInformation: {
        taxId
      },
      guidelinesAccepted: true,
      contentPolicyAccepted: true,
      ageVerified: true,
      metricsAtApplication: {
        subscriberCount: channel.subscriberCount || 0,
        totalWatchTimeMinutes: channel.totalWatchTimeMinutes || 0,
        totalShortViews: channel.totalShortViews || 0,
        totalVideos: videoCount,
        totalShorts: shortCount,
        channelAgeInDays
      }
    });
    
    await application.save();
    
    // Update user monetization status
    await User.findByIdAndUpdate(channelId, {
      monetizationStatus: 'under_review',
      monetizationAppliedDate: new Date(),
      'paymentMethods.jazzCash': paymentMethod === 'jazzCash' ? accountNumber : undefined,
      'paymentMethods.easyPaisa': paymentMethod === 'easyPaisa' ? accountNumber : undefined,
      'paymentMethods.payFast': paymentMethod === 'payFast' ? accountNumber : undefined,
      'paymentMethods.bankDetails.accountTitle': paymentMethod === 'bankTransfer' ? accountName : undefined,
      'paymentMethods.bankDetails.accountNumber': paymentMethod === 'bankTransfer' ? accountNumber : undefined
    });
    
    res.status(200).json({
      success: true,
      message: 'Monetization application submitted successfully',
      data: {
        application
      }
    });
  } catch (error) {
    console.error('Error applying for monetization:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Apply for channel verification
 * @public
 */
exports.applyForVerification = async (req, res) => {
  try {
    const channelId = req.user._id;
    const {
      documentType,
      documentNumber,
      contactPhone,
      contactEmail
    } = req.body;
    
    // Check if already applied
    const existingApplication = await ChannelVerification.findOne({ channelId });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for verification'
      });
    }
    
    // Get document image URL from uploaded file
    let documentImageUrl = null;
    if (req.file) {
      documentImageUrl = req.file.path;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Identity document is required'
      });
    }
    
    // Create verification application
    const verification = new ChannelVerification({
      channelId,
      identityDocument: {
        documentType,
        documentNumber,
        documentImageUrl,
        verificationDate: new Date()
      },
      contactPhone,
      contactEmail,
      guidelinesAccepted: true,
      identityVerified: false // Will be set to true by admin after review
    });
    
    await verification.save();
    
    // Update user verification status
    await User.findByIdAndUpdate(channelId, {
      verificationStatus: 'under_review'
    });
    
    res.status(200).json({
      success: true,
      message: 'Verification application submitted successfully',
      data: {
        verification
      }
    });
  } catch (error) {
    console.error('Error applying for verification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update payment methods
 * @public
 */
exports.updatePaymentMethods = async (req, res) => {
  try {
    const channelId = req.user._id;
    const {
      paymentMethod,
      accountName,
      accountNumber,
      bankName
    } = req.body;
    
    // Update user payment methods
    const updateData = {};
    
    if (paymentMethod === 'jazzCash') {
      updateData['paymentMethods.jazzCash'] = accountNumber;
    } else if (paymentMethod === 'easyPaisa') {
      updateData['paymentMethods.easyPaisa'] = accountNumber;
    } else if (paymentMethod === 'payFast') {
      updateData['paymentMethods.payFast'] = accountNumber;
    } else if (paymentMethod === 'bankTransfer') {
      updateData['paymentMethods.bankDetails.accountTitle'] = accountName;
      updateData['paymentMethods.bankDetails.accountNumber'] = accountNumber;
      updateData['paymentMethods.bankDetails.bankName'] = bankName;
    }
    
    await User.findByIdAndUpdate(channelId, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Payment methods updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Request payout
 * @public
 */
exports.requestPayout = async (req, res) => {
  try {
    const channelId = req.user._id;
    const { paymentMethod } = req.body;
    
    // Get user info
    const user = await User.findById(channelId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if monetized
    if (!user.isMonetized) {
      return res.status(400).json({
        success: false,
        message: 'Your channel is not monetized'
      });
    }
    
    // Check if pending payout meets minimum amount
    const settings = await MonetizationSettings.getSettings();
    if ((user.pendingPayout || 0) < settings.minimumPayoutAmount) {
      return res.status(400).json({
        success: false,
        message: `You need at least ${settings.minimumPayoutAmount} PKR to request a payout`
      });
    }
    
    // Check if payment method is provided
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }
    
    // Check if payment details are available for the selected method
    let hasPaymentDetails = false;
    
    if (paymentMethod === 'jazzCash' && user.paymentMethods?.jazzCash) {
      hasPaymentDetails = true;
    } else if (paymentMethod === 'easyPaisa' && user.paymentMethods?.easyPaisa) {
      hasPaymentDetails = true;
    } else if (paymentMethod === 'payFast' && user.paymentMethods?.payFast) {
      hasPaymentDetails = true;
    } else if (paymentMethod === 'bankTransfer' && 
               user.paymentMethods?.bankDetails?.accountNumber && 
               user.paymentMethods?.bankDetails?.accountTitle) {
      hasPaymentDetails = true;
    }
    
    if (!hasPaymentDetails) {
      return res.status(400).json({
        success: false,
        message: 'Payment details not found for the selected method'
      });
    }
    
    // Create payout request (this would be implemented in a real system)
    // For now, we'll just update the user's payout history
    const payoutAmount = user.pendingPayout || 0;
    
    await User.findByIdAndUpdate(channelId, {
      pendingPayout: 0,
      lastPayoutDate: new Date(),
      lastPayoutAmount: payoutAmount
    });
    
    res.status(200).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: {
        amount: payoutAmount,
        paymentMethod,
        requestDate: new Date()
      }
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Check monetization eligibility
 * @private
 */
async function checkMonetizationEligibility(channelId) {
  try {
    // Get channel info
    const channel = await User.findById(channelId);
    if (!channel) {
      return false;
    }
    
    // Check subscriber count (1000+)
    const hasEnoughSubscribers = (channel.subscriberCount || 0) >= 1000;
    
    // Check watch time (4000+ hours = 240,000 minutes)
    const hasEnoughWatchTime = (channel.totalWatchTimeMinutes || 0) >= (4000 * 60);
    
    // Check shorts views (10M+)
    const hasEnoughShortViews = (channel.totalShortViews || 0) >= 10000000;
    
    // Channel must meet either the watch time requirement for regular videos
    // OR the views requirement for shorts
    return hasEnoughSubscribers && (hasEnoughWatchTime || hasEnoughShortViews);
  } catch (error) {
    console.error('Error checking monetization eligibility:', error);
    return false;
  }
}
