import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiRefreshCw, FiCreditCard, FiShield, FiZap } from 'react-icons/fi';
import { businessAPI, commonAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/helpers';

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingSubscription, setStartingSubscription] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [addVerifiedBadge, setAddVerifiedBadge] = useState(true); // Default to true
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Reset verified badge checkbox when plan changes
  useEffect(() => {
    if (selectedPlan) {
      setAddVerifiedBadge(true); // Reset to true when plan changes
    }
  }, [selectedPlan]);

  // Check if user is authenticated and is a business user
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (currentUser.role !== 'BUSINESS') {
      navigate(`/${currentUser.role.toLowerCase()}`);
      return;
    }
    
    if (currentUser.isActive) {
      navigate('/business');
      return;
    }
  }, [currentUser, navigate]);

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await commonAPI.getBusinessSubscriptionPlans();
        setPlans(response.data || []);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Check user status periodically
  const checkUserStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await businessAPI.me();
      
      if (response.data?.isActive) {
        toast.success('Account activated! Redirecting to dashboard...');
        setTimeout(() => navigate('/business'), 1500);
      } else {
        toast.info('Your account is still pending activation. Please complete the subscription process.');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Start subscription
  const handleStartSubscription = async () => {
    if (!selectedPlan) {
      toast.error('Please select a subscription plan');
      return;
    }

    try {
      setStartingSubscription(true);
      
      const requestData = {
        planName: selectedPlan.name,
        region: 'GLOBAL', // Default region, could be made dynamic later
        couponCodes: ['FREE_CYCLES_2'], // Default coupon
        addonVerifiedBadge: selectedPlan.name !== 'PREMIUM' ? addVerifiedBadge : false
      };
      
      const response = await businessAPI.startSubscription(requestData);
      
      // Check for both sessionUrl and url properties
      const checkoutUrl = response.data?.sessionUrl || response.data?.url;
      
      if (checkoutUrl) {
        // Open Stripe checkout session
        window.location.href = checkoutUrl;
      } else {
        toast.error('Failed to create payment session. Please try again or contact support.');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setStartingSubscription(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
              Choose Your Plan
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Select a subscription plan to activate your business account and start receiving qualified leads.
            </p>
          </motion.div>

          {/* Plans Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                className={`relative bg-white/10 backdrop-blur-xl border rounded-3xl p-8 shadow-2xl cursor-pointer transition-all duration-300 ${
                  selectedPlan?.id === plan.id
                    ? 'border-blue-400/50 bg-blue-500/10 scale-105'
                    : 'border-white/20 hover:border-white/40 hover:scale-102'
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                {selectedPlan?.id === plan.id && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FiCheck className="w-5 h-5 text-white" />
                  </div>
                )}
                
                {/* Coupon Badge */}
                <div className="absolute -top-3 -left-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-200 border border-green-400/30">
                    FREE_CYCLES_2
                  </span>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/70 mb-6">
                    {plan.versions && plan.versions.length > 0 && plan.versions[0].leadLimit 
                      ? `Perfect for businesses needing ${plan.versions[0].leadLimit} leads per month`
                      : 'Perfect for businesses with unlimited lead needs'
                    }
                  </p>
                  
                  {plan.versions && plan.versions.length > 0 && (
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-white mb-2">
                        ${(plan.versions[0].monthlyAmountCents / 100).toFixed(0)}
                        <span className="text-lg text-white/60">/month</span>
                      </div>
                      {plan.versions[0].setupAmountCents > 0 && (
                        <div className="text-white/60">
                          + ${(plan.versions[0].setupAmountCents / 100).toFixed(0)} setup fee
                        </div>
                      )}
                      {plan.versions[0].leadLimit && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30">
                            {plan.versions[0].leadLimit} leads/month
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-white/80">
                      <FiZap className="w-5 h-5 mr-3 text-blue-400" />
                      <span>
                        {plan.versions && plan.versions.length > 0 && plan.versions[0].leadLimit 
                          ? `${plan.versions[0].leadLimit} leads per month`
                          : 'Unlimited leads'
                        }
                      </span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <FiShield className="w-5 h-5 mr-3 text-green-400" />
                      <span>Secure payments</span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <FiCreditCard className="w-5 h-5 mr-3 text-purple-400" />
                      <span>Flexible billing</span>
                    </div>
                    {plan.versions && plan.versions.length > 0 && plan.versions[0].isExclusive && (
                      <div className="flex items-center text-white/80">
                        <FiZap className="w-5 h-5 mr-3 text-purple-400" />
                        <span>Exclusive plan</span>
                      </div>
                    )}
                    {plan.versions && plan.versions.length > 0 && plan.versions[0].hasVerifiedBadge && (
                      <div className="flex items-center text-white/80">
                        <FiShield className="w-5 h-5 mr-3 text-yellow-400" />
                        <span>Verified badge included</span>
                      </div>
                    )}
                    {plan.versions && plan.versions.length > 0 && !plan.versions[0].hasVerifiedBadge && plan.name !== 'PREMIUM' && (
                      <div className="flex items-center text-white/80">
                        <FiShield className="w-5 h-5 mr-3 text-blue-400" />
                        <span>Verified badge available as add-on</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Verified Badge Add-on - Only show for BASIC and STANDARD plans */}
          {selectedPlan && selectedPlan.name !== 'PREMIUM' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <FiShield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Verified Badge</h3>
                    <p className="text-white/70 text-sm">Get a verified badge to build trust with your customers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">
                      +${selectedPlan.versions && selectedPlan.versions.length > 0 && selectedPlan.versions[0].monthlyVerifiedBadgeAmountCents 
                        ? (selectedPlan.versions[0].monthlyVerifiedBadgeAmountCents / 100).toFixed(0)
                        : '5'
                      }/month
                    </div>
                    <div className="text-white/60 text-sm">Add-on price</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addVerifiedBadge}
                      onChange={(e) => setAddVerifiedBadge(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Price Summary */}
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="text-white/80">
                  <div className="font-medium">Monthly Plan</div>
                  <div className="text-sm text-white/60">
                    {selectedPlan.versions && selectedPlan.versions.length > 0 && selectedPlan.versions[0].leadLimit 
                      ? `${selectedPlan.versions[0].leadLimit} leads per month`
                      : 'Unlimited leads'
                    }
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    ${selectedPlan.versions && selectedPlan.versions.length > 0 
                      ? (selectedPlan.versions[0].monthlyAmountCents / 100).toFixed(0)
                      : '0'
                    }/month
                  </div>
                </div>
              </div>
              
              {/* Setup Fee */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <div className="text-white/80">
                  <div className="font-medium">Setup Fee</div>
                  <div className="text-sm text-white/60">One-time setup cost</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    ${selectedPlan.versions && selectedPlan.versions.length > 0 && selectedPlan.versions[0].setupAmountCents 
                      ? (selectedPlan.versions[0].setupAmountCents / 100).toFixed(0)
                      : '0'
                    }
                  </div>
                </div>
              </div>
              
              {selectedPlan.name !== 'PREMIUM' && addVerifiedBadge && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <div className="text-white/80">
                    <div className="font-medium">Verified Badge Add-on</div>
                    <div className="text-sm text-white/60">Build trust with customers</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">
                      +${selectedPlan.versions && selectedPlan.versions.length > 0 && selectedPlan.versions[0].monthlyVerifiedBadgeAmountCents 
                        ? (selectedPlan.versions[0].monthlyVerifiedBadgeAmountCents / 100).toFixed(0)
                        : '5'
                      }/month
                    </div>
                  </div>
                </div>
              )}
              
              {/* Coupon Applied */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <div className="text-white/80">
                  <div className="font-medium">Promo Applied</div>
                  <div className="text-sm text-white/60">FREE_CYCLES_2 - 2 free months</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-400">-100%</div>
                  <div className="text-white/60 text-sm">First 2 months</div>
                </div>
              </div>
              
              {/* Cost Breakdown */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                <div className="text-lg font-semibold text-white">Monthly Recurring</div>
                <div className="text-xl font-bold text-white">
                  ${selectedPlan.versions && selectedPlan.versions.length > 0 
                    ? ((selectedPlan.versions[0].monthlyAmountCents + 
                        (selectedPlan.name !== 'PREMIUM' && addVerifiedBadge && selectedPlan.versions[0].monthlyVerifiedBadgeAmountCents 
                          ? selectedPlan.versions[0].monthlyVerifiedBadgeAmountCents 
                          : 0)) / 100).toFixed(0)
                    : '0'
                  }/month
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-white/80">+ One-time Setup</div>
                <div className="text-white">
                  ${selectedPlan.versions && selectedPlan.versions.length > 0 && selectedPlan.versions[0].setupAmountCents 
                    ? (selectedPlan.versions[0].setupAmountCents / 100).toFixed(0)
                    : '0'
                  }
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={handleStartSubscription}
              disabled={!selectedPlan || startingSubscription}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/25 flex items-center"
            >
              {startingSubscription ? (
                <>
                  <FiRefreshCw className="animate-spin h-5 w-5 mr-3" />
                  Processing...
                </>
              ) : (
                <>
                  <FiCreditCard className="h-5 w-5 mr-3" />
                  Start Subscription
                </>
              )}
            </button>

            <button
              onClick={checkUserStatus}
              disabled={checkingStatus}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center"
            >
              {checkingStatus ? (
                <>
                  <FiRefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <FiRefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </>
              )}
            </button>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 bg-blue-500/10 border border-blue-400/30 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiShield className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-200 mb-2">
                  Secure Payment Processing
                </h3>
                <p className="text-blue-100/80">
                  Your payment is processed securely through Stripe. You can cancel or modify your subscription at any time.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
