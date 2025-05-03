import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import { FaPlus, FaSearch } from 'react-icons/fa';

// API URL for image paths
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Messaging = () => {
  const { socket, connected } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/messages/conversations', {
          withCredentials: true
        });
        setConversations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Listen for new messages and conversation updates
  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for new messages
    socket.on('new-message', (message) => {
      if (selectedConversation && message.conversation === selectedConversation._id) {
        setMessages((prevMessages) => [...prevMessages, message]);

        // Mark as read if this is the active conversation
        socket.emit('mark-read', { conversationId: selectedConversation._id });
      }
    });

    // Listen for conversation updates
    socket.on('conversation-updated', ({ conversationId, lastMessage }) => {
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              lastMessage,
              unreadCount: conv.unreadCount + 1,
              updatedAt: new Date()
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    // Listen for read receipts
    socket.on('messages-read', ({ conversationId, userId }) => {
      if (selectedConversation && selectedConversation._id === conversationId) {
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => {
            if (!msg.readBy.includes(userId)) {
              return {
                ...msg,
                readBy: [...msg.readBy, userId]
              };
            }
            return msg;
          });
        });
      }
    });

    return () => {
      socket.off('new-message');
      socket.off('conversation-updated');
      socket.off('messages-read');
    };
  }, [socket, connected, selectedConversation]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/messages/conversations/${selectedConversation._id}/messages`,
          { withCredentials: true }
        );
        setMessages(response.data);

        // Mark conversation as read
        if (socket && connected) {
          socket.emit('mark-read', { conversationId: selectedConversation._id });
        }

        // Update unread count in conversations list
        setConversations((prevConversations) => {
          return prevConversations.map((conv) => {
            if (conv._id === selectedConversation._id) {
              return { ...conv, unreadCount: 0 };
            }
            return conv;
          });
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, socket, connected]);

  // Search for users
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/users/search?query=${searchQuery}`,
        { withCredentials: true }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    }
  };

  // Create a new conversation
  const startNewConversation = async (userId) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/messages/conversations',
        { participantIds: [userId], type: 'individual' },
        { withCredentials: true }
      );

      // Add to conversations list if it's new
      const exists = conversations.some((conv) => conv._id === response.data._id);
      if (!exists) {
        // Format the conversation for the list
        const otherParticipant = response.data.participants.find(
          (p) => p._id !== response.data.participants[0]._id
        );

        const formattedConversation = {
          _id: response.data._id,
          title: otherParticipant.name,
          image: otherParticipant.profileImageUrl,
          type: 'individual',
          lastMessage: null,
          unreadCount: 0,
          updatedAt: response.data.updatedAt
        };

        setConversations((prev) => [formattedConversation, ...prev]);
      }

      // Select the conversation
      setSelectedConversation({
        _id: response.data._id,
        title: response.data.participants.find(
          (p) => p._id !== response.data.participants[0]._id
        ).name,
        image: response.data.participants.find(
          (p) => p._id !== response.data.participants[0]._id
        ).profileImageUrl,
        type: 'individual'
      });

      // Reset search
      setSearchQuery('');
      setSearchResults([]);
      setShowNewChat(false);

      // Join the conversation room
      if (socket && connected) {
        socket.emit('join-conversations');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Send a message
  const sendMessage = async (content, type = 'text', mediaUrl = null, replyTo = null) => {
    if (!selectedConversation || !content.trim()) return;

    if (socket && connected) {
      // Send via socket for real-time delivery
      socket.emit('send-message', {
        conversationId: selectedConversation._id,
        content,
        type,
        mediaUrl,
        replyTo
      });
    } else {
      // Fallback to REST API if socket is not connected
      try {
        const response = await axios.post(
          'http://localhost:5000/api/messages/messages',
          {
            conversationId: selectedConversation._id,
            content,
            type,
            mediaUrl,
            replyTo
          },
          { withCredentials: true }
        );

        setMessages((prev) => [...prev, response.data]);

        // Update the conversation in the list
        setConversations((prevConversations) => {
          return prevConversations.map((conv) => {
            if (conv._id === selectedConversation._id) {
              return {
                ...conv,
                lastMessage: response.data,
                updatedAt: new Date()
              };
            }
            return conv;
          }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        });
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      }
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left sidebar - Conversations */}
      <div className="w-1/4 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Messages</h2>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FaPlus />
          </button>
        </div>

        {/* New chat search */}
        {showNewChat && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center mb-2">
              <input
                type="text"
                placeholder="Search for users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full p-2 rounded bg-gray-900 text-white"
              />
              <button
                onClick={handleSearch}
                className="ml-2 p-2 rounded bg-blue-600 hover:bg-blue-700"
              >
                <FaSearch />
              </button>
            </div>

            {/* Search results */}
            <div className="mt-2 max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => startNewConversation(user._id)}
                  className="p-2 hover:bg-gray-800 rounded cursor-pointer flex items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 mr-2 overflow-hidden">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl.startsWith('http')
                          ? user.profileImageUrl
                          : `${API_URL}${user.profileImageUrl}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
              ))}
              {searchQuery && searchResults.length === 0 && (
                <div className="text-center text-gray-500 py-2">No users found</div>
              )}
            </div>
          </div>
        )}

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?._id}
            onSelect={setSelectedConversation}
          />
        </div>
      </div>

      {/* Right side - Chat window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            loading={loading}
            onSendMessage={sendMessage}
            socket={socket}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-xl mb-4">Select a conversation or start a new one</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
