const Earning = require('../models/Earnings');
const MonetizationSettings = require('../models/MonetizationSettings');
const FreeVideo = require('../models/FreeVideo');
const Livestream = require('../models/Livestream');
const User = require('../models/User');

/**
 * Record a new earning
 * @private
 */
const recordEarning = async (source, contentId, contentModel, creator, amount, metadata = {}) => {
  try {
    // Get current monetization settings
    const settings = await MonetizationSettings.getSettings();

    // Calculate platform cut
    const platformCut = settings.subscriptionSharingRate || 30;

    // Create new earning record
    const earning = new Earning({
      source,
      contentId,
      contentModel,
      creator,
      amount,
      platformCut,
      metadata
    });

    await earning.save();
    return earning;
  } catch (error) {
    console.error('Error recording earning:', error);
    throw error;
  }
};

/**
 * Record a video view earning
 * @public
 */
exports.recordVideoView = async (req, res) => {
  try {
    const { videoId } = req.body;

    // Get video details
    const video = await FreeVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Get monetization settings
    const settings = await MonetizationSettings.getSettings();

    // Record the earning
    await recordEarning(
      'video_view',
      video._id,
      'FreeVideo',
      video.uploaderId,
      settings.viewEarningRate,
      { videoTitle: video.title }
    );

    res.status(200).json({
      success: true,
      message: 'View earning recorded'
    });
  } catch (error) {
    console.error('Error recording view earning:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Record a livestream view earning
 * @public
 */
exports.recordLivestreamView = async (req, res) => {
  try {
    const { livestreamId } = req.body;

    // Get livestream details
    const livestream = await Livestream.findById(livestreamId);
    if (!livestream) {
      return res.status(404).json({
        success: false,
        message: 'Livestream not found'
      });
    }

    // Get monetization settings
    const settings = await MonetizationSettings.getSettings();

    // Record the earning
    await recordEarning(
      'livestream_view',
      livestream._id,
      'Livestream',
      livestream.user,
      settings.viewEarningRate,
      { livestreamName: livestream.name }
    );

    res.status(200).json({
      success: true,
      message: 'Livestream view earning recorded'
    });
  } catch (error) {
    console.error('Error recording livestream view earning:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Record an ad impression earning
 * @public
 */
exports.recordAdImpression = async (req, res) => {
  try {
    const { contentId, contentType } = req.body;

    let content, creator, contentModel;

    // Get content details based on type
    if (contentType === 'video') {
      content = await FreeVideo.findById(contentId);
      contentModel = 'FreeVideo';
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }
      creator = content.uploaderId;
    } else if (contentType === 'livestream') {
      content = await Livestream.findById(contentId);
      contentModel = 'Livestream';
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Livestream not found'
        });
      }
      creator = content.user;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type'
      });
    }

    // Get monetization settings
    const settings = await MonetizationSettings.getSettings();

    // Record the earning
    await recordEarning(
      'ad_impression',
      content._id,
      contentModel,
      creator,
      settings.adImpressionRate,
      { contentType }
    );

    res.status(200).json({
      success: true,
      message: 'Ad impression earning recorded'
    });
  } catch (error) {
    console.error('Error recording ad impression earning:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Record an ad click earning
 * @public
 */
exports.recordAdClick = async (req, res) => {
  try {
    const { contentId, contentType } = req.body;

    let content, creator, contentModel;

    // Get content details based on type
    if (contentType === 'video') {
      content = await FreeVideo.findById(contentId);
      contentModel = 'FreeVideo';
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }
      creator = content.uploaderId;
    } else if (contentType === 'livestream') {
      content = await Livestream.findById(contentId);
      contentModel = 'Livestream';
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Livestream not found'
        });
      }
      creator = content.user;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type'
      });
    }

    // Get monetization settings
    const settings = await MonetizationSettings.getSettings();

    // Record the earning
    await recordEarning(
      'ad_click',
      content._id,
      contentModel,
      creator,
      settings.adClickRate,
      { contentType }
    );

    res.status(200).json({
      success: true,
      message: 'Ad click earning recorded'
    });
  } catch (error) {
    console.error('Error recording ad click earning:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get admin earnings summary
 * @public
 */
exports.getAdminEarningsSummary = async (req, res) => {
  try {
    // Get date range from query params or use default (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (req.query.days || 30));

    // Aggregate earnings data
    const earningsData = await Earning.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$source',
          totalEarnings: { $sum: '$amount' },
          platformEarnings: {
            $sum: {
              $multiply: ['$amount', { $divide: ['$platformCut', 100] }]
            }
          },
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
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          platformTotal: {
            $sum: {
              $multiply: ['$amount', { $divide: ['$platformCut', 100] }]
            }
          },
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
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          amount: { $sum: '$amount' },
          platformAmount: {
            $sum: {
              $multiply: ['$amount', { $divide: ['$platformCut', 100] }]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top earning content
    const topContent = await Earning.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          contentId: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            contentId: '$contentId',
            contentModel: '$contentModel'
          },
          totalEarnings: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalEarnings: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get top earning creators
    const topCreators = await Earning.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          creator: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$creator',
          totalEarnings: { $sum: '$amount' },
          creatorEarnings: {
            $sum: {
              $multiply: ['$amount', { $divide: [{ $subtract: [100, '$platformCut'] }, 100] }]
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalEarnings: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Populate content details
    const populatedTopContent = [];
    for (const item of topContent) {
      let contentDetails = null;

      if (item._id.contentModel === 'FreeVideo') {
        contentDetails = await FreeVideo.findById(item._id.contentId).select('title uploader thumbnailUrl');
      } else if (item._id.contentModel === 'Livestream') {
        contentDetails = await Livestream.findById(item._id.contentId).select('name user');

        if (contentDetails && contentDetails.user) {
          const user = await User.findById(contentDetails.user).select('name');
          if (user) {
            contentDetails = {
              ...contentDetails.toObject(),
              uploader: user.name
            };
          }
        }
      }

      if (contentDetails) {
        populatedTopContent.push({
          ...item,
          contentDetails
        });
      }
    }

    // Populate creator details
    const populatedTopCreators = [];
    for (const creator of topCreators) {
      const user = await User.findById(creator._id).select('name email profileImageUrl');
      if (user) {
        populatedTopCreators.push({
          ...creator,
          creator: user
        });
      }
    }

    // Get monetization settings
    const settings = await MonetizationSettings.getSettings();

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalEarnings[0] || { totalAmount: 0, platformTotal: 0, creatorTotal: 0, count: 0 },
          bySource: earningsData
        },
        dailyEarnings,
        topContent: populatedTopContent,
        topCreators: populatedTopCreators,
        settings
      }
    });
  } catch (error) {
    console.error('Error getting admin earnings summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update monetization settings
 * @public
 */
exports.updateMonetizationSettings = async (req, res) => {
  try {
    const {
      viewEarningRate,
      adImpressionRate,
      adClickRate,
      subscriptionSharingRate,
      minimumPayoutAmount,
      paymentMethods
    } = req.body;

    // Get current settings
    let settings = await MonetizationSettings.getSettings();

    // Update settings
    if (viewEarningRate !== undefined) settings.viewEarningRate = viewEarningRate;
    if (adImpressionRate !== undefined) settings.adImpressionRate = adImpressionRate;
    if (adClickRate !== undefined) settings.adClickRate = adClickRate;
    if (subscriptionSharingRate !== undefined) settings.subscriptionSharingRate = subscriptionSharingRate;
    if (minimumPayoutAmount !== undefined) settings.minimumPayoutAmount = minimumPayoutAmount;

    if (paymentMethods) {
      if (paymentMethods.jazzCash !== undefined) settings.paymentMethods.jazzCash = paymentMethods.jazzCash;
      if (paymentMethods.easyPaisa !== undefined) settings.paymentMethods.easyPaisa = paymentMethods.easyPaisa;
      if (paymentMethods.payFast !== undefined) settings.paymentMethods.payFast = paymentMethods.payFast;
      if (paymentMethods.bankTransfer !== undefined) settings.paymentMethods.bankTransfer = paymentMethods.bankTransfer;
    }

    // Update timestamp and admin
    settings.updatedAt = new Date();
    settings.updatedBy = req.user._id;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Monetization settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating monetization settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get creator earnings
 * @public
 */
exports.getCreatorEarnings = async (req, res) => {
  try {
    const creatorId = req.user._id;

    // Get date range from query params or use default (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (req.query.days || 30));

    // Aggregate earnings data
    const earningsData = await Earning.aggregate([
      {
        $match: {
          creator: creatorId,
          date: { $gte: startDate, $lte: endDate }
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
          creator: creatorId,
          date: { $gte: startDate, $lte: endDate }
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
          creator: creatorId,
          date: { $gte: startDate, $lte: endDate }
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

    // Get top earning content
    const topContent = await Earning.aggregate([
      {
        $match: {
          creator: creatorId,
          date: { $gte: startDate, $lte: endDate },
          contentId: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            contentId: '$contentId',
            contentModel: '$contentModel'
          },
          totalEarnings: { $sum: '$amount' },
          creatorEarnings: {
            $sum: {
              $multiply: ['$amount', { $divide: [{ $subtract: [100, '$platformCut'] }, 100] }]
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalEarnings: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Populate content details
    const populatedTopContent = [];
    for (const item of topContent) {
      let contentDetails = null;

      if (item._id.contentModel === 'FreeVideo') {
        contentDetails = await FreeVideo.findById(item._id.contentId).select('title thumbnailUrl');
      } else if (item._id.contentModel === 'Livestream') {
        contentDetails = await Livestream.findById(item._id.contentId).select('name');
      }

      if (contentDetails) {
        populatedTopContent.push({
          ...item,
          contentDetails
        });
      }
    }

    // Get monetization settings
    const settings = await MonetizationSettings.getSettings();

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalEarnings[0] || { totalAmount: 0, creatorTotal: 0, count: 0 },
          bySource: earningsData
        },
        dailyEarnings,
        topContent: populatedTopContent,
        settings: {
          platformCut: 100 - settings.subscriptionSharingRate,
          minimumPayoutAmount: settings.minimumPayoutAmount,
          paymentMethods: settings.paymentMethods
        }
      }
    });
  } catch (error) {
    console.error('Error getting creator earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
