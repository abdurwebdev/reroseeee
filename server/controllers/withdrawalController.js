const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const MonetizationSettings = require('../models/MonetizationSettings');
const Earning = require('../models/Earnings');

/**
 * Request a creator withdrawal
 * @public
 */
exports.requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentMethod } = req.body;

    // Get user info
    const user = await User.findById(userId);
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
        message: `You need at least ${settings.minimumPayoutAmount} PKR to request a withdrawal`
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
    let paymentDetails = {};

    if (paymentMethod === 'jazzCash' && user.paymentMethods?.jazzCash) {
      hasPaymentDetails = true;
      paymentDetails.accountNumber = user.paymentMethods.jazzCash;
    } else if (paymentMethod === 'easyPaisa' && user.paymentMethods?.easyPaisa) {
      hasPaymentDetails = true;
      paymentDetails.accountNumber = user.paymentMethods.easyPaisa;
    } else if (paymentMethod === 'payFast' && user.paymentMethods?.payFast) {
      hasPaymentDetails = true;
      paymentDetails.accountNumber = user.paymentMethods.payFast;
    } else if (paymentMethod === 'bankTransfer' &&
               user.paymentMethods?.bankDetails?.accountNumber &&
               user.paymentMethods?.bankDetails?.accountTitle) {
      hasPaymentDetails = true;
      paymentDetails = {
        accountName: user.paymentMethods.bankDetails.accountTitle,
        accountNumber: user.paymentMethods.bankDetails.accountNumber,
        bankName: user.paymentMethods.bankDetails.bankName
      };
    }

    if (!hasPaymentDetails) {
      return res.status(400).json({
        success: false,
        message: 'Payment details not found for the selected method'
      });
    }

    // Create withdrawal request
    const withdrawalAmount = user.pendingPayout || 0;

    const withdrawal = new Withdrawal({
      user: userId,
      withdrawalType: 'creator',
      amount: withdrawalAmount,
      paymentMethod,
      paymentDetails,
      status: 'pending',
      requestDate: new Date()
    });

    await withdrawal.save();

    // Update user's pending payout
    await User.findByIdAndUpdate(userId, {
      pendingPayout: 0,
      lastPayoutDate: new Date(),
      lastPayoutAmount: withdrawalAmount
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        withdrawal
      }
    });
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get user's withdrawal history
 * @public
 */
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get withdrawal history
    const withdrawals = await Withdrawal.find({ user: userId })
      .sort({ requestDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        withdrawals
      }
    });
  } catch (error) {
    console.error('Error getting withdrawal history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all withdrawal requests (admin only)
 * @public
 */
exports.getAllWithdrawals = async (req, res) => {
  try {
    // Get query parameters
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Get total count
    const total = await Withdrawal.countDocuments(query);

    // Get withdrawals with pagination
    const withdrawals = await Withdrawal.find(query)
      .sort({ requestDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email profileImageUrl');

    res.status(200).json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all withdrawals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Request an admin withdrawal
 * @public
 */
exports.requestAdminWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentMethod, amount, paymentDetails } = req.body;

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can request admin withdrawals'
      });
    }

    // Check if amount is provided and valid
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid withdrawal amount is required'
      });
    }

    // Check if payment method is provided
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Check if payment details are provided
    if (!paymentDetails ||
        (paymentMethod === 'bankTransfer' &&
         (!paymentDetails.accountName || !paymentDetails.accountNumber)) ||
        (['jazzCash', 'easyPaisa', 'payFast'].includes(paymentMethod) &&
         !paymentDetails.accountNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment details are required'
      });
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      user: userId,
      withdrawalType: 'admin',
      amount,
      paymentMethod,
      paymentDetails,
      status: 'pending',
      requestDate: new Date()
    });

    await withdrawal.save();

    res.status(200).json({
      success: true,
      message: 'Admin withdrawal request submitted successfully',
      data: {
        withdrawal
      }
    });
  } catch (error) {
    console.error('Error requesting admin withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get admin platform revenue
 * @public
 */
exports.getAdminPlatformRevenue = async (req, res) => {
  try {
    // Get date range from query params or use default (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (req.query.days || 30));

    // Get monetization settings
    const settings = await MonetizationSettings.getSettings();

    // Calculate platform revenue from earnings
    const platformRevenue = await Earning.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPlatformRevenue: {
            $sum: {
              $multiply: ['$amount', { $divide: ['$platformCut', 100] }]
            }
          }
        }
      }
    ]);

    // Get recent admin withdrawals
    const recentWithdrawals = await Withdrawal.find({
      withdrawalType: 'admin',
      requestDate: { $gte: startDate, $lte: endDate }
    }).sort({ requestDate: -1 });

    // Calculate total withdrawn amount
    const totalWithdrawn = recentWithdrawals.reduce((total, withdrawal) => {
      if (withdrawal.status === 'completed') {
        return total + withdrawal.amount;
      }
      return total;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        platformRevenue: platformRevenue[0]?.totalPlatformRevenue || 0,
        recentWithdrawals,
        totalWithdrawn,
        availableForWithdrawal: (platformRevenue[0]?.totalPlatformRevenue || 0) - totalWithdrawn
      }
    });
  } catch (error) {
    console.error('Error getting admin platform revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Process a withdrawal request (admin only)
 * @public
 */
exports.processWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, transactionReference, rejectionReason } = req.body;

    // Validate status
    if (!['processing', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // If rejecting, require a reason
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Find the withdrawal
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    // Check if already processed
    if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: `This withdrawal has already been ${withdrawal.status}`
      });
    }

    // Update withdrawal status
    const updateData = {
      status,
      processedBy: req.user._id,
      processedDate: new Date()
    };

    if (status === 'completed' && transactionReference) {
      updateData.transactionReference = transactionReference;
    }

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;

      // Return the amount to user's pending payout if it's a creator withdrawal
      if (withdrawal.withdrawalType === 'creator') {
        await User.findByIdAndUpdate(withdrawal.user, {
          $inc: { pendingPayout: withdrawal.amount }
        });
      }
    }

    await Withdrawal.findByIdAndUpdate(withdrawalId, updateData);

    res.status(200).json({
      success: true,
      message: `Withdrawal ${status} successfully`
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
