import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUser, FiMessageSquare, FiSearch, FiMoreVertical, FiRefreshCw, FiWifi, FiWifiOff } from 'react-icons/fi';
import { IoCheckmarkDone } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import PageTitle from '../../components/common/PageTitle';
import { useJChat } from '../../hooks/useJChat';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage, escapeHtml, formatDateTime } from '../../utils/helpers';

const Chat = () => {
  const { currentUser } = useAuth();
  const { 
    chats, 
    loading, 
    error, 
    selectedChat, 
    messages,
    isConnected,
    selectChat,
    refreshChats, 
    sendMessage, 
    markAsRead
  } = useJChat();

  // Helper function to get chat display info
  const getChatInfo = (chat) => {
    const recipient = chat.recipient || {};
    const name = escapeHtml(recipient.fullName || recipient.name || 'Unknown');
    const avatar = recipient.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
    const lastMessage = chat.lastMessage?.message || 'No messages yet';
    const time = chat.lastMessage?.createdAt 
      ? formatDateTime(chat.lastMessage.createdAt)
      : formatDateTime(chat.updatedAt);
    return { name, avatar, lastMessage, time };
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const filteredChats = chats.filter(chat => {
    const info = getChatInfo(chat);
    return info.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await sendMessage(messageInput.trim(), selectedChat.id);
      setMessageInput('');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleChatSelect = (chat) => {
    selectChat(chat);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    const errorMessage = getErrorMessage(error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load chats</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refreshChats}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 flex items-center gap-2 mx-auto shadow-2xl hover:shadow-blue-500/25"
          >
            <FiRefreshCw /> Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Business Chat - RefloHub</title>
        <meta name="description" content="Communicate with freelancers and team members" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle
            title="Business Chat"
            subtitle="Communicate with freelancers and team members"
            actions={
              <button
                onClick={refreshChats}
                className="btn-secondary flex items-center gap-2"
              >
                <FiRefreshCw /> Refresh
              </button>
            }
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <FiMessageSquare className="text-primary-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Chats</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{chats.length}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <FiUser className="text-red-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden min-h-[600px]">
        {/* Chat List - Made smaller */}
        <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FiMessageSquare className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No chats found' : 'No chats yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery 
                    ? 'Try adjusting your search criteria.'
                    : 'Start a conversation with freelancers or team members.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {filteredChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?.id === chat.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        {(() => {
                          const info = getChatInfo(chat);
                          return (
                            <>
                              <img
                                src={info.avatar}
                                alt={info.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            </>
                          );
                        })()}
                      </div>
                      <div className="ml-2 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {getChatInfo(chat).name}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getChatInfo(chat).time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={getChatInfo(chat).lastMessage}>
                          {escapeHtml(getChatInfo(chat).lastMessage)}
                        </p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="ml-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  {(() => {
                    const info = getChatInfo(selectedChat);
                    return (
                      <>
                        <img
                          src={info.avatar}
                          alt={info.name}
                          className="w-8 h-8 rounded-full object-cover mr-3"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {info.name}
                          </h3>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {isConnected ? (
                                <div className="flex items-center gap-1">
                                  <FiWifi className="text-green-500 text-sm" title="Connected" />
                                  <span className="text-xs text-green-600">Live</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <FiWifiOff className="text-red-500 text-sm" title="Disconnected" />
                                  <span className="text-xs text-red-600">Offline</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FiMoreVertical />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isSent = message.senderId === currentUser?.id;
                  const time = message.createdAt ? formatDateTime(message.createdAt) : 'N/A';
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isSent
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{escapeHtml(message.message)}</p>
                        <div className="flex items-center justify-end mt-1">
                          <span className="text-xs opacity-70">{time}</span>
                          {isSent && (
                            <IoCheckmarkDone
                              className={`ml-1 text-xs ${
                                message.read ? 'text-blue-300' : 'text-gray-300'
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FiSend />
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiMessageSquare className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select a chat to start messaging
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a conversation from the list to view messages
                </p>
              </div>
            </div>
          )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;