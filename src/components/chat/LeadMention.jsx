import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTag, FiSearch, FiUser, FiDollarSign } from 'react-icons/fi';

const LeadMention = ({ 
  isOpen, 
  onClose, 
  onSelectLead, 
  leads, 
  userType,
  position = { x: 0, y: 0 }
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef(null);

  // Filter leads based on search query
  const filteredLeads = leads.filter(lead => 
    lead.leadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.id.toString().includes(searchQuery)
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredLeads.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredLeads.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredLeads[selectedIndex]) {
            onSelectLead(filteredLeads[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredLeads, onSelectLead, onClose]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-w-sm w-full"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.max(position.y - 200, 10)
        }}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FiTag className="text-primary-600" size={16} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Tag a Lead
            </span>
          </div>
          
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <FiUser className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm font-medium mb-1">No relevant leads found</p>
              <p className="text-xs">Only leads from this conversation are shown</p>
            </div>
          ) : (
            filteredLeads.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                  index === selectedIndex 
                    ? 'bg-primary-50 dark:bg-primary-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => onSelectLead(lead)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {userType === 'BUSINESS' ? lead.leadName : `Lead #${lead.id}`}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        lead.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        lead.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        lead.status === 'ACKNOWLEDGED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {userType === 'BUSINESS' ? `Business Lead` : lead.businessName}
                      </span>
                      {lead.proposedCommissionCents && (
                        <span className="flex items-center gap-1">
                          <FiDollarSign size={12} />
                          ${(lead.proposedCommissionCents / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    #{lead.id}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeadMention;
