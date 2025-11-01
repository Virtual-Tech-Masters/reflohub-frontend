import { useEffect, useRef, useState } from 'react';
import { FiFileText, FiX, FiSearch } from 'react-icons/fi';
import { escapeHtml } from '../../utils/helpers';

/**
 * Modal component for lead mentions
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Callback to close modal
 * @param {Array} leads - Array of leads to display
 * @param {function} onSelect - Callback when a lead is selected
 */
const LeadMentionModal = ({ isOpen, onClose, leads, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);
  const selectedItemRef = useRef(null);

  // Filter leads based on search query
  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.phone?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      `#${lead.id}`.includes(query)
    );
  });

  // Reset search and selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredLeads.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredLeads.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredLeads[selectedIndex]) {
          onSelect(filteredLeads[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, filteredLeads, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Mention a Lead
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select a lead to mention in your message
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="text-gray-500 dark:text-gray-400" size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0); // Reset selection when searching
              }}
              placeholder="Search by name, phone, email, or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Leads List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <FiFileText className="mx-auto text-gray-400 text-5xl mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'No leads found matching your search' : 'No leads available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLeads.map((lead, index) => (
                <button
                  key={lead.id}
                  ref={index === selectedIndex ? selectedItemRef : null}
                  onClick={() => onSelect(lead)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiFileText className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {escapeHtml(lead.name)}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          #{lead.id}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {lead.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📞 {escapeHtml(lead.phone)}
                          </p>
                        )}
                        {lead.email && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ✉️ {escapeHtml(lead.email)}
                          </p>
                        )}
                      </div>

                      {lead.status && (
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            lead.status === 'APPROVED' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                              : lead.status === 'REJECTED' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                              : lead.status === 'CONVERTED' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' 
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>Enter Select</span>
              <span>Esc Close</span>
            </div>
            <span>{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadMentionModal;

