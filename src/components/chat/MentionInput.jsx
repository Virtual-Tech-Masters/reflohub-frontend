import { useState, useRef, useEffect, useCallback } from 'react';
import LeadMentionModal from './LeadMentionModal';
import { useChatLeads } from '../../hooks/useChatLeads';

/**
 * Enhanced input component with lead mention functionality
 * @param {string} value - Input value
 * @param {function} onChange - onChange handler
 * @param {function} onSend - onSend handler (for Enter key)
 * @param {string} placeholder - Input placeholder
 * @param {boolean} disabled - Whether input is disabled
 * @param {number|null} freelancerId - For business users: freelancer ID
 * @param {number|null} businessId - For freelancer users: business ID
 * @param {string} userType - 'business' or 'freelancer'
 */
const MentionInput = ({
  value,
  onChange,
  onSend,
  placeholder = 'Type your message...',
  disabled = false,
  freelancerId = null,
  businessId = null,
  userType = 'business',
  ...props
}) => {
  const inputRef = useRef(null);
  const [showMentionModal, setShowMentionModal] = useState(false);

  const { leads, loading: leadsLoading } = useChatLeads(freelancerId, businessId, userType);

  // Handle input change and detect @ mentions
  const handleChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Find @ symbol before cursor
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if there's a space or newline after @ (mention is complete)
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        // Check if we just typed @ (no characters after it yet)
        if (textAfterAt.length === 0 && !showMentionModal) {
          // Open modal when @ is typed
          setShowMentionModal(true);
        } else if (textAfterAt.length > 0) {
          // If user continues typing after @, close modal
          setShowMentionModal(false);
        }
      } else {
        // Mention completed (space or newline found)
        setShowMentionModal(false);
      }
    } else {
      // No @ found
      setShowMentionModal(false);
    }
    
    onChange(e);
  };

  // Handle lead selection
  const handleSelectLead = useCallback((lead) => {
    const currentValue = value;
    const cursorPosition = inputRef.current?.selectionStart || currentValue.length;
    
    // Find @ symbol before cursor
    const textBeforeCursor = currentValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Replace @ and anything after it with @[leadId:Lead Name]
      const textBeforeAt = currentValue.substring(0, lastAtIndex);
      const textAfterAt = currentValue.substring(cursorPosition);
      const mentionText = `@[${lead.id}:${lead.name}]`;
      const newValue = textBeforeAt + mentionText + ' ' + textAfterAt;
      
      onChange({ target: { value: newValue } });
      
      // Set cursor position after mention + space
      setTimeout(() => {
        const newCursorPos = textBeforeAt.length + mentionText.length + 1;
        inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        inputRef.current?.focus();
      }, 0);
    }
    
    setShowMentionModal(false);
  }, [value, onChange]);

  // Handle keyboard events
  const handleKeyDown = (e) => {
    // Don't interfere with modal keyboard navigation
    if (showMentionModal) {
      // Let the modal handle its own keyboard events
      return;
    }

    // Normal Enter key handling (send message)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  return (
    <div className="relative flex-1">
      <input
        {...props}
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />
      
      <LeadMentionModal
        isOpen={showMentionModal}
        onClose={() => setShowMentionModal(false)}
        leads={leads}
        onSelect={handleSelectLead}
      />
    </div>
  );
};

export default MentionInput;

