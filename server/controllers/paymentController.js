const Payment = require('../models/Payment');
const User = require('../models/User');
const jazzCashService = require('../utils/jazzCashService');
const easyPaisaService = require('../utils/easyPaisaService');
const payFastService = require('../utils/payFastService');

/**
 * Initialize a payment
 * @public
 */
exports.initializePayment = async (req, res) => {
  try {
    const { gateway, amount, purpose, referenceId, referenceModel, description } = req.body;
    const userId = req.user._id;
    
    // Validate required fields
    if (!gateway || !amount || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Gateway, amount, and purpose are required'
      });
    }
    
    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create payment record
    const payment = new Payment({
      user: userId,
      amount,
      gateway,
      purpose,
      referenceId,
      referenceModel,
      status: 'pending',
      createdAt: new Date()
    });
    
    await payment.save();
    
    // Prepare payment data
    const paymentData = {
      amount,
      userId: userId.toString(),
      purpose,
      referenceId: referenceId || '',
      referenceModel: referenceModel || '',
      description: description || `Payment for ${purpose}`,
      email: user.email,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      mobileNumber: user.mobileNumber || ''
    };
    
    // Initialize payment with selected gateway
    let paymentRequest;
    
    switch (gateway) {
      case 'jazzCash':
        paymentRequest = await jazzCashService.createPaymentRequest(paymentData);
        break;
      case 'easyPaisa':
        paymentRequest = await easyPaisaService.createPaymentRequest(paymentData);
        break;
      case 'payFast':
        paymentRequest = await payFastService.createPaymentRequest(paymentData);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment gateway'
        });
    }
    
    // Update payment with transaction ID
    await Payment.findByIdAndUpdate(payment._id, {
      transactionId: paymentRequest.transactionId
    });
    
    // Return payment details
    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        paymentId: payment._id,
        transactionId: paymentRequest.transactionId,
        formData: paymentRequest.formData,
        paymentUrl: paymentRequest.paymentUrl,
        gateway
      }
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * JazzCash payment callback
 * @public
 */
exports.jazzCashCallback = async (req, res) => {
  try {
    // Verify payment callback
    const verificationResult = jazzCashService.verifyPaymentCallback(req.body);
    
    // Find payment by transaction ID
    const payment = await Payment.findOne({ transactionId: verificationResult.transactionId });
    
    if (!payment) {
      return res.redirect(`/payment/error?message=Payment not found`);
    }
    
    // Update payment status
    payment.status = verificationResult.isSuccessful ? 'completed' : 'failed';
    payment.gatewayResponse = verificationResult.rawData;
    payment.errorMessage = !verificationResult.isSuccessful ? verificationResult.responseMessage : '';
    payment.updatedAt = new Date();
    
    await payment.save();
    
    // Process successful payment
    if (verificationResult.isSuccessful) {
      await processSuccessfulPayment(payment);
      return res.redirect(`/payment/success?paymentId=${payment._id}`);
    } else {
      return res.redirect(`/payment/error?paymentId=${payment._id}&message=${verificationResult.responseMessage}`);
    }
  } catch (error) {
    console.error('Error processing JazzCash callback:', error);
    return res.redirect(`/payment/error?message=Server error`);
  }
};

/**
 * EasyPaisa payment callback
 * @public
 */
exports.easyPaisaCallback = async (req, res) => {
  try {
    // Verify payment callback
    const verificationResult = easyPaisaService.verifyPaymentCallback(req.body);
    
    // Find payment by transaction ID
    const payment = await Payment.findOne({ transactionId: verificationResult.transactionId });
    
    if (!payment) {
      return res.redirect(`/payment/error?message=Payment not found`);
    }
    
    // Update payment status
    payment.status = verificationResult.isSuccessful ? 'completed' : 'failed';
    payment.gatewayResponse = verificationResult.rawData;
    payment.errorMessage = !verificationResult.isSuccessful ? verificationResult.responseMessage : '';
    payment.updatedAt = new Date();
    
    await payment.save();
    
    // Process successful payment
    if (verificationResult.isSuccessful) {
      await processSuccessfulPayment(payment);
      return res.redirect(`/payment/success?paymentId=${payment._id}`);
    } else {
      return res.redirect(`/payment/error?paymentId=${payment._id}&message=${verificationResult.responseMessage}`);
    }
  } catch (error) {
    console.error('Error processing EasyPaisa callback:', error);
    return res.redirect(`/payment/error?message=Server error`);
  }
};

