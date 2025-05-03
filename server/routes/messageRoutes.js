const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');
const uploadController = require('../controllers/uploadController');

// Get all conversations for the current user
router.get('/conversations', protect, messageController.getConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', protect, messageController.getMessages);

// Create a new conversation
router.post('/conversations', protect, messageController.createConversation);

// Send a message
router.post('/messages', protect, messageController.sendMessage);

// Delete a message
router.delete('/messages/:messageId', protect, messageController.deleteMessage);

// Edit a message
router.put('/messages/:messageId', protect, messageController.editMessage);

// Search users to start a conversation
router.get('/users/search', protect, messageController.searchUsers);

// Mark conversation as read
router.post('/conversations/:conversationId/read', protect, messageController.markAsRead);

// Update Conversation schema (admin only)
router.post('/update-schema', protect, messageController.updateConversationSchema);

// Upload file for messaging
router.post('/upload', protect, uploadController.uploadMiddleware, uploadController.uploadFile);

module.exports = router;
