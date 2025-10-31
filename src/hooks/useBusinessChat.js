import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { businessAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useBusinessChat = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchChats = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For now, return empty array since chat API might not exist yet
      // In a real implementation, this would call businessAPI.listChats()
      const chatsData = [];
      
      setChats(chatsData);
      
      if (chatsData.length === 0) {
        console.log('No chats found - this might be because the chat API is not implemented yet');
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      setError(err);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const sendMessage = async (chatId, message) => {
    try {
      // This would be a real API call when the endpoint exists
      console.log('Sending message to chat:', chatId, message);
      toast.success('Message sent successfully!');
      
      // Update local state
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? {
                ...chat,
                lastMessage: message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                messages: [
                  ...chat.messages,
                  {
                    id: Date.now(),
                    text: message,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sent: true,
                    read: false
                  }
                ]
              }
            : chat
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(err.response?.data?.message || 'Failed to send message.');
      throw err;
    }
  };

  const markAsRead = async (chatId) => {
    try {
      // This would be a real API call when the endpoint exists
      console.log('Marking chat as read:', chatId);
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, unread: 0, messages: chat.messages.map(msg => ({ ...msg, read: true })) }
            : chat
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error(err.response?.data?.message || 'Failed to mark as read.');
      throw err;
    }
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
    fetchChats();
  }, [fetchChats]);

  return {
    chats,
    loading,
    error,
    selectedChat,
    setSelectedChat,
    refreshChats: fetchChats,
    sendMessage,
    markAsRead,
    getChatStats
  };
};
