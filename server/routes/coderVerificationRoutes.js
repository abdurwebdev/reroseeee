const express = require('express');
const router = express.Router();
const coderVerificationController = require('../controllers/coderVerificationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Apply for professional coder verification
router.post('/apply', protect, coderVerificationController.applyForVerification);

// Get verification status
router.get('/verification-status', protect, coderVerificationController.getVerificationStatus);

// Admin: Review coder verification application
router.put(
  '/review/:userId',
  protect,
  authorizeRoles('admin'),
  coderVerificationController.reviewVerification
);

// Admin: Get all pending verification applications
router.get(
  '/pending-applications',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const User = require('../models/User');
      
      const pendingApplications = await User.find({
        coderVerificationStatus: 'under_review'
      }).select('name email programmingLanguages yearsOfExperience githubProfile codeSnippetSubmission');
      
      res.status(200).json({
        success: true,
        count: pendingApplications.length,
        data: pendingApplications
      });
    } catch (error) {
      console.error('Get Pending Applications Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching pending applications',
        error: error.message
      });
    }
  }
);

// Admin: Get all verified coders
router.get(
  '/verified-coders',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const User = require('../models/User');
      
      const verifiedCoders = await User.find({
        role: 'professional_coder',
        coderVerificationStatus: 'approved'
      }).select('name email programmingLanguages yearsOfExperience githubProfile coderVerificationDate');
      
      res.status(200).json({
        success: true,
        count: verifiedCoders.length,
        data: verifiedCoders
      });
    } catch (error) {
      console.error('Get Verified Coders Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching verified coders',
        error: error.message
      });
    }
  }
);

module.exports = router;
