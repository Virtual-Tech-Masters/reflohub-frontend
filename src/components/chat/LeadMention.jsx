import { FiFileText } from 'react-icons/fi';

/**
 * Component to render a lead mention in a message
 * @param {string} text - The message text with mentions in format @[id:name]
 */
export const renderMessageWithMentions = (text) => {
  // Regex to match @[id:name] pattern
  const mentionRegex = /@\[(\d+):([^\]]+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add mention
    const leadId = match[1];
    const leadName = match[2];
    parts.push({
      type: 'mention',
      leadId,
      leadName,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  // If no mentions found, return original text
  if (parts.length === 0) {
    return [{ type: 'text', content: text }];
  }

  return parts;
};

/**
 * Component to display a single message with mentions rendered
 */
const LeadMention = ({ message, onMentionClick }) => {
  const parts = renderMessageWithMentions(message);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <span
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (part.leadId) {
                  onMentionClick?.(String(part.leadId));
                }
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors mx-1"
              title="Click to view lead details"
            >
              <FiFileText size={12} />
              <span className="font-medium">{part.leadName}</span>
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </>
  );
};

export default LeadMention;

