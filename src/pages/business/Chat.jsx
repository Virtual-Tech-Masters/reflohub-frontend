import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiUser, FiSend, FiArrowLeft, FiWifi, FiWifiOff } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useBusinessChatList } from '../../hooks/useBusinessChatList';
import { useFreelancerBusinessChat } from '../../hooks/useFreelancerBusinessChat';
import PageTitle from '../../components/common/PageTitle';
import { escapeHtml, formatDateTime } from '../../utils/helpers';
import MentionInput from '../../components/chat/MentionInput';
import LeadMention, { renderMessageWithMentions } from '../../components/chat/LeadMention';
import TaggedLeads from '../../components/chat/TaggedLeads';
import ActiveLead from '../../components/chat/ActiveLead';
import { useNavigate, useSearchParams } from 'react-router-dom';

const BusinessChat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messagesEndRef, setMessagesEndRef] = useState(null);
  const [activeLead, setActiveLead] = useState(null); // Lead from URL or mentions

  const { freelancers, loading: listLoading, error: listError } = useBusinessChatList();

  // Check URL params for freelancerId and leadId on mount and after freelancers load
  useEffect(() => {
    const freelancerIdFromUrl = searchParams.get('freelancerId');
    const leadIdFromUrl = searchParams.get('leadId');
    const leadNameFromUrl = searchParams.get('leadName');
    
    if (freelancerIdFromUrl && !listLoading && freelancers.length > 0) {
      const id = parseInt(freelancerIdFromUrl, 10);
      if (!isNaN(id)) {
        // Verify freelancer exists in the list
        const freelancerExists = freelancers.some(f => f.id === id);
        if (freelancerExists) {
          setSelectedFreelancerId(id);
          
          // If leadId is provided, set active lead and pre-fill the message input with mention
          if (leadIdFromUrl && leadNameFromUrl) {
            const leadId = parseInt(leadIdFromUrl, 10);
            if (!isNaN(leadId)) {
              const leadName = decodeURIComponent(leadNameFromUrl);
              // Set active lead for display at top
              setActiveLead({ id: leadId, name: leadName });
              // Pre-fill mention in message input
              const mentionText = `@[${leadId}:${leadName}]`;
              setMessageInput(mentionText + ' ');
              // Focus the input after components are rendered
              setTimeout(() => {
                const input = document.querySelector('input[placeholder*="Type your message"]');
                if (input) {
                  input.focus();
                  // Move cursor to end of text
                  const length = mentionText.length + 1;
                  input.setSelectionRange(length, length);
                }
              }, 200);
            }
          }
        } else {
          toast.error('Freelancer not found or you cannot chat with this freelancer');
        }
        // Clean up URL param
        navigate('/business/chat', { replace: true });
      }
    }
  }, [searchParams, navigate, listLoading, freelancers]);

  const handleMentionClick = (leadId) => {
    // Ensure leadId is properly converted - it might be string or number
    if (!leadId) {
      console.error('handleMentionClick: No leadId provided');
      return;
    }
    const id = String(leadId).trim();
    if (!id || id === 'undefined' || id === 'null') {
      console.error('handleMentionClick: Invalid leadId', leadId);
      toast.error('Invalid lead ID');
      return;
    }
    navigate(`/business/leads/${id}`);
  };

  const { 
    messages, 
    loading: messagesLoading, 
    error: messagesError, 
    connected, 
    sending, 
    sendMessage 
  } = useFreelancerBusinessChat(selectedFreelancerId, null, 'business');

  const selectedFreelancer = freelancers.find(f => f.id === selectedFreelancerId);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;

    // Extract mentioned lead from message if any
    const mentionMatch = messageInput.match(/@\[(\d+):([^\]]+)\]/);
    if (mentionMatch) {
      const leadId = parseInt(mentionMatch[1], 10);
      const leadName = mentionMatch[2];
      if (!isNaN(leadId) && leadName) {
        // Set as active lead if not already set
        if (!activeLead || activeLead.id !== leadId) {
          setActiveLead({ id: leadId, name: leadName });
        }
      }
    }

    await sendMessage(messageInput.trim());
    setMessageInput('');
    setTimeout(scrollToBottom, 100);
  };

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <Helmet>
        <title>Chat - Business Portal</title>
        <meta name="description" content="Chat with freelancers" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle
            title="Chat"
            subtitle="Communicate with freelancers who have submitted leads"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Freelancer List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Freelancers ({freelancers.length})
                </h3>
            </div>

              {listLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : listError ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <p className="text-red-500 text-center">{listError}</p>
                </div>
              ) : freelancers.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center">
                    <FiMessageSquare className="mx-auto text-gray-400 text-4xl mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">No freelancers to chat with</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Freelancers will appear here after they submit leads
                    </p>
              </div>
            </div>
              ) : (
          <div className="flex-1 overflow-y-auto">
                  {freelancers.map((freelancer) => (
                    <button
                      key={freelancer.id}
                      onClick={() => setSelectedFreelancerId(freelancer.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                        selectedFreelancerId === freelancer.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <FiUser className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {escapeHtml(freelancer.fullName || 'Unknown')}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {escapeHtml(freelancer.email || '')}
                          </p>
                        </div>
                    </div>
                    </button>
                ))}
              </div>
            )}
        </div>

        {/* Chat Area */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
              {!selectedFreelancerId ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FiMessageSquare className="mx-auto text-gray-400 text-5xl mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Select a freelancer to start chatting
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a freelancer from the list to view your conversation
                    </p>
                  </div>
                </div>
              ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <FiUser className="text-blue-600 dark:text-blue-400" />
                      </div>
                        <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {escapeHtml(selectedFreelancer?.fullName || 'Unknown')}
                          </h3>
                        <div className="flex items-center gap-2 text-sm">
                          {connected ? (
                            <>
                              <FiWifi className="text-green-500" />
                              <span className="text-green-600 dark:text-green-400">Connected</span>
                            </>
                          ) : (
                            <>
                              <FiWifiOff className="text-gray-400" />
                              <span className="text-gray-500 dark:text-gray-400">Connecting...</span>
                            </>
                              )}
                            </div>
                          </div>
                        </div>
              </div>

                  {/* Active Lead Section (from URL or mentions) */}
                  {activeLead && (
                    <ActiveLead
                      lead={activeLead}
                      onLeadClick={handleMentionClick}
                      onDismiss={() => setActiveLead(null)}
                    />
                  )}

                  {/* Tagged Leads Section (from messages) */}
                  <TaggedLeads
                    messages={messages}
                    onLeadClick={(leadId) => {
                      // leadId from TaggedLeads is already a string (from part.leadId)
                      // Convert to number for consistency
                      const id = typeof leadId === 'string' ? leadId : String(leadId);
                      handleMentionClick(id);
                      // Also set as active lead when clicked
                      const mentionedLead = messages
                        .flatMap(m => {
                          const parts = renderMessageWithMentions(m.message);
                          return parts.filter(p => p.type === 'mention' && String(p.leadId) === String(leadId));
                        })[0];
                      if (mentionedLead) {
                        setActiveLead({ id: id, name: mentionedLead.leadName });
                      }
                    }}
                  />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : messagesError ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-red-500">{messagesError}</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <FiMessageSquare className="mx-auto text-gray-400 text-4xl mb-2" />
                          <p className="text-gray-600 dark:text-gray-400">No messages yet</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Start the conversation!
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isBusiness = message.senderType === 'BUSINESS';
                        const isCurrentUser = isBusiness; // Business is always current user for business portal

                  return (
                          <div
                      key={message.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                              className={`max-w-[70%] rounded-2xl p-3 ${
                                isCurrentUser
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {renderMessageWithMentions(message.message).map((part, idx) => {
                                  if (part.type === 'mention') {
                                    return (
                                      <span
                                        key={idx}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (part.leadId) {
                                            handleMentionClick(String(part.leadId));
                                          }
                                        }}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md cursor-pointer transition-colors mx-1 ${
                                          isCurrentUser
                                            ? 'bg-blue-400/30 text-blue-100 hover:bg-blue-400/50'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                        }`}
                                        title="Click to view lead details"
                                      >
                                        <FiFileText size={12} />
                                        <span className="font-medium">{escapeHtml(part.leadName)}</span>
                                      </span>
                                    );
                                  }
                                  return <span key={idx}>{escapeHtml(part.content)}</span>;
                                })}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  isCurrentUser
                                    ? 'text-blue-100'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                {formatDateTime(message.createdAt)}
                              </p>
                        </div>
                      </div>
                  );
                      })
                    )}
                    <div ref={(el) => setMessagesEndRef(el)} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                      <MentionInput
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                        onSend={handleSendMessage}
                        placeholder="Type your message... (Use @ to mention a lead)"
                        disabled={!connected || sending}
                        maxLength={2000}
                        freelancerId={selectedFreelancerId}
                        userType="business"
                  />
                  <button
                    type="submit"
                        disabled={!messageInput.trim() || !connected || sending}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FiSend />
                        {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusinessChat;

