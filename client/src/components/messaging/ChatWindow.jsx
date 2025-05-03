import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import MessageInput from './MessageInput';
import { FaEllipsisV, FaReply, FaTrash, FaPencilAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

// API URL for image paths
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChatWindow = ({ conversation, messages, loading, onSendMessage, socket }) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const optionsRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Listen for typing events
  useEffect(() => {
    if (!socket) return;

    socket.on('user-typing', ({ userId, userName, isTyping }) => {
      if (isTyping) {
        setTypingUsers((prev) => {
          if (!prev.some((user) => user.userId === userId)) {
            return [...prev, { userId, userName }];
          }
          return prev;
        });
      } else {
        setTypingUsers((prev) => prev.filter((user) => user.userId !== userId));
      }
    });

    return () => {
      socket.off('user-typing');
    };
  }, [socket]);

  // Handle click outside options menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle typing status
  const handleTyping = (isTyping) => {
    if (socket && conversation) {
      socket.emit('typing', {
        conversationId: conversation._id,
        isTyping
      });
    }
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://localhost:5000/api/messages/messages/${messageId}`, {
        withCredentials: true
      });

      // Update the message in the UI
      const updatedMessages = messages.map((msg) => {
        if (msg._id === messageId) {
          return {
            ...msg,
            isDeleted: true,
            content: 'This message was deleted'
          };
        }
        return msg;
      });

      // Update messages state (this should be lifted up to the parent component in a real app)
      // For now, we'll just reload the page
      window.location.reload();

      setShowOptions(null);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  // Handle message editing
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setShowOptions(null);
  };

  // Save edited message
  const saveEditedMessage = async (messageId, content) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/messages/messages/${messageId}`,
        { content },
        { withCredentials: true }
      );

      // Update the message in the UI
      const updatedMessages = messages.map((msg) => {
        if (msg._id === messageId) {
          return response.data;
        }
        return msg;
      });

      // Update messages state (this should be lifted up to the parent component in a real app)
      // For now, we'll just reload the page
      window.location.reload();

      setEditingMessage(null);
      toast.success('Message updated');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessage(null);
  };

  // Handle reply
  const handleReply = (message) => {
    setReplyTo(message);
    setShowOptions(null);
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyTo(null);
  };

  // Render message content
  const renderMessageContent = (message) => {
    if (message.isDeleted) {
      return <span className="italic text-gray-500">This message was deleted</span>;
    }

    if (message.type === 'text') {
      return message.content;
    } else if (message.type === 'image') {
      const imageUrl = message.mediaUrl.startsWith('http')
        ? message.mediaUrl
        : `${API_URL}${message.mediaUrl}`;

      return (
        <div>
          <img
            src={imageUrl}
            alt="Shared image"
            className="max-w-xs rounded-lg cursor-pointer"
            onClick={() => window.open(imageUrl, '_blank')}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/image-not-found.png";
            }}
          />
          {message.content && <p className="mt-1">{message.content}</p>}
        </div>
      );
    } else if (message.type === 'file') {
      const fileUrl = message.mediaUrl.startsWith('http')
        ? message.mediaUrl
        : `${API_URL}${message.mediaUrl}`;

      return (
        <div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-2 bg-gray-800 rounded-lg"
          >
            <span className="mr-2">📎</span>
            <span className="underline">{message.content}</span>
          </a>
        </div>
      );
    }

    return message.content;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Chat header */}
      <div className="p-4 border-b border-gray-800 flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 overflow-hidden">
          {conversation.image ? (
            <img
              src={conversation.image.startsWith('http')
                ? conversation.image
                : `${API_URL}${conversation.image}`}
              alt={conversation.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-avatar.png";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {conversation.title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{conversation.title}</h3>
          {typingUsers.length > 0 && (
            <div className="text-xs text-gray-400">
              {typingUsers.map((user) => user.userName).join(', ')} typing...
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="relative">
              {/* Reply reference */}
              {message.replyTo && (
                <div className="ml-12 mb-1 p-2 bg-gray-800 rounded-lg text-sm border-l-2 border-blue-500">
                  <div className="font-medium text-blue-400">
                    {message.replyTo.sender.name}
                  </div>
                  <div className="text-gray-400 truncate">
                    {message.replyTo.content}
                  </div>
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`flex ${message.sender._id === socket?.user?._id ? 'justify-end' : 'justify-start'
                  }`}
              >
                {/* Avatar (only for received messages) */}
                {message.sender._id !== socket?.user?._id && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 mr-2 overflow-hidden flex-shrink-0">
                    {message.sender.profileImageUrl ? (
                      <img
                        src={message.sender.profileImageUrl.startsWith('http')
                          ? message.sender.profileImageUrl
                          : `${API_URL}${message.sender.profileImageUrl}`}
                        alt={message.sender.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        {message.sender.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}

                {/* Message content */}
                <div
                  className={`relative max-w-md px-4 py-2 rounded-lg ${message.sender._id === socket?.user?._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-white'
                    }`}
                >
                  {/* Sender name (only for received messages) */}
                  {message.sender._id !== socket?.user?._id && (
                    <div className="font-medium text-sm text-blue-400 mb-1">
                      {message.sender.name}
                    </div>
                  )}

                  {/* Message content */}
                  <div className="break-words">{renderMessageContent(message)}</div>

                  {/* Message metadata */}
                  <div className="flex items-center justify-end mt-1 space-x-2">
                    {message.isEdited && (
                      <span className="text-xs opacity-70">(edited)</span>
                    )}
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>

                    {/* Read status (only for sent messages) */}
                    {message.sender._id === socket?.user?._id && (
                      <span className="text-xs opacity-70">
                        {message.readBy.length > 1 ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>

                  {/* Message options button */}
                  <button
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptions(message._id);
                    }}
                  >
                    <FaEllipsisV size={12} />
                  </button>

                  {/* Message options menu */}
                  {showOptions === message._id && (
                    <div
                      ref={optionsRef}
                      className="absolute top-8 right-0 bg-gray-900 rounded-md shadow-lg z-10 py-1 min-w-32"
                    >
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-800 flex items-center"
                        onClick={() => handleReply(message)}
                      >
                        <FaReply className="mr-2" /> Reply
                      </button>

                      {message.sender._id === socket?.user?._id && !message.isDeleted && (
                        <>
                          {message.type === 'text' && (
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-800 flex items-center"
                              onClick={() => handleEditMessage(message)}
                            >
                              <FaPencilAlt className="mr-2" /> Edit
                            </button>
                          )}

                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-800 text-red-500 flex items-center"
                            onClick={() => handleDeleteMessage(message._id)}
                          >
                            <FaTrash className="mr-2" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={cancelReply}
        editingMessage={editingMessage}
        onSaveEdit={saveEditedMessage}
        onCancelEdit={cancelEditing}
      />
    </>
  );
};

export default ChatWindow;
