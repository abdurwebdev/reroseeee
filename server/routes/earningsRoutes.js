const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const earningsController = require('../controllers/earningsController');

// Record earnings routes
router.post('/record-video-view', earningsController.recordVideoView);
router.post('/record-livestream-view', earningsController.recordLivestreamView);
router.post('/record-ad-impression', earningsController.recordAdImpression);
router.post('/record-ad-click', earningsController.recordAdClick);

// Admin routes
router.get(
  '/admin/summary', 
  protect, 
  authorizeRoles('admin'), 
  earningsController.getAdminEarningsSummary
);

router.put(
  '/admin/settings', 
  protect, 
  authorizeRoles('admin'), 
  earningsController.updateMonetizationSettings
);

// Creator routes
router.get(
  '/creator/summary', 
  protect, 
  authorizeRoles('creator', 'admin'), 
  earningsController.getCreatorEarnings
);

module.exports = router;