/**
 * PayFast payment notification (ITN)
 * @public
 */
exports.payFastNotify = async (req, res) => {
  try {
    // Get client IP
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Verify payment notification
    const verificationResult = await payFastService.verifyPaymentNotification(req.body, clientIP);
    
    // Find payment by transaction ID
    const payment = await Payment.findOne({ transactionId: verificationResult.transactionId });
    
    if (!payment) {
      return res.status(404).send('UNKNOWN');
    }
    
    // Update payment status
    payment.status = verificationResult.isSuccessful ? 'completed' : 'failed';
    payment.gatewayResponse = verificationResult.rawData;
    payment.errorMessage = !verificationResult.isSuccessful ? verificationResult.responseMessage : '';
    payment.updatedAt = new Date();
    
    await payment.save();
    
    // Process successful payment
    if (verificationResult.isSuccessful) {
      await processSuccessfulPayment(payment);
    }
    
    // Respond to PayFast
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing PayFast notification:', error);
    return res.status(500).send('ERROR');
  }
};

/**
 * PayFast payment return (success)
 * @public
 */
exports.payFastReturn = async (req, res) => {
  try {
    const { m_payment_id } = req.query;
    
    // Find payment by transaction ID
    const payment = await Payment.findOne({ transactionId: m_payment_id });
    
    if (!payment) {
      return res.redirect(`/payment/error?message=Payment not found`);
    }
    
    return res.redirect(`/payment/success?paymentId=${payment._id}`);
  } catch (error) {
    console.error('Error processing PayFast return:', error);
    return res.redirect(`/payment/error?message=Server error`);
  }
};

/**
 * PayFast payment cancel
 * @public
 */
exports.payFastCancel = async (req, res) => {
  try {
    const { m_payment_id } = req.query;
    
    // Find payment by transaction ID
    const payment = await Payment.findOne({ transactionId: m_payment_id });
    
    if (!payment) {
      return res.redirect(`/payment/error?message=Payment not found`);
    }
    
    // Update payment status
    payment.status = 'failed';
    payment.errorMessage = 'Payment cancelled by user';
    payment.updatedAt = new Date();
    
    await payment.save();
    
    return res.redirect(`/payment/error?paymentId=${payment._id}&message=Payment cancelled`);
  } catch (error) {
    console.error('Error processing PayFast cancel:', error);
    return res.redirect(`/payment/error?message=Server error`);
  }
};

/**
 * Get payment details
 * @public
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Find payment
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user is authorized to view this payment
    if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Return payment details
    res.status(200).json({
      success: true,
      data: {
        payment
      }
    });
  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get user payment history
 * @public
 */
exports.getUserPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    const query = { user: userId };
    if (status) {
      query.status = status;
    }
    
    // Get total count
    const total = await Payment.countDocuments(query);
    
    // Get payments with pagination
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    // Return payment history
    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all payments (admin only)
 * @public
 */
exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, gateway, purpose } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (gateway) {
      query.gateway = gateway;
    }
    if (purpose) {
      query.purpose = purpose;
    }
    
    // Get total count
    const total = await Payment.countDocuments(query);
    
    // Get payments with pagination
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email profileImageUrl');
    
    // Return payments
    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Process successful payment
 * @private
 */
const processSuccessfulPayment = async (payment) => {
  try {
    // Process payment based on purpose
    switch (payment.purpose) {
      case 'subscription':
        // Handle subscription payment
        // Update subscription status, extend subscription period, etc.
        break;
      
      case 'donation':
        // Handle donation payment
        // Update creator earnings, etc.
        break;
      
      case 'premium':
        // Handle premium subscription payment
        // Update user's premium status, etc.
        break;
      
      case 'adCredit':
        // Handle ad credit payment
        // Add credits to user's ad account, etc.
        break;
      
      default:
        // Handle other payment types
        break;
    }
    
    // You can add more specific logic here based on your application needs
    
    return true;
  } catch (error) {
    console.error('Error processing successful payment:', error);
    return false;
  }
};
