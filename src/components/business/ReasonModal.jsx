import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiAlertCircle } from 'react-icons/fi';

const ReasonModal = ({ isOpen, onClose, onSubmit, title, placeholder, buttonText, loading = false }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      return;
    }
    onSubmit(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Please provide a reason</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
            placeholder={placeholder}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiX className="w-4 h-4" />
            )}
            {buttonText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReasonModal;
