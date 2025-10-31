import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { businessAPI, freelancerAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useWebSocketChat = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const fetchChatsCalledRef = useRef(false);
  const loadMessagesCalledRef = useRef(new Set());

  // Create chat list from leads
  const createChatsFromLeads = useCallback(async () => {
    if (!currentUser) return [];

    try {
      let leadsData = [];
      
      if (currentUser.userType === 'business') {
        const response = await businessAPI.listLeads();
        leadsData = Array.isArray(response.data) ? response.data : (response.data.leads || []);
      } else if (currentUser.userType === 'freelancer') {
        const response = await freelancerAPI.listLeads();
        leadsData = response.data || [];
      }

      // Convert leads to chat format
      const chatList = leadsData.map(lead => {
        const chatName = currentUser.userType === 'business' 
          ? `Lead: ${lead.leadName}` 
          : `Business: ${lead.business?.name || lead.businessName || 'Unknown Business'}`;
          
        const avatarName = currentUser.userType === 'business' 
          ? lead.leadName
          : (lead.business?.name || lead.businessName || 'Business');
          
        return {
          id: `lead-${lead.id}`,
          leadId: lead.id,
          name: chatName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=random&color=fff`,
          lastMessage: lead.details ? lead.details.substring(0, 50) + '...' : 'No details',
          time: new Date(lead.submittedAt).toLocaleDateString(),
          status: lead.status,
          online: false,
          unread: 0,
          messages: [],
          businessName: lead.business?.name || lead.businessName,
          leadName: lead.leadName,
          lead: lead
        };
      });

      return chatList;
    } catch (err) {
      console.error('Failed to create chats from leads:', err);
      return [];
    }
  }, [currentUser?.id, currentUser?.userType]);

  const fetchChats = useCallback(async () => {
    if (!currentUser || fetchChatsCalledRef.current) {
      setLoading(false);
      return;
    }

    fetchChatsCalledRef.current = true;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching chats for user:', currentUser.id);
      const chatList = await createChatsFromLeads();
      console.log('Setting chats:', chatList);
      setChats(chatList);
      
      if (chatList.length === 0) {
        console.log('No chats found - this might be because no leads exist yet.');
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      setError(err);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, createChatsFromLeads]);

  const loadMessages = useCallback(async (leadId) => {
    if (!leadId || loadMessagesCalledRef.current.has(leadId)) return;

    loadMessagesCalledRef.current.add(leadId);

    try {
      let response;
      if (currentUser.userType === 'business') {
        response = await businessAPI.listMessages(leadId);
      } else {
        response = await freelancerAPI.conversation(leadId);
      }
      
      const messagesData = response.data.messages || response.data || [];
      setMessages(messagesData);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    }
  }, [currentUser?.id, currentUser?.userType]);

  // WebSocket connection management
  const connectWebSocket = useCallback((leadId) => {
    if (!leadId || !currentUser) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const userType = currentUser.userType.toUpperCase();
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      setError('Authentication token missing');
      return;
    }
    
    // Build WebSocket URL with token
    const wsUrl = `ws://localhost:5000/api/${userType.toLowerCase()}/leads/${leadId}/ws?token=${encodeURIComponent(token)}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    console.log('Token length:', token.length);

    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          
          if (data.type === 'lead_message') {
            const newMessage = {
              id: data.data.id,
              text: data.data.message,
              time: new Date(data.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sent: data.data.senderType === currentUser.userType.toUpperCase(),
              read: false,
              senderType: data.data.senderType,
              senderId: data.data.senderId,
              createdAt: data.data.createdAt
            };
            
            setMessages(prev => [...prev, newMessage]);
            
            // Update chat list
            setChats(prevChats => 
              prevChats.map(chat => 
                chat.leadId === leadId 
                  ? {
                      ...chat,
                      lastMessage: data.data.message,
                      time: 'Just now',
                      unread: data.data.senderType !== currentUser.userType.toUpperCase() 
                        ? chat.unread + 1 
                        : chat.unread
                    }
                  : chat
              )
            );
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection failed');
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to connect');
    }
  }, [currentUser]);

  // Send message via WebSocket
  const sendMessage = useCallback(async (leadId, message) => {
    try {
      console.log('Sending message:', { leadId, message, userType: currentUser.userType });
      
      // Send via WebSocket if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(message);
        
        // Add message to local state immediately for better UX
        const newMessage = {
          id: Date.now(),
          text: message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sent: true,
          read: false,
          senderType: currentUser.userType.toUpperCase(),
          senderId: currentUser.id,
          createdAt: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Update chat list
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.leadId === leadId 
              ? {
                  ...chat,
                  lastMessage: message,
                  time: 'Just now',
                  messages: [...chat.messages, newMessage]
                }
              : chat
          )
        );
        
        toast.success('Message sent successfully!');
        return true;
      } else {
        // Fallback to REST API if WebSocket not connected
        let response;
        if (currentUser.userType === 'business') {
          response = await businessAPI.postMessage(leadId, message);
        } else {
          response = await freelancerAPI.message(leadId, message);
        }
        
        console.log('Message sent via REST API:', response);
        toast.success('Message sent successfully!');
        return true;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(err.response?.data?.message || 'Failed to send message.');
      return false;
    }
  }, [currentUser]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const selectChat = useCallback((chat) => {
    setSelectedChat(chat);
    loadMessages(chat.leadId);
    connectWebSocket(chat.leadId);
  }, [loadMessages, connectWebSocket]);

  const markAsRead = async (chatId) => {
    try {
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, unread: 0 }
            : chat
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const addChat = (newChat) => {
    setChats(prevChats => {
      const exists = prevChats.find(chat => chat.leadId === newChat.leadId);
      if (!exists) {
        return [...prevChats, newChat];
      }
      return prevChats;
    });
  };

  const getChatStats = () => {
    return {
      total: chats.length,
      unread: chats.reduce((sum, chat) => sum + chat.unread, 0),
      online: chats.filter(chat => chat.online).length,
      recent: chats.filter(chat => {
        const today = new Date();
        const chatTime = new Date(chat.time);
        return chatTime.toDateString() === today.toDateString();
      }).length,
    };
  };

  const refreshChats = useCallback(() => {
    fetchChatsCalledRef.current = false;
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (currentUser) {
      fetchChats();
    }
  }, [currentUser?.id, fetchChats]);

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
    setSelectedChat: selectChat,
    refreshChats,
    sendMessage,
    markAsRead,
    addChat,
    getChatStats,
    disconnectWebSocket
  };
};
