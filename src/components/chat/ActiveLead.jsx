import { FiFileText, FiX } from 'react-icons/fi';
import { escapeHtml } from '../../utils/helpers';

/**
 * Component to display the active/selected lead at the top of chat
 * This is shown when user navigates from a lead page to chat
 * @param {Object} lead - Lead object with id and name
 * @param {function} onLeadClick - Callback when lead is clicked
 * @param {function} onDismiss - Optional callback to dismiss the active lead display
 */
const ActiveLead = ({ lead, onLeadClick, onDismiss }) => {
  if (!lead || !lead.id) {
    return null;
  }

  return (
    <div className="bg-blue-500 dark:bg-blue-600 border-b border-blue-600 dark:border-blue-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-400 dark:bg-blue-500 rounded-full flex items-center justify-center">
            <FiFileText className="text-white" size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-blue-100 uppercase tracking-wide">
              Talking About This Lead
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (lead?.id) {
                  onLeadClick?.(String(lead.id));
                }
              }}
              className="text-white font-semibold text-base hover:underline flex items-center gap-2 mt-0.5"
            >
              <span>{escapeHtml(lead.name)}</span>
              <span className="text-blue-200 text-sm">(Click to view)</span>
            </button>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-blue-100 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <FiX size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveLead;

