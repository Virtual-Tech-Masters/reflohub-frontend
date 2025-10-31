import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUser, FiMessageSquare, FiSearch, FiMoreVertical } from 'react-icons/fi';
import { IoCheckmarkDone } from 'react-icons/io5';
import toast from 'react-hot-toast';
import PageTitle from '../../components/common/PageTitle';

// Dummy data for chats
const dummyChats = [
  {
    id: 1,
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    lastMessage: 'Hey, how about the project deadline?',
    time: '10:30 AM',
    unread: 2,
    online: true,
    messages: [
      { id: 1, text: 'Hi there!', time: '10:20 AM', sent: true, read: true },
      { id: 2, text: 'How are you?', time: '10:21 AM', sent: true, read: true },
      { id: 3, text: "I'm good, thanks!", time: '10:25 AM', sent: false, read: true },
      { id: 4, text: 'Hey, how about the project deadline?', time: '10:30 AM', sent: false, read: false },
    ]
  },
  {
    id: 2,
    name: 'Sarah Smith',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessage: 'The design files are ready for review',
    time: '9:15 AM',
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: 'Hello Sarah!', time: '9:00 AM', sent: true, read: true },
      { id: 2, text: 'Are the designs ready?', time: '9:05 AM', sent: true, read: true },
      { id: 3, text: 'The design files are ready for review', time: '9:15 AM', sent: false, read: true },
    ]
  },
  {
    id: 3,
    name: 'Mike Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    lastMessage: 'Let me check and get back to you',
    time: 'Yesterday',
    unread: 0,
    online: true,
    messages: [
      { id: 1, text: 'Mike, about the API issue...', time: 'Yesterday', sent: true, read: true },
      { id: 2, text: 'Let me check and get back to you', time: 'Yesterday', sent: false, read: true },
    ]
  },
  {
    id: 4,
    name: 'Emma Wilson',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    lastMessage: 'Thanks for the update!',
    time: 'Tuesday',
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: 'I have updated the documentation', time: 'Tuesday', sent: true, read: true },
      { id: 2, text: 'Thanks for the update!', time: 'Tuesday', sent: false, read: true },
    ]
  },
];

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setChats(dummyChats);
      setIsLoading(false);
      toast.success('Chats loaded successfully!');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const updatedChats = chats.map(chat => {
      if (chat.id === selectedChat.id) {
        const newMsg = {
          id: chat.messages.length + 1,
          text: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sent: true,
          read: false
        };
        return {
          ...chat,
          lastMessage: newMessage,
          time: 'Just now',
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setSelectedChat(updatedChats.find(chat => chat.id === selectedChat.id));
    setNewMessage('');
    toast.success('Message sent!');
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const cardVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Chat"
        subtitle="Communicate with your team members"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Conversations</h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-250px)] overflow-y-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredChats.map(chat => (
                <motion.div
                  key={chat.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 flex items-center cursor-pointer transition-colors ${selectedChat?.id === chat.id ? 'bg-primary-50 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <div className="relative mr-3">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {chat.name}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {chat.time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <span className="bg-primary-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <img
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedChat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedChat.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedChat.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  <FiMoreVertical />
                </button>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-350px)]">
                <AnimatePresence>
                  {selectedChat.messages.map(message => (
                    <motion.div
                      key={message.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.2 }}
                      className={`mb-4 flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sent ? 'bg-primary-500 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}
                      >
                        <p>{message.text}</p>
                        <div className={`text-xs mt-1 flex items-center ${message.sent ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'}`}>
                          {message.time}
                          {message.sent && (
                            <IoCheckmarkDone className={`ml-1 ${message.read ? 'text-blue-300' : ''}`} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </AnimatePresence>
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                <FiMessageSquare className="text-primary-500 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Choose an existing chat from the list or start a new conversation
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;