// middleware/codingVideoValidator.js
/**
 * Middleware to validate that uploaded videos are coding-related
 * This checks if the video has the required coding-specific metadata
 */

const validateCodingVideo = (req, res, next) => {
  try {
    const { 
      title, 
      description,
      programmingLanguages,
      difficultyLevel
    } = req.body;

    // Check if title or description contains coding-related keywords
    const codingKeywords = [
      'code', 'coding', 'programming', 'developer', 'development',
      'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php',
      'html', 'css', 'react', 'angular', 'vue', 'node', 'express',
      'django', 'flask', 'spring', 'laravel', 'algorithm', 'data structure',
      'function', 'class', 'object', 'variable', 'method', 'api',
      'frontend', 'backend', 'fullstack', 'web', 'mobile', 'app',
      'database', 'sql', 'nosql', 'mongodb', 'mysql', 'postgresql'
    ];

    // Check if title or description contains coding-related keywords
    const titleLower = title ? title.toLowerCase() : '';
    const descriptionLower = description ? description.toLowerCase() : '';
    
    const hasCodingKeywordInTitle = codingKeywords.some(keyword => 
      titleLower.includes(keyword)
    );
    
    const hasCodingKeywordInDescription = codingKeywords.some(keyword => 
      descriptionLower.includes(keyword)
    );

    // Check if programming languages are provided
    let hasProgrammingLanguages = false;
    if (programmingLanguages) {
      // Handle both string and array formats
      if (typeof programmingLanguages === 'string') {
        try {
          const parsedLanguages = JSON.parse(programmingLanguages);
          hasProgrammingLanguages = Array.isArray(parsedLanguages) && parsedLanguages.length > 0;
        } catch (e) {
          // If it's not valid JSON, check if it's a comma-separated string
          hasProgrammingLanguages = programmingLanguages.split(',').some(lang => lang.trim().length > 0);
        }
      } else if (Array.isArray(programmingLanguages)) {
        hasProgrammingLanguages = programmingLanguages.length > 0;
      }
    }

    // Check if difficulty level is provided
    const hasDifficultyLevel = !!difficultyLevel;

    // Determine if the video is coding-related based on the checks
    const isCodingVideo = 
      (hasCodingKeywordInTitle || hasCodingKeywordInDescription) &&
      (hasProgrammingLanguages || hasDifficultyLevel);

    if (!isCodingVideo) {
      return res.status(400).json({
        success: false,
        message: 'Only coding-related videos are allowed. Please include programming languages and ensure your title or description clearly indicates coding content.'
      });
    }

    next();
  } catch (error) {
    console.error('Coding video validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating video content.'
    });
  }
};

module.exports = { validateCodingVideo };
