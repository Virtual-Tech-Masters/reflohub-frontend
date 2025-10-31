import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { businessAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const BillingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();

  const sessionId = searchParams.get('session_id');

  // Manual activation function (for debugging)
  const manualActivation = async () => {
    try {
      setCheckingStatus(true);
      toast.info('Attempting manual activation...');
      
      // Try to activate the account manually
      const response = await businessAPI.getProfile();
      // Manual activation check completed
      
      if (response.data.isActive) {
        const updatedUser = {
          ...currentUser,
          isActive: true
        };
        // setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Account activated successfully!');
        setTimeout(() => {
          navigate('/business');
        }, 2000);
      } else {
        toast.error('Account is still not active. Please contact support.');
      }
    } catch (error) {
      console.error('Manual activation error:', error);
      toast.error('Failed to activate account. Please contact support.');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Check user status after successful payment
  const checkUserStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await businessAPI.getProfile();
      setUserStatus(response.data);
      
        // Business status check completed
      
      if (response.data.isActive) {
        // Update the current user in AuthContext
        const updatedUser = {
          ...currentUser,
          isActive: true
        };
        // setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Payment successful! Your account is now active.');
        setTimeout(() => {
          navigate('/business');
        }, 2000);
      } else {
          // Account not yet active, will keep checking...
      }
    } catch (error) {
      console.error('Error checking business status:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again to complete your subscription.');
      } else {
        toast.error('Failed to verify payment status');
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  // Check status on component mount
  useEffect(() => {
    if (sessionId) {
      checkUserStatus();
    }
  }, [sessionId]);

  // Auto-refresh every 10 seconds if not active
  useEffect(() => {
    if (userStatus && !userStatus.isActive) {
      const interval = setInterval(() => {
        checkUserStatus();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [userStatus]);

  return (
    <>
      <Helmet>
        <title>Payment Successful - RefloHub</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Payment processing complete" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8"
            >
              <FiCheckCircle className="w-12 h-12 text-green-400" />
            </motion.div>

            {/* Success Message */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl font-bold bg-gradient-to-r from-white via-green-100 to-blue-100 bg-clip-text text-transparent mb-4"
            >
              Payment Successful!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-white/80 text-lg mb-8"
            >
              Thank you for your subscription. We're activating your account now.
            </motion.p>

            {/* Status Check */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl mb-8"
            >
              {checkingStatus ? (
                <div className="flex items-center justify-center">
                  <FiRefreshCw className="animate-spin h-6 w-6 text-blue-400 mr-3" />
                  <span className="text-white/80">Verifying payment...</span>
                </div>
              ) : userStatus ? (
                <div className="text-center">
                  {userStatus.isActive ? (
                    <div className="text-green-400">
                      <FiCheckCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-lg font-semibold">Account Activated!</p>
                      <p className="text-sm text-white/60">Redirecting to dashboard...</p>
                    </div>
                  ) : (
                    <div className="text-yellow-400">
                      <p className="text-lg font-semibold">Payment Processing</p>
                      <p className="text-sm text-white/60">Please wait while we activate your account...</p>
                      <div className="mt-4">
                        <p className="text-xs text-white/50 mb-2">
                          If this takes longer than expected, you can try refreshing or contact support.
                        </p>
                        <button
                          onClick={checkUserStatus}
                          className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
                        >
                          Check Status Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-white/80">Checking payment status...</p>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={checkUserStatus}
                disabled={checkingStatus}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center justify-center"
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

              <button
                onClick={manualActivation}
                disabled={checkingStatus}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium rounded-2xl transition-all duration-200 flex items-center justify-center"
              >
                {checkingStatus ? (
                  <>
                    <FiRefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Activating...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="h-4 w-4 mr-2" />
                    Manual Activation
                  </>
                )}
              </button>

              {userStatus?.isActive && (
                <button
                  onClick={() => navigate('/business')}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center"
                >
                  Go to Dashboard
                  <FiArrowRight className="h-4 w-4 ml-2" />
                </button>
              )}


              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center"
              >
                Go to Login
                <FiArrowRight className="h-4 w-4 ml-2" />
              </button>
            </motion.div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-8 bg-blue-500/10 border border-blue-400/30 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-blue-200 mb-2">
                  What's Next?
                </h3>
                <p className="text-blue-100/80">
                  Your subscription is now active! You can start receiving qualified leads and manage your business dashboard.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      </div>
    </>
  );
};

export default BillingSuccess;
