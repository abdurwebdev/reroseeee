import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get token from cookies
    const token = Cookies.get('token');
    
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    // Initialize socket connection
    const socketInstance = io('http://localhost:5000', {
      auth: { token },
      query: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Socket event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      setError(null);
      
      // Join all conversations the user is part of
      socketInstance.emit('join-conversations');
    });
    
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnected(false);
      setError(err.message);
      
      // If authentication error, redirect to login
      if (err.message.includes('Authentication error')) {
        toast.error('Your session has expired. Please log in again.');
        Cookies.remove('token');
        navigate('/login');
      }
    });
    
    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
      
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        toast.error('You have been disconnected from the server.');
      }
    });
    
    socketInstance.on('error', (err) => {
      console.error('Socket error:', err);
      toast.error(err.message || 'An error occurred');
    });
    
    // Save socket instance
    setSocket(socketInstance);
    
    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [navigate]);
  
  // Value to provide to consumers
  const value = {
    socket,
    connected,
    error,
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
