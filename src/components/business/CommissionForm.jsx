import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDollarSign, FiPercent, FiCheck, FiX as FiXIcon } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { businessAPI } from '../../utils/api';

const CommissionForm = ({ 
  open, 
  onClose, 
  lead, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    commissionType: 'FIXED',
    proposedCommissionCents: '',
    proposedCommissionPctBps: '',
    commissionCurrency: 'usd',
    approvalNotes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Populate form with existing commission data when lead changes
  useEffect(() => {
    if (lead && lead.commission && lead.commission.length > 0) {
      const latestCommission = lead.commission[0]; // Get the most recent commission
      setFormData({
        commissionType: latestCommission.commissionType || 'FIXED',
        proposedCommissionCents: latestCommission.proposedCommissionCents || latestCommission.finalCommissionCents || '',
        proposedCommissionPctBps: latestCommission.proposedCommissionPctBps || latestCommission.finalCommissionPctBps || '',
        commissionCurrency: latestCommission.currency || 'usd',
        approvalNotes: ''
      });
    } else {
      // Reset form for new commission
      setFormData({
        commissionType: 'FIXED',
        proposedCommissionCents: '',
        proposedCommissionPctBps: '',
        commissionCurrency: 'usd',
        approvalNotes: ''
      });
    }
  }, [lead]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.commissionType) {
      newErrors.commissionType = 'Please select commission type';
    }
    
    if (formData.commissionType === 'FIXED' && !formData.proposedCommissionCents) {
      newErrors.proposedCommissionCents = 'Please enter commission amount';
    }
    
    if (formData.commissionType === 'PERCENTAGE' && !formData.proposedCommissionPctBps) {
      newErrors.proposedCommissionPctBps = 'Please enter commission percentage';
    }
    
    if (formData.commissionType === 'FIXED' && formData.proposedCommissionCents && parseFloat(formData.proposedCommissionCents) <= 0) {
      newErrors.proposedCommissionCents = 'Commission amount must be greater than 0';
    }
    
    if (formData.commissionType === 'PERCENTAGE' && formData.proposedCommissionPctBps && (parseFloat(formData.proposedCommissionPctBps) <= 0 || parseFloat(formData.proposedCommissionPctBps) > 100)) {
      newErrors.proposedCommissionPctBps = 'Commission percentage must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // First approve the lead
      await businessAPI.approveLead(lead.id, formData.approvalNotes || null);
      
      // Then set the commission
      const commissionData = {
        commissionType: formData.commissionType,
        ...(formData.commissionType === 'FIXED' && {
          proposedCommissionCents: Math.round(parseFloat(formData.proposedCommissionCents) * 100) // Convert to cents
        }),
        ...(formData.commissionType === 'PERCENTAGE' && {
          proposedCommissionPctBps: Math.round(parseFloat(formData.proposedCommissionPctBps) * 100) // Convert to basis points
        }),
        commissionCurrency: formData.commissionCurrency
      };
      
      await businessAPI.proposeCommission(lead.id, commissionData);
      
      toast.success('Lead approved and commission set successfully!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to propose commission:', error);
      const message = error.response?.data?.message || 'Failed to propose commission';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!rejectReason || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setLoading(true);
    
    try {
      await businessAPI.rejectLead(lead.id, rejectReason);
      toast.success('Lead rejected successfully!');
      setRejectReason('');
      setShowRejectModal(false);
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to reject lead. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!open) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Review Lead: {lead.leadName}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {/* Lead Details */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Lead Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {lead.leadEmail || 'No email'} | {lead.leadPhone || 'No phone'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Submitted</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(lead.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                {lead.details && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
                    <p className="text-sm text-gray-900 dark:text-white">{lead.details}</p>
                  </div>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Commission Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commission Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    formData.commissionType === 'FIXED' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      name="commissionType"
                      value="FIXED"
                      checked={formData.commissionType === 'FIXED'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <FiDollarSign className="mr-2 text-primary-500" />
                      <span className="font-medium">Fixed Amount</span>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    formData.commissionType === 'PERCENTAGE' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      name="commissionType"
                      value="PERCENTAGE"
                      checked={formData.commissionType === 'PERCENTAGE'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <FiPercent className="mr-2 text-primary-500" />
                      <span className="font-medium">Percentage</span>
                    </div>
                  </label>
                </div>
                {errors.commissionType && (
                  <p className="text-red-500 text-sm mt-1">{errors.commissionType}</p>
                )}
              </div>
              
              {/* Commission Amount */}
              {formData.commissionType === 'FIXED' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commission Amount (USD) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="proposedCommissionCents"
                      value={formData.proposedCommissionCents}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.proposedCommissionCents ? 'border-red-500' : ''}`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  {errors.proposedCommissionCents && (
                    <p className="text-red-500 text-sm mt-1">{errors.proposedCommissionCents}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commission Percentage *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="proposedCommissionPctBps"
                      value={formData.proposedCommissionPctBps}
                      onChange={handleInputChange}
                      className={`input-field pr-8 ${errors.proposedCommissionPctBps ? 'border-red-500' : ''}`}
                      placeholder="0.00"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                  {errors.proposedCommissionPctBps && (
                    <p className="text-red-500 text-sm mt-1">{errors.proposedCommissionPctBps}</p>
                  )}
                </div>
              )}
              
              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  name="commissionCurrency"
                  value={formData.commissionCurrency}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                  <option value="inr">INR</option>
                </select>
              </div>
              
              {/* Approval Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Approval Notes
                </label>
                <textarea
                  name="approvalNotes"
                  value={formData.approvalNotes}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Add any notes about this lead approval..."
                />
              </div>
              
              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  className="btn-error flex items-center gap-2"
                >
                  <FiXIcon /> Reject Lead
                </button>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiCheck />
                    )}
                    {loading ? 'Processing...' : 'Approve & Set Commission'}
                  </button>
                </div>
              </div>
            </form>
            
            {/* Reject Modal */}
            {showRejectModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reject Lead</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Please provide a reason for rejecting this lead:
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter rejection reason..."
                    required
                  />
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectReason('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={loading || !rejectReason.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiXIcon />
                      )}
                      {loading ? 'Rejecting...' : 'Reject Lead'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommissionForm;
