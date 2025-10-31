import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { freelancerAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const FreelancerBillingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();

  const sessionId = searchParams.get('session_id');

  // Check user status after successful payment
  const checkUserStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await freelancerAPI.getProfile();
      setUserStatus(response.data);
      
      if (response.data.isActive) {
        // Update the current user in AuthContext
        const updatedUser = {
          ...currentUser,
          isActive: true
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Payment successful! Your account is now active.');
        setTimeout(() => {
          navigate('/freelancer');
        }, 2000);
      }
    } catch (error) {
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Helmet>
        <title>Payment Success - Freelancer Portal</title>
        <meta name="description" content="Your subscription payment was successful" />
      </Helmet>

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
          className="w-full max-w-2xl text-center"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Payment <span className="bg-gradient-to-r from-green-400 to-blue-400 text-transparent bg-clip-text">Successful!</span>
            </h1>
            <p className="text-xl text-white/70">
              Thank you for subscribing to our freelancer platform
            </p>
          </motion.div>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
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
              className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {checkingStatus ? (
                <>
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-4 h-4" />
                  Check Status
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/freelancer')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-500/25"
            >
              Go to Dashboard
              <FiArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-white/60 text-sm">
              If you're having trouble, please contact our support team.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FreelancerBillingSuccess;
