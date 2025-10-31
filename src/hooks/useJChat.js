import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { jchatAPI } from '../utils/jchatAPI';
import toast from 'react-hot-toast';

export const useJChat = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const response = await jchatAPI.getChats();
      setChats(response.data.chats || []);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      setError(err);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load messages for a chat
  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) return;

    try {
      const response = await jchatAPI.getChat(chatId);
      const chat = response.data.chat;
      setMessages(chat.messages || []);
      setSelectedChat(chat);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Failed to load messages:', err);
      toast.error('Failed to load messages');
    }
  }, []);

  // Connect WebSocket
  const connectWebSocket = useCallback((chatId) => {
    if (!chatId || !currentUser || wsRef.current) {
      // Close existing connection if switching chats
      if (wsRef.current && wsRef.current.chatId !== chatId) {
        wsRef.current.close();
        wsRef.current = null;
      } else if (wsRef.current) {
        return; // Already connected to this chat
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      setError('Authentication token missing');
      return;
    }

    const baseURL = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') || 'localhost:5000';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${baseURL}/api/jchat/chats/${chatId}/ws?token=${encodeURIComponent(token)}`;

    console.log('Connecting to JChat WebSocket:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      ws.chatId = chatId;

      ws.onopen = () => {
        console.log('JChat WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('JChat WebSocket message:', data);

          if (data.type === 'new_message') {
            const newMessage = data.data;
            setMessages(prev => [...prev, newMessage]);
            
            // Update chat list with last message
            setChats(prevChats =>
              prevChats.map(chat =>
                chat.id === newMessage.chatId
                  ? {
                      ...chat,
                      lastMessage: {
                        id: newMessage.id,
                        message: newMessage.message,
                        createdAt: newMessage.createdAt,
                        senderId: newMessage.senderId,
                        senderType: newMessage.senderType,
                      },
                      unreadCount: newMessage.senderId !== currentUser.id ? chat.unreadCount + 1 : chat.unreadCount,
                      updatedAt: newMessage.createdAt,
                    }
                  : chat
              )
            );

            // Scroll to bottom
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else if (data.type === 'chat_history') {
            const chat = data.data.chat;
            setMessages(chat.messages || []);
            
            // Scroll to bottom
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('JChat WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('JChat WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (chatId && currentUser) {
            connectWebSocket(chatId);
          }
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to connect to chat');
      setIsConnected(false);
    }
  }, [currentUser]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (message, chatId = null) => {
    if (!message.trim()) return;

    const targetChatId = chatId || selectedChat?.id;
    if (!targetChatId) {
      toast.error('No chat selected');
      return;
    }

    // Send via WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        message: message.trim(),
      }));
    } else {
      // Fallback to HTTP
      try {
        await jchatAPI.sendMessage({
          message: message.trim(),
          chatId: targetChatId,
        });
      } catch (err) {
        console.error('Failed to send message:', err);
        toast.error('Failed to send message');
      }
    }
  }, [selectedChat]);

  // Mark as read
  const markAsRead = useCallback(async (chatId) => {
    try {
      await jchatAPI.markAsRead(chatId);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  // Select chat
  const selectChat = useCallback((chat) => {
    setSelectedChat(chat);
    disconnectWebSocket();
    loadMessages(chat.id);
    connectWebSocket(chat.id);
    markAsRead(chat.id);
  }, [loadMessages, connectWebSocket, disconnectWebSocket, markAsRead]);

  // Create or get chat with recipient
  const createChat = useCallback(async (recipientId) => {
    try {
      const response = await jchatAPI.createChat({ recipientId });
      const chat = response.data.chat;
      await fetchChats();
      selectChat(chat);
      return chat;
    } catch (err) {
      console.error('Failed to create chat:', err);
      toast.error('Failed to create chat');
      throw err;
    }
  }, [fetchChats, selectChat]);

  // Initial fetch
  useEffect(() => {
    if (currentUser) {
      fetchChats();
    }
  }, [currentUser, fetchChats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return {
    chats,
    loading,
    error,
    selectedChat,
    messages,
    isConnected,
    messagesEndRef,
    fetchChats,
    selectChat,
    sendMessage,
    markAsRead,
    createChat,
    refreshChats: fetchChats,
  };
};

