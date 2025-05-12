const User = require('../models/User');

/**
 * Apply for professional coder verification
 * @route POST /api/coder/apply
 * @access Private
 */
const applyForVerification = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const {
      programmingLanguages,
      yearsOfExperience,
      githubProfile,
      stackOverflowProfile,
      linkedInProfile,
      portfolioWebsite,
      certifications,
      codeSnippetSubmission,
      specializations
    } = req.body;
    
    // Validate required fields
    if (!programmingLanguages || !yearsOfExperience || !githubProfile || !codeSnippetSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: programming languages, years of experience, GitHub profile, and code snippet.'
      });
    }
    
    // Parse arrays if they come as strings
    const parsedLanguages = Array.isArray(programmingLanguages) 
      ? programmingLanguages 
      : JSON.parse(programmingLanguages);
    
    const parsedCertifications = certifications 
      ? (Array.isArray(certifications) ? certifications : JSON.parse(certifications)) 
      : [];
    
    const parsedSpecializations = specializations 
      ? (Array.isArray(specializations) ? specializations : JSON.parse(specializations)) 
      : [];
    
    // Update user with coder verification details
    const user = await User.findByIdAndUpdate(
      userId,
      {
        programmingLanguages: parsedLanguages,
        yearsOfExperience,
        githubProfile,
        stackOverflowProfile,
        linkedInProfile,
        portfolioWebsite,
        certifications: parsedCertifications,
        codeSnippetSubmission,
        specializations: parsedSpecializations,
        coderVerificationStatus: 'under_review',
        role: 'professional_coder' // Set role to professional_coder (will be verified by admin)
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Professional coder verification application submitted successfully. Your application is under review.',
      data: {
        verificationStatus: user.coderVerificationStatus
      }
    });
  } catch (error) {
    console.error('Coder Verification Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting verification application',
      error: error.message
    });
  }
};

/**
 * Get verification status
 * @route GET /api/coder/verification-status
 * @access Private
 */
const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('coderVerificationStatus coderVerificationDate');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        verificationStatus: user.coderVerificationStatus,
        verificationDate: user.coderVerificationDate
      }
    });
  } catch (error) {
    console.error('Get Verification Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching verification status',
      error: error.message
    });
  }
};

/**
 * Admin: Review coder verification application
 * @route PUT /api/coder/review/:userId
 * @access Private (Admin only)
 */
const reviewVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (approved or rejected)'
      });
    }
    
    // Update user verification status
    const updateData = {
      coderVerificationStatus: status
    };
    
    // If approved, set verification date
    if (status === 'approved') {
      updateData.coderVerificationDate = new Date();
    }
    
    // If notes provided, add them
    if (notes) {
      updateData.verificationNotes = notes;
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Verification ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          verificationStatus: user.coderVerificationStatus,
          verificationDate: user.coderVerificationDate
        }
      }
    });
  } catch (error) {
    console.error('Review Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing verification',
      error: error.message
    });
  }
};

module.exports = {
  applyForVerification,
  getVerificationStatus,
  reviewVerification
};
