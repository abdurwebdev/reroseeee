// middleware/uploadPermissionMiddleware.js
const User = require('../models/User');

/**
 * Middleware to check if a user has permission to upload coding videos
 * This checks the user's role and verification status
 */
const canUploadCodingVideos = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    // Admin can always upload
    if (req.user.role === 'admin') {
      req.canUploadCoding = true;
      return next();
    }

    // Professional coders can upload if they're verified
    if (req.user.role === 'professional_coder') {
      req.canUploadCoding = req.user.coderVerificationStatus === 'approved';
      return next();
    }

    // Other users cannot upload coding videos
    req.canUploadCoding = false;
    next();
  } catch (error) {
    console.error('Upload permission check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during permission check.'
    });
  }
};

/**
 * API endpoint to check if the current user can upload coding videos
 */
const checkUploadPermission = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        canUpload: false,
        message: 'Authentication required. Please log in.'
      });
    }

    // Admin can always upload
    if (req.user.role === 'admin') {
      return res.json({
        success: true,
        canUpload: true,
        role: req.user.role
      });
    }

    // Professional coders can upload if they're verified
    if (req.user.role === 'professional_coder') {
      const canUpload = req.user.coderVerificationStatus === 'approved';
      return res.json({
        success: true,
        canUpload,
        role: req.user.role,
        verificationStatus: req.user.coderVerificationStatus
      });
    }

    // Other users cannot upload coding videos
    return res.json({
      success: true,
      canUpload: false,
      role: req.user.role
    });
  } catch (error) {
    console.error('Upload permission check error:', error);
    res.status(500).json({
      success: false,
      canUpload: false,
      message: 'Server error during permission check.'
    });
  }
};

module.exports = {
  canUploadCodingVideos,
  checkUploadPermission
};
