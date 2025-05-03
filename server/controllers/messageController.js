const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get all conversations for the current user
 * @public
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate({
      path: 'participants',
      select: 'name profileImageUrl'
    })
    .populate({
      path: 'lastMessage',
      select: 'content type createdAt sender isDeleted'
    })
    .sort({ updatedAt: -1 });

    // Format the conversations for the client
    const formattedConversations = conversations.map(conversation => {
      // For individual conversations, get the other participant's info
      let title, image;
      if (conversation.type === 'individual') {
        const otherParticipant = conversation.participants.find(
          p => p._id.toString() !== userId.toString()
        );
        title = otherParticipant ? otherParticipant.name : 'Unknown User';
        image = otherParticipant ? otherParticipant.profileImageUrl : null;
      } else {
        // For group conversations, use the group name and image
        title = conversation.name;
        image = conversation.image;
      }

      // Get unread count for this user
      const unreadCount = conversation.unreadCounts.find(
        uc => uc.user.toString() === userId.toString()
      );

      return {
        _id: conversation._id,
        title,
        image,
        type: conversation.type,
        lastMessage: conversation.lastMessage,
        unreadCount: unreadCount ? unreadCount.count : 0,
        updatedAt: conversation.updatedAt
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get messages for a specific conversation
 * @public
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get messages for this conversation
    const messages = await Message.find({
      conversation: conversationId
    })
    .populate({
      path: 'sender',
      select: 'name profileImageUrl'
    })
    .populate({
      path: 'replyTo',
      select: 'content sender',
      populate: {
        path: 'sender',
        select: 'name'
      }
    })
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Conversation.updateOne(
      {
        _id: conversationId,
        'unreadCounts.user': userId
      },
      {
        $set: { 'unreadCounts.$.count': 0 }
      }
    );

    // Mark messages as read in the Message model
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new conversation
 * @public
 */
exports.createConversation = async (req, res) => {
  try {
    const { participantIds, name, type = 'individual' } = req.body;
    const userId = req.user._id;

    // Validate participants
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ error: 'Participants are required' });
    }

    // Add current user to participants if not already included
    if (!participantIds.includes(userId.toString())) {
      participantIds.push(userId.toString());
    }

    // For individual conversations, check if it already exists
    if (type === 'individual' && participantIds.length === 2) {
      const existingConversation = await Conversation.findOne({
        type: 'individual',
        participants: { $all: participantIds, $size: 2 }
      });

      if (existingConversation) {
        return res.json(existingConversation);
      }
    }

    // For group conversations, name is required
    if (type === 'group' && !name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Create unread counts array (0 for all participants)
    const unreadCounts = participantIds.map(id => ({
      user: id,
      count: 0
    }));

    // Create archived array (false for all participants)
    const archived = participantIds.map(id => ({
      user: id,
      status: false
    }));

    // Create muted array (false for all participants)
    const muted = participantIds.map(id => ({
      user: id,
      status: false
    }));

    // Create the conversation
    const conversation = new Conversation({
      participants: participantIds,
      type,
      name: type === 'group' ? name : undefined,
      admin: type === 'group' ? userId : undefined,
      unreadCounts,
      archived,
      muted
    });

    await conversation.save();

    // Populate participants
    await conversation.populate({
      path: 'participants',
      select: 'name profileImageUrl'
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send a message
 * @public
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = 'text', mediaUrl, replyTo } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Conversation ID and content are required' });
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create the message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content,
      type,
      mediaUrl: type !== 'text' ? mediaUrl : undefined,
      readBy: [userId], // Sender has read the message
      replyTo: replyTo || undefined
    });

    await message.save();

    // Update the conversation's last message and increment unread counts
    const updates = {
      lastMessage: message._id,
      updatedAt: new Date()
    };

    // Increment unread count for all participants except the sender
    await Conversation.updateOne(
      { _id: conversationId },
      {
        $set: updates,
        $inc: {
          'unreadCounts.$[elem].count': 1
        }
      },
      {
        arrayFilters: [{ 'elem.user': { $ne: userId } }]
      }
    );

    // Populate sender info
    await message.populate({
      path: 'sender',
      select: 'name profileImageUrl'
    });

    // If replying to a message, populate that info
    if (replyTo) {
      await message.populate({
        path: 'replyTo',
        select: 'content sender',
        populate: {
          path: 'sender',
          select: 'name'
        }
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a message
 * @public
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    // Soft delete the message
    message.isDeleted = true;
    message.content = 'This message was deleted';
    await message.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Edit a message
 * @public
 */
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Validate content
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    // Check if message type is text
    if (message.type !== 'text') {
      return res.status(400).json({ error: 'Only text messages can be edited' });
    }

    // Save original content if this is the first edit
    if (!message.isEdited) {
      message.originalContent = message.content;
    }

    // Update the message
    message.content = content;
    message.isEdited = true;
    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search users to start a conversation
 * @public
 */
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search for users by name or email
    const users = await User.find({
      $and: [
        { _id: { $ne: userId } }, // Exclude current user
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name email profileImageUrl')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mark conversation as read
 * @public
 */
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Update unread count for this user
    await Conversation.updateOne(
      {
        _id: conversationId,
        'unreadCounts.user': userId
      },
      {
        $set: { 'unreadCounts.$.count': 0 }
      }
    );

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update Conversation model to include the Message reference
 * This is a one-time operation to update the Conversation schema
 * @public
 */
exports.updateConversationSchema = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Update the Conversation model to include lastMessage field
    const result = await Conversation.updateMany(
      { lastMessage: { $exists: false } },
      { $set: { lastMessage: null } }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} conversations`
    });
  } catch (error) {
    console.error('Error updating conversation schema:', error);
    res.status(500).json({ error: error.message });
  }
};
