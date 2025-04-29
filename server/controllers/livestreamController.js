const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const Livestream = require('../models/Livestream');

// Configure Cloudinary (using existing configuration from your app)
// cloudinary.config is already set in your cloudinary.js file

/**
 * Create a new livestream
 * @route POST /api/livestream/create
 * @access Private
 */
exports.createLivestream = async (req, res) => {
  try {
    const { name, isScreenSharing } = req.body;
    const streamName = name || `Livestream_${Date.now()}`;

    console.log('Creating livestream with name:', streamName);
    console.log('Cloudinary config:', {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key ? '***' : 'missing', // Don't log the actual key
      api_secret: cloudinary.config().api_secret ? '***' : 'missing' // Don't log the actual secret
    });

    // Make a POST request to Cloudinary's livestream API
    try {
      const response = await axios({
        method: 'post',
        url: `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/live_streams`,
        auth: {
          username: cloudinary.config().api_key,
          password: cloudinary.config().api_secret
        },
        data: {
          name: streamName,
          input: {
            type: "rtmp"
          }
        }
      });

      console.log('Cloudinary response:', JSON.stringify(response.data, null, 2));

      // Create a new livestream in our database
      const newLivestream = new Livestream({
        name: streamName,
        cloudinaryId: response.data.public_id,
        rtmpUrl: response.data.input.uri,
        streamKey: response.data.input.stream_key,
        playbackUrl: response.data.outputs.hls.url,
        user: req.user._id,
        isScreenSharing: isScreenSharing || false
      });

      await newLivestream.save();

      res.status(201).json({
        success: true,
        data: newLivestream
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary API Error:', cloudinaryError.message);
      console.error('Cloudinary API Response:', JSON.stringify(cloudinaryError.response?.data, null, 2));

      // Check if this is a plan limitation error
      if (cloudinaryError.response?.status === 401 ||
          cloudinaryError.response?.status === 403 ||
          (cloudinaryError.response?.data &&
           (cloudinaryError.response.data.error?.message?.includes('plan') ||
            cloudinaryError.response.data.error?.message?.includes('upgrade')))) {
        return res.status(403).json({
          success: false,
          error: 'Livestreaming is not available on your current Cloudinary plan',
          details: cloudinaryError.response?.data?.error?.message || 'Please upgrade to a paid plan to use livestreaming features'
        });
      }

      throw cloudinaryError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error('Error creating livestream:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error creating livestream',
      details: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * Get livestream details
 * @route GET /api/livestream/:id
 * @access Private
 */
exports.getLivestreamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get livestream from our database
    const livestream = await Livestream.findById(id).populate('user', 'name email');

    if (!livestream) {
      return res.status(404).json({
        success: false,
        error: 'Livestream not found'
      });
    }

    // Also get the latest status from Cloudinary
    try {
      const cloudinaryResponse = await axios({
        method: 'get',
        url: `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/live_streams/${livestream.cloudinaryId}`,
        auth: {
          username: cloudinary.config().api_key,
          password: cloudinary.config().api_secret
        }
      });

      // Update our database with the latest status from Cloudinary
      if (cloudinaryResponse.data.state !== livestream.status) {
        livestream.status = cloudinaryResponse.data.state;

        if (cloudinaryResponse.data.state === 'active' && !livestream.startedAt) {
          livestream.startedAt = new Date();
        } else if (cloudinaryResponse.data.state === 'idle' && livestream.startedAt && !livestream.endedAt) {
          livestream.endedAt = new Date();
        }

        await livestream.save();
      }
    } catch (cloudinaryError) {
      console.error('Error fetching Cloudinary livestream details:', cloudinaryError.message);
      // Continue with our database data even if Cloudinary API fails
    }

    res.status(200).json({
      success: true,
      data: livestream
    });
  } catch (error) {
    console.error('Error getting livestream details:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error getting livestream details',
      details: error.message
    });
  }
};

/**
 * List all livestreams
 * @route GET /api/livestream
 * @access Private
 */
exports.listLivestreams = async (req, res) => {
  try {
    // Get all livestreams from our database
    const livestreams = await Livestream.find().populate('user', 'name email').sort({ createdAt: -1 });

    // Get active livestreams from Cloudinary to ensure our status is up-to-date
    try {
      const cloudinaryResponse = await axios({
        method: 'get',
        url: `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/live_streams`,
        auth: {
          username: cloudinary.config().api_key,
          password: cloudinary.config().api_secret
        }
      });

      // Create a map of Cloudinary livestream IDs to their states
      const cloudinaryStates = {};
      cloudinaryResponse.data.forEach(stream => {
        cloudinaryStates[stream.public_id] = stream.state;
      });

      // Update our database with the latest statuses
      for (const livestream of livestreams) {
        if (cloudinaryStates[livestream.cloudinaryId] &&
            cloudinaryStates[livestream.cloudinaryId] !== livestream.status) {
          livestream.status = cloudinaryStates[livestream.cloudinaryId];

          if (cloudinaryStates[livestream.cloudinaryId] === 'active' && !livestream.startedAt) {
            livestream.startedAt = new Date();
          } else if (cloudinaryStates[livestream.cloudinaryId] === 'idle' &&
                    livestream.startedAt && !livestream.endedAt) {
            livestream.endedAt = new Date();
          }

          await livestream.save();
        }
      }
    } catch (cloudinaryError) {
      console.error('Error fetching Cloudinary livestreams:', cloudinaryError.message);
      // Continue with our database data even if Cloudinary API fails
    }

    res.status(200).json({
      success: true,
      data: livestreams
    });
  } catch (error) {
    console.error('Error listing livestreams:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error listing livestreams',
      details: error.message
    });
  }
};

/**
 * Manually activate a livestream
 * @route POST /api/livestream/:id/activate
 * @access Private
 */
exports.activateLivestream = async (req, res) => {
  try {
    const { id } = req.params;

    // Get livestream from our database
    const livestream = await Livestream.findById(id);

    if (!livestream) {
      return res.status(404).json({
        success: false,
        error: 'Livestream not found'
      });
    }

    // Activate the livestream on Cloudinary
    const response = await axios({
      method: 'post',
      url: `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/live_streams/${livestream.cloudinaryId}/activate`,
      auth: {
        username: cloudinary.config().api_key,
        password: cloudinary.config().api_secret
      }
    });

    // Update our database
    livestream.status = 'active';
    livestream.startedAt = new Date();
    await livestream.save();

    res.status(200).json({
      success: true,
      data: livestream
    });
  } catch (error) {
    console.error('Error activating livestream:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Error activating livestream',
      details: error.response?.data || error.message
    });
  }
};

/**
 * Manually deactivate a livestream
 * @route POST /api/livestream/:id/deactivate
 * @access Private
 */
exports.deactivateLivestream = async (req, res) => {
  try {
    const { id } = req.params;

    // Get livestream from our database
    const livestream = await Livestream.findById(id);

    if (!livestream) {
      return res.status(404).json({
        success: false,
        error: 'Livestream not found'
      });
    }

    // Deactivate the livestream on Cloudinary
    const response = await axios({
      method: 'post',
      url: `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/live_streams/${livestream.cloudinaryId}/idle`,
      auth: {
        username: cloudinary.config().api_key,
        password: cloudinary.config().api_secret
      }
    });

    // Update our database
    livestream.status = 'idle';
    livestream.endedAt = new Date();
    await livestream.save();

    res.status(200).json({
      success: true,
      data: livestream
    });
  } catch (error) {
    console.error('Error deactivating livestream:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Error deactivating livestream',
      details: error.response?.data || error.message
    });
  }
};

