import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BulkActionModal = ({ 
  isOpen, 
  onClose, 
  title, 
  selectedItems, 
  onConfirm, 
  actionType = 'update',
  confirmText = 'Confirm',
  isLoading = false 
}) => {
  const [notes, setNotes] = useState('');

  const handleConfirm = async () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }

    try {
      await onConfirm(selectedItems, notes);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const getActionIcon = () => {
    switch (actionType) {
      case 'verify':
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case 'delete':
        return <FiAlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <FiCheck className="w-5 h-5 text-blue-600" />;
    }
  };

  const getActionColor = () => {
    switch (actionType) {
      case 'verify':
        return 'bg-green-600 hover:bg-green-700';
      case 'delete':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getActionIcon()}
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  You are about to perform this action on <span className="font-semibold text-gray-900">{selectedItems.length}</span> items.
                </p>
                
                {actionType === 'verify' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <FiAlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">
                        This action will verify the selected items. Please ensure all required documents are reviewed.
                      </p>
                    </div>
                  </div>
                )}

                {actionType === 'delete' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <FiAlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <p className="text-sm text-red-800">
                        This action will delete the selected items. This cannot be undone.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this bulk action..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || selectedItems.length === 0}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${getActionColor()}`}
                >
                  {isLoading ? 'Processing...' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BulkActionModal;
