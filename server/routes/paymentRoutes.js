const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Initialize payment
router.post(
  '/initialize',
  protect,
  paymentController.initializePayment
);

// Get payment details
router.get(
  '/details/:paymentId',
  protect,
  paymentController.getPaymentDetails
);

// Get user payment history
router.get(
  '/history',
  protect,
  paymentController.getUserPaymentHistory
);

// Get all payments (admin only)
router.get(
  '/admin/all',
  protect,
  authorizeRoles('admin'),
  paymentController.getAllPayments
);

// JazzCash callback
router.post(
  '/jazzcash/callback',
  paymentController.jazzCashCallback
);

// EasyPaisa callback
router.post(
  '/easypaisa/callback',
  paymentController.easyPaisaCallback
);

// PayFast callbacks
router.post(
  '/payfast/notify',
  paymentController.payFastNotify
);

router.get(
  '/payfast/return',
  paymentController.payFastReturn
);

router.get(
  '/payfast/cancel',
  paymentController.payFastCancel
);

module.exports = router;
