import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiZap, FiShield, FiCreditCard, FiRefreshCw, FiCheckCircle, FiStar, FiTrendingUp, FiUsers, FiDollarSign, FiGift, FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { commonAPI, freelancerAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const FreelancerSubscription = () => {
  const authContext = useAuth();
  
  // Handle case where auth context might be undefined
  if (!authContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading authentication...</p>
        </div>
      </div>
    );
  }
  
  const { currentUser, updateProfile } = authContext;
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingSubscription, setStartingSubscription] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Redirect if user is already active
  useEffect(() => {
    if (currentUser && currentUser.isActive) {
      navigate('/freelancer');
    }
  }, [currentUser, navigate]);

  // Periodically check if user became active (for webhook activation)
  useEffect(() => {
    if (!currentUser || currentUser.isActive) return;

    const checkInterval = setInterval(async () => {
      try {
        const response = await freelancerAPI.getProfile();
        if (response.data.isActive) {
          updateProfile(response.data);
          clearInterval(checkInterval);
        }
      } catch (error) {
        console.log('Periodic check failed:', error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkInterval);
  }, [currentUser, updateProfile]);

  // Fetch subscription plans only
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        
        // Fetch subscription plans only
        const plansResponse = await commonAPI.getFreelancerSubscriptionPlans();
        setPlans(plansResponse.data);
        console.log('Freelancer subscription plans:', plansResponse.data);
        
        // Debug: Log the first plan's structure
        if (plansResponse.data && plansResponse.data.length > 0) {
          console.log('First plan structure:', plansResponse.data[0]);
          if (plansResponse.data[0].versions && plansResponse.data[0].versions.length > 0) {
            console.log('First plan version:', plansResponse.data[0].versions[0]);
          }
        }
        
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        toast.error('Failed to load subscription plans');
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
      const response = await freelancerAPI.getProfile();
      console.log('User status check:', response.data);
      console.log('isActive status:', response.data.isActive);
      console.log('Full user data:', JSON.stringify(response.data, null, 2));

      if (response.data.isActive) {
        // Update the cached user data using updateProfile
        updateProfile(response.data);
        
        toast.success('Account activated! Redirecting to dashboard...');
        navigate('/freelancer');
      } else {
        toast.info('Account not yet activated. Please wait a moment and try again.');
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      toast.error('Failed to check account status');
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
      
      const response = await freelancerAPI.startSubscription({
        planName: selectedPlan.name
      });
      
      console.log('Subscription response:', response.data);
      
      // Check for different possible response formats
      if (response.data) {
        if (response.data.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = response.data.checkoutUrl;
        } else if (response.data.url) {
          // Alternative URL field
          window.location.href = response.data.url;
        } else if (response.data.sessionUrl) {
          // Another possible field name
          window.location.href = response.data.sessionUrl;
        } else if (response.data.redirectUrl) {
          // Another possible field name
          window.location.href = response.data.redirectUrl;
        } else {
          console.error('No checkout URL found in response:', response.data);
          toast.error('Failed to create checkout session - no URL returned');
        }
      } else {
        console.error('No data in response:', response);
        toast.error('Failed to create checkout session - no response data');
      }
    } catch (error) {
      console.error('Error starting subscription:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to start subscription');
    } finally {
      setStartingSubscription(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Choose Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Freelancer Package</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Select the perfect package to start earning commissions from lead submissions. 
              Choose the plan that fits your earning goals and budget.
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

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/70 mb-6">Perfect for {plan.name.toLowerCase()} freelancers</p>
                  
                  {plan.versions && plan.versions.length > 0 ? (
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-white mb-2">
                        ${plan.versions[0].planAmountCents ? (plan.versions[0].planAmountCents / 100).toFixed(2) : '0.00'}
                        <span className="text-lg text-white/60">/month</span>
                      </div>
                      {plan.versions[0].planAmountOriginalCents && plan.versions[0].planAmountOriginalCents > plan.versions[0].planAmountCents && (
                        <div className="text-white/60">
                          <span className="line-through">${(plan.versions[0].planAmountOriginalCents / 100).toFixed(2)}</span>
                          <span className="ml-2 text-green-400">Save ${((plan.versions[0].planAmountOriginalCents - plan.versions[0].planAmountCents) / 100).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-white mb-2">
                        $0<span className="text-lg text-white/60">/month</span>
                      </div>
                      <div className="text-white/60 text-sm">Pricing not available</div>
                    </div>
                  )}

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-white/80">
                      <FiGift className="w-5 h-5 mr-3 text-green-400" />
                      <span>{plan.versions?.[0]?.creditsGranted || 0} credits/month</span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <FiDollarSign className="w-5 h-5 mr-3 text-green-400" />
                      <span>Commission earnings</span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <FiUsers className="w-5 h-5 mr-3 text-blue-400" />
                      <span>Access to businesses</span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <FiTrendingUp className="w-5 h-5 mr-3 text-purple-400" />
                      <span>Performance tracking</span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <FiShield className="w-5 h-5 mr-3 text-yellow-400" />
                      <span>Secure payments</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartSubscription}
              disabled={!selectedPlan || startingSubscription}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-3"
            >
              {startingSubscription ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5" />
                  Start Subscription
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={checkUserStatus}
              disabled={checkingStatus}
              className="w-full sm:w-auto px-6 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-3"
            >
              {checkingStatus ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Checking...
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-4 h-4" />
                  Check Activation Status
                </>
              )}
            </motion.button>
          </motion.div>


          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-8">Why Choose Our Platform?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiStar className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">High-Quality Leads</h4>
                <p className="text-white/70">Access to verified, high-value business leads</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Earn More</h4>
                <p className="text-white/70">Competitive commission rates and bonuses</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Secure & Reliable</h4>
                <p className="text-white/70">Protected payments and guaranteed commissions</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FreelancerSubscription;
