const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const withdrawalController = require('../controllers/withdrawalController');

// User routes
router.post(
  '/request',
  protect,
  authorizeRoles('creator'),
  withdrawalController.requestWithdrawal
);

router.get(
  '/history',
  protect,
  withdrawalController.getWithdrawalHistory
);

// Admin routes
router.get(
  '/admin/all',
  protect,
  authorizeRoles('admin'),
  withdrawalController.getAllWithdrawals
);

router.put(
  '/admin/process/:withdrawalId',
  protect,
  authorizeRoles('admin'),
  withdrawalController.processWithdrawal
);

router.post(
  '/admin/request',
  protect,
  authorizeRoles('admin'),
  withdrawalController.requestAdminWithdrawal
);

router.get(
  '/admin/platform-revenue',
  protect,
  authorizeRoles('admin'),
  withdrawalController.getAdminPlatformRevenue
);

module.exports = router;
