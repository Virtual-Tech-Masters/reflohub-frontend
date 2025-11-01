import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiPhone, FiMail, FiFileText, FiDollarSign } from 'react-icons/fi';
import { freelancerAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/helpers';

const LeadSubmitModal = ({ open, onClose, onSubmit, businesses, selectedBusiness, creditBalance }) => {
  const [formData, setFormData] = useState({
    businessId: '',
    leadName: '',
    leadPhone: '',
    leadEmail: '',
    details: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [businessesList, setBusinessesList] = useState([]);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (open) {
      loadBusinesses();
      // If a specific business is selected, pre-fill it
      if (selectedBusiness) {
        setFormData(prev => ({
          ...prev,
          businessId: selectedBusiness.id
        }));
      }
    } else {
      // Reset form when modal closes
      setFormData({
        businessId: '',
        leadName: '',
        leadPhone: '',
        leadEmail: '',
        details: ''
      });
      setErrors({});
    }
  }, [open, selectedBusiness]);
  
  const loadBusinesses = async () => {
    try {
      // In a real app, you would fetch businesses from the API
      // For now, we'll use the passed businesses prop
      setBusinessesList(businesses || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation (matching backend schema)
    if (!formData.businessId) {
      newErrors.businessId = 'Please select a business';
    }
    
    if (!formData.leadName.trim()) {
      newErrors.leadName = 'Lead name is required';
    } else if (formData.leadName.trim().length < 2) {
      newErrors.leadName = 'Lead name must be at least 2 characters';
    } else if (formData.leadName.trim().length > 140) {
      newErrors.leadName = 'Lead name must be less than 140 characters';
    }
    
    // Optional fields validation (matching backend schema)
    if (formData.leadPhone && !/^[0-9+\-\s()]{7,20}$/.test(formData.leadPhone.trim())) {
      newErrors.leadPhone = 'Please enter a valid phone number';
    }
    
    if (formData.leadEmail && !/\S+@\S+\.\S+/.test(formData.leadEmail.trim())) {
      newErrors.leadEmail = 'Please enter a valid email address';
    }
    
    if (formData.details && formData.details.trim().length > 2000) {
      newErrors.details = 'Details must be less than 2000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare the data for submission (matching backend schema exactly)
      const submitData = {
        businessId: parseInt(formData.businessId),
        leadName: formData.leadName.trim(),
        leadPhone: formData.leadPhone.trim() || null,
        leadEmail: formData.leadEmail.trim().toLowerCase() || null, // Backend expects lowercase email
        details: formData.details.trim() || null
      };
      
      // Submit lead to backend
      const response = await freelancerAPI.submitLead(submitData);
      
      // Call the parent onSubmit callback
      onSubmit && onSubmit(response.data);
      
      toast.success('Lead submitted successfully!');
      onClose();
    } catch (error) {
      // Handle insufficient credits error (402)
      if (error.response?.status === 402) {
        toast.error('Insufficient credits! You need at least 1 credit to submit a lead.', {
          duration: 6000
        });
      } else {
        toast.error(getErrorMessage(error));
      }
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
                Submit New Lead
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {/* Credit Balance */}
            <div className={`p-4 rounded-lg mb-6 ${
              creditBalance < 1 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                : 'bg-primary-50 dark:bg-primary-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  creditBalance < 1 
                    ? 'text-red-700 dark:text-red-300' 
                    : 'text-primary-700 dark:text-primary-300'
                }`}>
                  Available Credits
                </span>
                <span className={`text-2xl font-bold ${
                  creditBalance < 1 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-primary-600 dark:text-primary-400'
                }`}>
                  {creditBalance}
                </span>
              </div>
              <p className={`text-xs mt-1 ${
                creditBalance < 1 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-primary-600 dark:text-primary-400'
              }`}>
                {creditBalance < 1 
                  ? 'You need at least 1 credit to submit a lead. Purchase credits to continue.' 
                  : 'Each lead submission costs 1 credit'
                }
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {selectedBusiness ? 'Selected Business' : 'Select Business *'}
                </label>
                {selectedBusiness ? (
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-primary-900 dark:text-primary-100">
                          {selectedBusiness.name}
                        </h3>
                        <p className="text-sm text-primary-700 dark:text-primary-300">
                          {selectedBusiness.category?.name || 'General'}
                        </p>
                        <p className="text-xs text-primary-600 dark:text-primary-400">
                          {selectedBusiness.location?.state}, {selectedBusiness.location?.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedBusiness.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {selectedBusiness.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <select
                    name="businessId"
                    value={formData.businessId}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a business</option>
                    {businessesList.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name} - {business.category?.name || 'General'}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Lead Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lead Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="leadName"
                    value={formData.leadName}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.leadName ? 'border-red-500' : ''}`}
                    placeholder="Company or contact name"
                    required
                  />
                </div>
                {errors.leadName && (
                  <p className="text-red-500 text-sm mt-1">{errors.leadName}</p>
                )}
              </div>
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="leadPhone"
                      value={formData.leadPhone}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.leadPhone ? 'border-red-500' : ''}`}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  {errors.leadPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.leadPhone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="leadEmail"
                      value={formData.leadEmail}
                      onChange={handleInputChange}
                      className={`input-field pl-10 ${errors.leadEmail ? 'border-red-500' : ''}`}
                      placeholder="contact@company.com"
                    />
                  </div>
                  {errors.leadEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.leadEmail}</p>
                  )}
                </div>
              </div>
              
              
              {/* Lead Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lead Details
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FiFileText className="text-gray-400" />
                  </div>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    className={`input-field pl-10 pt-3 ${errors.details ? 'border-red-500' : ''}`}
                    rows="4"
                    placeholder="Describe the lead opportunity, project details, budget range, timeline, etc."
                    maxLength={2000}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Provide as much detail as possible to help the business understand the opportunity
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.details.length}/2000 characters
                  </p>
                </div>
                {errors.details && (
                  <p className="text-red-500 text-sm mt-1">{errors.details}</p>
                )}
              </div>
              
              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || creditBalance < 1}
                  className={`flex items-center ${
                    creditBalance < 1 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'btn-primary'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <FiDollarSign className="mr-2" />
                  )}
                  {loading 
                    ? 'Submitting...' 
                    : creditBalance < 1 
                      ? 'Insufficient Credits' 
                      : 'Submit Lead (1 Credit)'
                  }
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeadSubmitModal;