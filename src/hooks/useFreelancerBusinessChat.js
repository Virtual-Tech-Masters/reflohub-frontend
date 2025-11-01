import { useState, useEffect, useRef, useCallback } from 'react';
import { businessAPI, freelancerAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

/**
 * Custom hook for freelancer-business chat
 * @param {number|null} freelancerId - For business users: freelancer ID to chat with
 * @param {number|null} businessId - For freelancer users: business ID to chat with
 * @param {string} userType - 'business' or 'freelancer'
 */
export const useFreelancerBusinessChat = (freelancerId, businessId, userType) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  // Get the appropriate API and ID based on user type
  const getApiConfig = () => {
    if (userType === 'business') {
      return {
        api: businessAPI,
        targetId: freelancerId,
        getWsUrl: () => businessAPI.getChatWebSocketUrl(freelancerId),
        listMessages: (params) => businessAPI.listChatMessages(freelancerId, params),
      };
    } else {
      return {
        api: freelancerAPI,
        targetId: businessId,
        getWsUrl: () => freelancerAPI.getChatWebSocketUrl(businessId),
        listMessages: (params) => freelancerAPI.listChatMessages(businessId, params),
      };
    }
  };

  // Load initial messages
  const loadMessages = useCallback(async () => {
    const config = getApiConfig();
    if (!config.targetId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await config.listMessages({ limit: 50 });
      const messagesArray = Array.isArray(response.data) ? response.data : [];
      setMessages(messagesArray);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(`Failed to load messages: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [freelancerId, businessId, userType]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    const config = getApiConfig();
    if (!config.targetId) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const wsUrl = config.getWsUrl();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'chat_message' && data.data) {
            // Add new message to the list
            setMessages(prev => {
              // Check if message already exists (prevent duplicates)
              const exists = prev.some(msg => msg.id === data.data.id);
              if (exists) return prev;
              return [...prev, data.data];
            });
          } else if (data.type === 'error') {
            toast.error(data.message || 'An error occurred');
            setError(data.message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);
        
        // Attempt to reconnect if connection closed unexpectedly
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, reconnectDelay);
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to chat');
    }
  }, [freelancerId, businessId, userType]);

  // Send message
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText || !messageText.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    const config = getApiConfig();
    if (!config.targetId) {
      toast.error('Chat target not specified');
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to chat. Please wait...');
      return;
    }

    try {
      setSending(true);
      // Send message via WebSocket (backend will persist it)
      wsRef.current.send(messageText.trim());
      // Message will be added to list when echoed back from server
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`Failed to send message: ${errorMessage}`);
    } finally {
      setSending(false);
    }
  }, [freelancerId, businessId, userType]);

  // Initialize: Load messages and connect WebSocket
  useEffect(() => {
    if (freelancerId || businessId) {
      loadMessages();
      connectWebSocket();
    }

    // Cleanup on unmount or when IDs change
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectAttempts.current = 0;
    };
  }, [freelancerId, businessId, loadMessages, connectWebSocket]);

  return {
    messages,
    loading,
    error,
    connected,
    sending,
    sendMessage,
    reloadMessages: loadMessages,
  };
};

