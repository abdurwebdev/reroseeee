import React from 'react';
import { formatDistanceToNow } from 'date-fns';

// API URL for image paths
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ConversationList = ({ conversations, selectedId, onSelect }) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No conversations yet. Start a new chat!
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-800">
      {conversations.map((conversation) => (
        <div
          key={conversation._id}
          onClick={() => onSelect(conversation)}
          className={`p-4 cursor-pointer hover:bg-gray-900 transition-colors ${selectedId === conversation._id ? 'bg-gray-800' : ''
            }`}
        >
          <div className="flex items-start">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-700 mr-3 overflow-hidden flex-shrink-0">
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
                <div className="w-full h-full flex items-center justify-center text-lg">
                  {conversation.title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Conversation details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium truncate">{conversation.title}</h3>
                <span className="text-xs text-gray-500 ml-1 flex-shrink-0">
                  {conversation.updatedAt
                    ? formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })
                    : ''}
                </span>
              </div>

              {/* Last message preview */}
              <p className="text-sm text-gray-400 truncate mt-1">
                {conversation.lastMessage
                  ? conversation.lastMessage.isDeleted
                    ? 'This message was deleted'
                    : conversation.lastMessage.content
                  : 'No messages yet'}
              </p>

              {/* Unread count */}
              {conversation.unreadCount > 0 && (
                <div className="mt-1 flex justify-end">
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {conversation.unreadCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
