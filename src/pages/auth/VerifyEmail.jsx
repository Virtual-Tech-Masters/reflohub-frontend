import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiRefreshCw, FiX, FiMail, FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const role = searchParams.get('role');
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!role || !userId || !token) {
      setError('Invalid verification link. Missing required parameters.');
      setLoading(false);
      return;
    }

    verifyEmail();
  }, [role, userId, token]);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Verifying email with:', { role, userId, token });
      
      const response = await authAPI.verifyEmail(role, parseInt(userId), token);
      
      if (response.data && response.data.ok) {
        setVerified(true);
        toast.success('Email verified successfully!');
        
        // Start countdown to redirect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              redirectToNextPage();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      } else {
        setError('Email verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify email';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const redirectToNextPage = () => {
    if (role === 'business') {
      navigate('/business/subscription');
    } else if (role === 'freelancer') {
      navigate('/freelancer/subscription');
    } else {
      navigate('/login');
    }
  };

  const handleResendEmail = async () => {
    if (!role || !userId) {
      toast.error('Cannot resend email. Missing user information.');
      return;
    }

    try {
      setResendLoading(true);
      // For resend, we need to get user email from localStorage or redirect to login
      const user = localStorage.getItem('user');
      if (!user) {
        toast.error('Please go to login page to resend verification email.');
        navigate('/login');
        return;
      }
      
      const userData = JSON.parse(user);
      const response = await authAPI.sendEmailVerification(role, parseInt(userId), userData.email, userData.regAuthToken);
      if (response.data && response.data.ok) {
        setResendSuccess(true);
        toast.success('Verification email sent successfully!');
      } else {
        toast.error('Failed to send verification email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleClose = () => {
    redirectToNextPage();
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Verifying your email...</h2>
          <p className="text-white/80">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center"
        >
          {verified ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <FiCheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Email Verified!</h2>
              <p className="text-blue-100/80 mb-6 leading-relaxed">
                Your email has been successfully verified. You can now access your account.
              </p>
              
              <div className="bg-green-500/10 border border-green-400/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                <p className="text-green-200 text-sm">
                  Redirecting you to {role === 'business' ? 'subscription page' : role === 'freelancer' ? 'subscription page' : 'login page'} in {countdown} seconds...
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 shadow-2xl hover:shadow-blue-500/25"
                >
                  Continue Now
                </button>
                <button
                  onClick={() => window.close()}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <FiAlertCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Verification Link Expired</h2>
              <p className="text-blue-100/80 mb-6 leading-relaxed">
                {error?.includes('expired') || error?.includes('invalid') 
                  ? 'This verification link has expired or is invalid. Please request a new verification email.'
                  : error || 'We couldn\'t verify your email. This could be due to an expired or invalid link.'
                }
              </p>
              
              <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                <p className="text-red-200 text-sm">
                  Don't worry! You can request a new verification email or go to the login page to verify your email.
                </p>
              </div>
              
              {resendSuccess ? (
                <div className="bg-green-500/10 border border-green-400/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                  <p className="text-green-200 text-sm text-center">
                    ✅ New verification email sent! Please check your inbox and click the new link.
                  </p>
                </div>
              ) : null}
              
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-green-500/25 flex items-center justify-center"
                  >
                    {resendLoading ? (
                      <>
                        <FiRefreshCw className="animate-spin w-5 h-5 mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiMail className="w-5 h-5 mr-2" />
                        Send New Email
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center"
                  >
                    <FiArrowLeft className="w-5 h-5 mr-2" />
                    Go to Login
                  </button>
                </div>
                
                <button
                  onClick={verifyEmail}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin w-5 h-5 mr-2" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="w-5 h-5 mr-2" />
                      Try This Link Again
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;
