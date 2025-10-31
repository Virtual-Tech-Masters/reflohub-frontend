import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { businessAPI, freelancerAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useRealTimeChat = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const fetchChatsCalledRef = useRef(false);
  const loadMessagesCalledRef = useRef(new Set());

  // Create chat list from leads
  const createChatsFromLeads = useCallback(async () => {
    if (!currentUser) return [];

    try {
      let leadsData = [];
      
      if (currentUser.userType === 'business') {
        const response = await businessAPI.listLeads();
        console.log('Business API response:', response);
        console.log('Response data:', response.data);
        console.log('Response status:', response.status);
        // Business API returns data directly (not wrapped in .leads)
        leadsData = Array.isArray(response.data) ? response.data : (response.data.leads || []);
        console.log('Extracted leads data:', leadsData);
        console.log('Leads count:', leadsData.length);
        
        if (leadsData.length === 0) {
          console.log('No leads found for business. No freelancers have submitted leads yet.');
        }
      } else if (currentUser.userType === 'freelancer') {
        const response = await freelancerAPI.listLeads();
        console.log('Freelancer API response:', response);
        console.log('Response data:', response.data);
        console.log('Response status:', response.status);
        // The API returns data directly (not wrapped in .leads)
        leadsData = response.data || [];
        console.log('Extracted leads data:', leadsData);
        console.log('Leads count:', leadsData.length);
        
        if (leadsData.length === 0) {
          console.log('No leads found for freelancer. User needs to submit leads first.');
        }
      }

      // Convert leads to chat format
      const chatList = leadsData.map(lead => {
        console.log('Processing lead:', lead);
        
        // For freelancer: show business name, for business: show lead name
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
          leadName: lead.leadName
        };
      });

      console.log('Created chat list from leads:', chatList);
      console.log('Chat leadIds:', chatList.map(chat => ({ leadId: chat.leadId, type: typeof chat.leadId })));
      console.log('Lead data sample:', leadsData[0]);

      // If no chats were created from leads, return empty array
      if (chatList.length === 0) {
        console.log('No leads found, no chats to create');
        if (currentUser.userType === 'freelancer') {
          console.log('Freelancer needs to submit leads to businesses to start conversations');
        } else if (currentUser.userType === 'business') {
          console.log('Business needs freelancers to submit leads to start conversations');
        }
        return [];
      }

      return chatList;
    } catch (err) {
      console.error('Failed to create chats from leads:', err);
      return [];
    }
  }, [currentUser?.id, currentUser?.userType]); // Only depend on stable user properties

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
  }, [currentUser?.id]); // Only depend on user ID

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
      
      const messagesData = response.data.messages || [];
      setMessages(messagesData);
    } catch (err) {
      console.error('Failed to load messages:', err);
      // Don't show error to user, just set empty messages
      setMessages([]);
    }
  }, [currentUser?.id, currentUser?.userType]); // Only depend on stable user properties

  const sendMessage = async (leadId, message) => {
    try {
      console.log('Sending message:', { leadId, message, userType: currentUser.userType });
      let response;
      if (currentUser.userType === 'business') {
        response = await businessAPI.postMessage(leadId, message);
      } else {
        response = await freelancerAPI.message(leadId, message);
      }
      console.log('Message sent successfully:', response);
      
      // Add message to local state
      const newMessage = {
        id: Date.now(),
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        read: false,
        senderType: currentUser.userType.toUpperCase(),
        senderId: currentUser.id
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
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(err.response?.data?.message || 'Failed to send message.');
      throw err;
    }
  };

  const connectToSSE = useCallback((leadId) => {
    if (!leadId || !currentUser) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Use different SSE endpoints for business vs freelancer
    const endpoint = currentUser.userType === 'business' ? 'business' : 'freelancer';
    const sseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/${endpoint}/leads/${leadId}/stream?token=${encodeURIComponent(token)}`;
    
    console.log('Connecting to SSE:', {
      userType: currentUser.userType,
      endpoint,
      leadId,
      sseUrl
    });
    
    // For business users, we might need to handle authentication differently
    // since the business SSE endpoint uses regular auth middleware
    if (currentUser.userType === 'business') {
      console.warn('Business SSE endpoint may not support token authentication via query parameter');
      console.warn('This might cause 403 Forbidden errors');
    }
    
    try {
      const eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        console.log('SSE connection opened for leadId:', leadId);
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received SSE message:', data);
          
          if (data.type === 'message') {
            const newMessage = {
              id: data.payload.id,
              text: data.payload.message,
              time: new Date(data.payload.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sent: data.payload.senderType === currentUser.userType.toUpperCase(),
              read: false,
              senderType: data.payload.senderType,
              senderId: data.payload.senderId
            };
            
            setMessages(prev => [...prev, newMessage]);
            
            // Update chat list
            setChats(prevChats => 
              prevChats.map(chat => 
                chat.leadId === leadId 
                  ? {
                      ...chat,
                      lastMessage: data.payload.message,
                      time: 'Just now',
                      unread: data.payload.senderType !== currentUser.userType.toUpperCase() 
                        ? chat.unread + 1 
                        : chat.unread
                    }
                  : chat
              )
            );
          }
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        eventSource.close();
        
        // For business users, if SSE fails due to auth, we might need to use polling
        if (currentUser.userType === 'business') {
          console.log('Business SSE failed, this is expected due to authentication method');
          console.log('Consider using polling or asking backend to use sseAuth middleware');
        }
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error('Failed to connect to SSE:', err);
      setIsConnected(false);
    }
  }, [currentUser]);

  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const selectChat = useCallback((chat) => {
    setSelectedChat(chat);
    loadMessages(chat.leadId);
    connectToSSE(chat.leadId);
  }, [loadMessages, connectToSSE]);

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

  useEffect(() => {
    if (currentUser) {
      fetchChats();
    }
  }, [currentUser?.id]); // Only depend on user ID, not the entire fetchChats function

  useEffect(() => {
    return () => {
      disconnectSSE();
    };
  }, [disconnectSSE]);

  return {
    chats,
    loading,
    error,
    selectedChat,
    messages,
    isConnected,
    setSelectedChat: selectChat,
    refreshChats: fetchChats,
    sendMessage,
    markAsRead,
    addChat,
    getChatStats,
    disconnectSSE
  };
};
