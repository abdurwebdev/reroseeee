const User = require('../models/User');

/**
 * Middleware to verify if a user is a professional coder
 * This checks if the user has the professional_coder role and has been verified
 */
const isProfessionalCoder = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    // Check if user has professional_coder role
    if (req.user.role !== 'professional_coder') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only professional coders can access this resource.'
      });
    }

    // Check if the coder has been verified
    if (req.user.coderVerificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your professional coder status has not been approved yet. Please complete the verification process.'
      });
    }

    next();
  } catch (error) {
    console.error('Professional coder verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification process.'
    });
  }
};

/**
 * Middleware to validate code snippets
 * This performs basic validation on code snippets to ensure they meet quality standards
 */
const validateCodeSnippet = (req, res, next) => {
  try {
    let codeSnippets = req.body.codeSnippets;

    // If no code snippets provided, skip validation
    if (!codeSnippets || codeSnippets.length === 0) {
      return next();
    }

    // Parse the code snippets if they're a string (from FormData)
    if (typeof codeSnippets === 'string') {
      try {
        codeSnippets = JSON.parse(codeSnippets);
      } catch (parseError) {
        console.error('Error parsing code snippets:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid code snippet format. Please check your submission.'
        });
      }
    }

    // Validate each code snippet
    for (const snippet of codeSnippets) {
      // Check if required fields are present
      if (!snippet.language || !snippet.code) {
        return res.status(400).json({
          success: false,
          message: 'Each code snippet must include a language and code.'
        });
      }

      // Trim whitespace from language field
      snippet.language = snippet.language.trim();

      // Check if code is not too short (arbitrary minimum length)
      if (snippet.code.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Code snippets must be substantial. Please provide more complete examples.'
        });
      }

      // Additional validation could be added here:
      // - Syntax checking
      // - Security scanning
      // - Style guide compliance
    }

    // Update the parsed code snippets in the request body
    req.body.parsedCodeSnippets = codeSnippets;

    next();
  } catch (error) {
    console.error('Code snippet validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating code snippets.'
    });
  }
};

module.exports = {
  isProfessionalCoder,
  validateCodeSnippet
};
