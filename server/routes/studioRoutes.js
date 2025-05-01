const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const studioController = require('../controllers/studioController');

// Studio dashboard overview
router.get('/overview', 
  protect, 
  authorizeRoles('creator', 'admin'), 
  studioController.getStudioOverview
);

// Channel content management
router.get('/content', 
  protect, 
  authorizeRoles('creator', 'admin'), 
  studioController.getChannelContent
);

// Channel analytics
router.get('/analytics', 
  protect, 
  authorizeRoles('creator', 'admin'), 
  studioController.getChannelAnalytics
);

// Monetization status and earnings
router.get('/monetization', 
  protect, 
  authorizeRoles('creator', 'admin'), 
  studioController.getMonetizationStatus
);

// Apply for monetization
router.post('/monetization/apply', 
  protect, 
  authorizeRoles('creator'), 
  studioController.applyForMonetization
);

// Apply for verification
router.post('/verification/apply', 
  protect, 
  authorizeRoles('creator'), 
  studioController.upload.single('identityDocument'),
  studioController.applyForVerification
);

// Update payment methods
router.put('/payment-methods', 
  protect, 
  authorizeRoles('creator', 'admin'), 
  studioController.updatePaymentMethods
);

// Request payout
router.post('/request-payout', 
  protect, 
  authorizeRoles('creator'), 
  studioController.requestPayout
);

module.exports = router;
