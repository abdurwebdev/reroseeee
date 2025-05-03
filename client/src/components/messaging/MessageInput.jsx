import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSmile, FaPaperclip, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({
  onSendMessage,
  onTyping,
  replyTo,
  onCancelReply,
  editingMessage,
  onSaveEdit,
  onCancelEdit
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Set initial message when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  // Focus input when replying
  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  // Handle typing status
  const handleTypingStatus = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 2000);

    setTypingTimeout(timeout);
  };

  // Handle input change
  const handleChange = (e) => {
    setMessage(e.target.value);
    handleTypingStatus();
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle emoji selection
  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size should not exceed 5MB');
      return;
    }

    setFile(selectedFile);
  };

  // Handle file upload
  const uploadFile = async () => {
    if (!file) return null;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      setUploading(false);
      return response.data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      setUploading(false);
      return null;
    }
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((!message.trim() && !file) || uploading) return;

    if (editingMessage) {
      // Save edited message
      onSaveEdit(editingMessage._id, message);
    } else {
      if (file) {
        // Upload file first
        const fileUrl = await uploadFile();
        if (fileUrl) {
          // Determine message type based on file type
          const fileType = file.type.startsWith('image/') ? 'image' : 'file';

          // Send message with file
          onSendMessage(file.name, fileType, fileUrl, replyTo?._id);
          setFile(null);

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } else {
        // Send text message
        onSendMessage(message, 'text', null, replyTo?._id);
      }

      // Clear reply if active
      if (replyTo) {
        onCancelReply();
      }
    }

    // Reset state
    setMessage('');
    setIsTyping(false);
    onTyping(false);
    setShowEmojiPicker(false);

    // Clear typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  return (
    <div className="border-t border-gray-800 p-4">
      {/* Reply preview */}
      {replyTo && (
        <div className="mb-2 p-2 bg-gray-800 rounded-lg flex justify-between items-start">
          <div>
            <div className="text-sm text-blue-400 font-medium">
              Replying to {replyTo.sender.name}
            </div>
            <div className="text-sm text-gray-400 truncate">{replyTo.content}</div>
          </div>
          <button
            onClick={onCancelReply}
            className="text-gray-500 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Edit indicator */}
      {editingMessage && (
        <div className="mb-2 p-2 bg-gray-800 rounded-lg flex justify-between items-start">
          <div>
            <div className="text-sm text-yellow-400 font-medium">
              Editing message
            </div>
          </div>
          <button
            onClick={onCancelEdit}
            className="text-gray-500 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* File preview */}
      {file && (
        <div className="mb-2 p-2 bg-gray-800 rounded-lg flex justify-between items-start">
          <div className="flex items-center">
            <div className="text-sm text-green-400 font-medium flex items-center">
              <FaPaperclip className="mr-2" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-gray-500 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-center">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        {/* Attachment button */}
        <button
          type="button"
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaPaperclip />
        </button>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          placeholder={
            editingMessage
              ? "Edit your message..."
              : replyTo
                ? `Reply to ${replyTo.sender.name}...`
                : file
                  ? "Add a caption..."
                  : "Type a message..."
          }
          className="flex-1 bg-gray-800 rounded-full px-4 py-2 mx-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        {/* Emoji button */}
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FaSmile />
          </button>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-12 right-0 z-10"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
                theme="dark"
              />
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={(!message.trim() && !file) || uploading}
          className={`p-2 rounded-full ${(message.trim() || file) && !uploading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
