import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiTag, FiSmile } from 'react-icons/fi';
import LeadMention from './LeadMention';

const MessageInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Type a message...",
  leads = [],
  userType = 'FREELANCER',
  currentChat = null,
  disabled = false
}) => {
  const [showMention, setShowMention] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 });
  const [selectedLead, setSelectedLead] = useState(null);
  const inputRef = useRef(null);
  const mentionTriggerRef = useRef(null);

  // Filter leads to only show those relevant to current chat
  const getFilteredLeads = () => {
    if (!currentChat) return leads;
    
    // For freelancer: only show leads from the current business
    // For business: only show leads from the current freelancer
    return leads.filter(lead => {
      if (userType === 'FREELANCER') {
        // Show only leads that belong to the current business
        return lead.businessId === currentChat.businessId;
      } else {
        // Show only leads that belong to the current freelancer
        return lead.freelancerId === currentChat.freelancerId;
      }
    });
  };

  const filteredLeads = getFilteredLeads();

  // Handle mention trigger (@ symbol)
  const handleInputChange = (e) => {
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = e.target.value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    // Check if @ was just typed and there's no space after it
    if (lastAtIndex !== -1 && !textBeforeCursor.substring(lastAtIndex).includes(' ')) {
      const mentionText = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Show mention dropdown if @ is at the start or after a space
      if (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ') {
        setShowMention(true);
        setMentionPosition({
          x: e.target.offsetLeft,
          y: e.target.offsetTop - 10
        });
      }
    } else {
      setShowMention(false);
    }
    
    onChange(e);
  };

  // Handle lead selection from mention dropdown
  const handleSelectLead = (lead) => {
    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    // Replace @mention with lead tag
    const newText = textBeforeCursor.substring(0, lastAtIndex) + 
                   `@Lead#${lead.id}` + 
                   textAfterCursor;
    
    onChange({ target: { value: newText } });
    setShowMention(false);
    setSelectedLead(lead);
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        lastAtIndex + `@Lead#${lead.id}`.length,
        lastAtIndex + `@Lead#${lead.id}`.length
      );
    }, 0);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(e);
      setSelectedLead(null);
    }
  };

  // Handle mention button click
  const handleMentionClick = () => {
    const currentValue = value;
    const newValue = currentValue + ' @';
    onChange({ target: { value: newValue } });
    
    // Focus and position cursor after @
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(newValue.length, newValue.length);
    }, 0);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {/* Mention button */}
          <button
            ref={mentionTriggerRef}
            type="button"
            onClick={handleMentionClick}
            disabled={disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50"
            title="Tag a lead (@)"
          >
            <FiTag size={16} />
          </button>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!value.trim() || disabled}
          className="p-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
        >
          <FiSend size={16} />
        </motion.button>
      </form>

      {/* Lead Mention Dropdown */}
      <LeadMention
        isOpen={showMention}
        onClose={() => setShowMention(false)}
        onSelectLead={handleSelectLead}
        leads={filteredLeads}
        userType={userType}
        position={mentionPosition}
      />

      {/* Selected Lead Indicator */}
      {selectedLead && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-0 bg-primary-100 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg px-3 py-2 text-sm"
        >
          <div className="flex items-center gap-2">
            <FiTag className="text-primary-600" size={14} />
            <span className="text-primary-700 dark:text-primary-300">
              Tagged: {selectedLead.leadName || `Lead #${selectedLead.id}`}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MessageInput;
