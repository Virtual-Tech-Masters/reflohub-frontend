import { useMemo } from 'react';
import { FiFileText, FiX } from 'react-icons/fi';
import { escapeHtml } from '../../utils/helpers';
import { renderMessageWithMentions } from './LeadMention';

/**
 * Component to display all tagged leads from messages at the top of chat
 * @param {Array} messages - Array of chat messages
 * @param {function} onLeadClick - Callback when a lead is clicked
 * @param {function} onRemove - Optional callback to remove a tag filter
 */
const TaggedLeads = ({ messages = [], onLeadClick, onRemove }) => {
  // Extract all unique mentioned leads from all messages
  const taggedLeads = useMemo(() => {
    const leadMap = new Map();
    
    messages.forEach(message => {
      const parts = renderMessageWithMentions(message.message);
      parts.forEach(part => {
        if (part.type === 'mention') {
          // Store unique leads by ID
          if (!leadMap.has(part.leadId)) {
            leadMap.set(part.leadId, {
              id: part.leadId,
              name: part.leadName,
            });
          }
        }
      });
    });
    
    return Array.from(leadMap.values());
  }, [messages]);

  if (taggedLeads.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FiFileText className="text-blue-600 dark:text-blue-400" size={16} />
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
            Tagged Leads
          </span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {taggedLeads.map(lead => (
          <button
            key={lead.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (lead?.id) {
                onLeadClick?.(String(lead.id));
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors group"
          >
            <FiFileText size={14} />
            <span className="text-sm font-medium">{escapeHtml(lead.name)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaggedLeads;