/**
 * Delete a livestream
 * @route DELETE /api/livestream/:id
 * @access Private
 */
exports.deleteLivestream = async (req, res) => {
  try {
    const { id } = req.params;

    // Get livestream from our database
    const livestream = await Livestream.findById(id);

    if (!livestream) {
      return res.status(404).json({
        success: false,
        error: 'Livestream not found'
      });
    }

    // Delete the livestream from Cloudinary
    try {
      await axios({
        method: 'delete',
        url: `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/live_streams/${livestream.cloudinaryId}`,
        auth: {
          username: cloudinary.config().api_key,
          password: cloudinary.config().api_secret
        }
      });
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError.message);
      // Continue with deletion from our database even if Cloudinary API fails
    }

    // Delete from our database
    await Livestream.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Livestream deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting livestream:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error deleting livestream',
      details: error.message
    });
  }
};

/**
 * Get active livestreams
 * @route GET /api/livestream/active
 * @access Public
 */
exports.getActiveLivestreams = async (req, res) => {
  try {
    // Get all active livestreams from our database
    const activeLivestreams = await Livestream.find({ status: 'active' })
      .populate('user', 'name email')
      .sort({ startedAt: -1 });

    res.status(200).json({
      success: true,
      data: activeLivestreams
    });
  } catch (error) {
    console.error('Error getting active livestreams:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error getting active livestreams',
      details: error.message
    });
  }
};

/**
 * Get ended livestreams
 * @route GET /api/livestream/ended
 * @access Public
 */
exports.getEndedLivestreams = async (req, res) => {
  try {
    // Get all ended livestreams from our database
    const endedLivestreams = await Livestream.find({
      status: 'idle',
      endedAt: { $ne: null }
    })
      .populate('user', 'name email')
      .sort({ endedAt: -1 });

    res.status(200).json({
      success: true,
      data: endedLivestreams
    });
  } catch (error) {
    console.error('Error getting ended livestreams:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error getting ended livestreams',
      details: error.message
    });
  }
};
