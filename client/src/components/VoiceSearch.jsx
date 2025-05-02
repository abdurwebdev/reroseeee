import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const VoiceSearch = ({ onSearchResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Check if browser supports speech recognition
  const browserSupportsSpeechRecognition = () => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  };
  
  const startListening = () => {
    if (!browserSupportsSpeechRecognition()) {
      toast.error('Your browser does not support voice search');
      return;
    }
    
    setIsListening(true);
    setTranscript('');
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      console.log('Voice recognition started');
    };
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      setTranscript(result);
      
      // Pass the result to parent component
      if (onSearchResult) {
        onSearchResult(result);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast.error(`Voice search error: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  return (
    <button
      onClick={startListening}
      disabled={isListening}
      className={`p-2 rounded-full ${isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
      title="Search with voice"
      aria-label="Search with voice"
    >
      {isListening ? (
        <FaSpinner className="animate-spin text-white" />
      ) : (
        <FaMicrophone className="text-white" />
      )}
    </button>
  );
};

export default VoiceSearch;
