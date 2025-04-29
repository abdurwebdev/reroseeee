const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createLivestream,
  getLivestreamDetails,
  listLivestreams,
  activateLivestream,
  deactivateLivestream,
  deleteLivestream,
  getActiveLivestreams,
  getEndedLivestreams
} = require('../controllers/livestreamController');

// Public routes
// Get active livestreams
router.get('/active', getActiveLivestreams);

// Get ended livestreams
router.get('/ended', getEndedLivestreams);

// Protected routes
// Create a new livestream
router.post('/create', protect, createLivestream);

// Get all livestreams
router.get('/', protect, listLivestreams);

// Get a specific livestream
router.get('/:id', protect, getLivestreamDetails);

// Activate a livestream
router.post('/:id/activate', protect, activateLivestream);

// Deactivate a livestream
router.post('/:id/deactivate', protect, deactivateLivestream);

// Delete a livestream
router.delete('/:id', protect, deleteLivestream);

module.exports = router;