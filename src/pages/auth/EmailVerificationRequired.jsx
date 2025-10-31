import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiShield } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const EmailVerificationRequired = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserInfo(userData);
      setEmail(userData.email);
    }
  }, []);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email address is required');
      return;
    }

    try {
      setResendLoading(true);
      
      // Get user info from localStorage
      const user = localStorage.getItem('user');
      if (!user) {
        toast.error('User information not found. Please login again.');
        navigate('/login');
        return;
      }
      
      const userData = JSON.parse(user);
      
      // Check if regAuthToken exists, if not, user needs to use email link
      if (!userData.regAuthToken || userData.regAuthToken === 'resend') {
        toast.error('Please use the verification link sent to your email. If you didn\'t receive it, please try logging in again or contact support.');
        return;
      }
      
      const response = await authAPI.sendEmailVerification(
        userData.role, 
        userData.id, 
        email, 
        userData.regAuthToken
      );
      
      if (response.data && response.data.ok) {
        setResendSuccess(true);
        toast.success('Verification email sent successfully! Please check your inbox.');
      } else {
        toast.error('Failed to send verification email. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to send verification email. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        const errorMsg = (errorData?.message || errorData?.error || '').toLowerCase();
        
        if (status === 401) {
          if (errorMsg.includes('expired') || errorMsg.includes('invalid')) {
            errorMessage = 'Session expired. Please use the verification link from your email or try logging in again.';
          } else {
            errorMessage = 'Unable to send verification email. Please use the link from your original email or contact support.';
          }
        } else if (status === 400) {
          if (errorMsg.includes('already') && errorMsg.includes('verified')) {
            errorMessage = 'Email is already verified. You can proceed to login.';
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } else if (status === 429) {
          errorMessage = 'Too many requests. Please wait a few minutes before requesting another email.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <FiShield className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-4 text-center">Email Verification Required</h2>
          <p className="text-blue-100/80 mb-6 leading-relaxed text-center">
            Please verify your email address to continue. We've sent a verification link to:
          </p>
          
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center">
              <FiMail className="w-5 h-5 text-blue-400 mr-3" />
              <span className="text-blue-200 font-medium">{email}</span>
            </div>
          </div>
          
          {resendSuccess ? (
            <div className="bg-green-500/10 border border-green-400/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
              <p className="text-green-200 text-sm text-center">
                ✅ New verification email sent! Please check your inbox and click the verification link.
              </p>
            </div>
          ) : null}
          
          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-green-500/25 flex items-center justify-center"
            >
              {resendLoading ? (
                <>
                  <FiRefreshCw className="animate-spin w-5 h-5 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <FiMail className="w-5 h-5 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/email-verification')}
                className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center"
              >
                <FiCheckCircle className="w-5 h-5 mr-2" />
                I've Verified My Email
              </button>
              
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center"
              >
                <FiArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerificationRequired;
