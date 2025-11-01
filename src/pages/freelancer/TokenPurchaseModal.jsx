import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiCheck, FiShoppingCart } from 'react-icons/fi';
import { freelancerAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { getErrorMessage, formatCurrency } from '../../utils/helpers';

const CreditPurchaseModal = ({ open, onClose, onPurchase }) => {
  const [selectedPack, setSelectedPack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creditPacks, setCreditPacks] = useState([]);
  
  // Fetch credit packs when modal opens
  useEffect(() => {
    if (open) {
      fetchCreditPacks();
    }
  }, [open]);
  
  const fetchCreditPacks = async () => {
    try {
      const response = await freelancerAPI.listCreditPacks();
      setCreditPacks(response.data || []);
    } catch (error) {
      // Set empty array so the UI doesn't break
      setCreditPacks([]);
      toast.error(getErrorMessage(error));
    }
  };
  
  const handlePurchase = async () => {
    if (!selectedPack) {
      toast.error('Please select a credit pack');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await freelancerAPI.purchaseCredits({ packKey: selectedPack.packKey });
      
      if (response.data && response.data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Purchase Credits
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Credits are used to submit leads to businesses. Each lead submission costs 1 credit.
              </p>
            </div>
            
            {/* Credit Packs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {creditPacks.length > 0 ? creditPacks.map((pack, index) => (
                <div
                  key={pack.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPack === pack
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedPack(pack)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {pack.credits} Credits
                    </h3>
                    {selectedPack === pack && (
                      <FiCheck className="text-primary-500" size={20} />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {pack.amountCents ? formatCurrency(pack.amountCents) : 
                     pack.priceStripeId ? 'Price varies' : '$0.00'}
                  </p>
                  {pack.amountCents && pack.credits && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatCurrency(Math.round(pack.amountCents / pack.credits))} per credit
                    </p>
                  )}
                </div>
              )) : (
                <div className="col-span-full text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    <FiShoppingCart className="w-12 h-12 mx-auto mb-2" />
                    <p>Credit packs are currently unavailable</p>
                    <p className="text-sm">Please try again later or contact support</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Payment Method */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Payment Method
              </h3>
              <div className="flex items-center space-x-4">
                <FiCreditCard className="text-gray-400" size={24} />
                <span className="text-gray-700 dark:text-gray-300">
                  Credit Card (Stripe)
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Secure payment processing powered by Stripe
              </p>
            </div>
            
            {/* Purchase Summary */}
            {selectedPack && (
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-2">
                  Purchase Summary
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-primary-600 dark:text-primary-400">
                    {selectedPack.credits} Credits
                  </span>
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    {selectedPack.amountCents ? formatCurrency(selectedPack.amountCents) : '$0.00'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedPack || loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <FiShoppingCart className="mr-2" />
                )}
                {loading ? 'Processing...' : 'Purchase Credits'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreditPurchaseModal;