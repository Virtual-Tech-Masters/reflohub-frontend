import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiEdit3, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiZap, FiShield, FiTrendingUp, FiBriefcase, FiUser } from 'react-icons/fi';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const EmailVerification = () => {
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role');
  const userId = urlParams.get('userId');
  const regAuthToken = urlParams.get('regAuthToken'); // Registration auth token
  const emailVerificationToken = urlParams.get('token'); // Email verification token
  const emailFromUrl = urlParams.get('email'); // Fallback email from URL

  useEffect(() => {
    if (role && userId) {
      // Set email from URL immediately as fallback
      if (emailFromUrl) {
        setEmail(emailFromUrl);
        setLoading(false);
      } else {
        // If no email in URL, try to get it from localStorage or show placeholder
        const storedEmail = localStorage.getItem('registrationEmail');
        if (storedEmail) {
          setEmail(storedEmail);
          setLoading(false);
        } else {
          setEmail('Please enter your email below');
          setLoading(false);
        }
      }
      
      // Only try API call if we have regAuthToken (not email verification token) and don't have email from URL
      if (regAuthToken && !emailVerificationToken && !emailFromUrl) {
        checkUserStatus();
      }
    } else {
      toast.error('Invalid verification link. Please try registering again.');
    }
  }, [role, userId, regAuthToken, emailFromUrl]);

  const checkUserStatus = async () => {
    try {
      setLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const response = await Promise.race([
        authAPI.getUserStatus(role, userId, regAuthToken),
        timeoutPromise
      ]);
      
      setUserInfo(response.data);
      setEmail(response.data.email);
      setIsVerified(response.data.emailVerified);
    } catch (error) {
      if (error.message === 'Request timeout') {
        toast.error('Request timed out. Using fallback email.');
      } else if (error.response?.status === 401) {
        // Token expired - this is expected for email link users
        console.log('Token expired or invalid - this is normal for email link users');
        toast.error('Registration token expired. Please use the email verification link from your email.');
      } else if (error.response?.status === 400) {
        toast.error('Backend connection issue. Using fallback email.');
      } else {
        toast.error('Failed to load user information. Using fallback email.');
      }
      
      // Fallback: show email from URL or placeholder
      setEmail(emailFromUrl || 'Email not available');
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === email) {
      toast.error('Please enter a different email address');
      return;
    }

    // Validate required parameters
    if (!role || !userId || !regAuthToken) {
      toast.error('Missing required parameters. Please refresh the page and try again.');
      console.error('Missing parameters:', { role, userId, regAuthToken });
      return;
    }

    // Email updates only work with regAuthToken (not email verification tokens)
    if (!regAuthToken) {
      toast.error('Email updates are not available from email verification links. Please use the registration page to update your email.');
      return;
    }

    try {
      setLoading(true);
      
      await authAPI.updateEmail(role.toUpperCase(), parseInt(userId), newEmail, regAuthToken);
      setEmail(newEmail);
      setNewEmail('');
      setIsEditingEmail(false);
      toast.success('Email updated successfully. Please check your new email for verification.');
    } catch (error) {
      console.error('Error updating email:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // User-friendly error messages
      let errorMessage = 'Failed to update email. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        const errorMsg = (errorData?.message || errorData?.error || '').toLowerCase();
        
        if (status === 400) {
          if (errorMsg.includes('email') && (errorMsg.includes('already') || errorMsg.includes('exists'))) {
            errorMessage = 'This email is already registered. Please use a different email.';
          } else if (errorMsg.includes('invalid') || errorMsg.includes('expired')) {
            errorMessage = 'Invalid or expired token. Please try registering again.';
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } else if (status === 401) {
          errorMessage = 'Session expired. Please try registering again.';
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
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      
      // Check if we have a valid email
      if (!email || email === 'Email not available' || email === 'Please enter your email below') {
        toast.error('Please set a valid email address first');
        return;
      }
      
      // Resend verification only works with regAuthToken (not email verification tokens)
      if (!regAuthToken) {
        toast.error('Resending verification emails is not available from email verification links. Please use the registration page.');
        return;
      }
      
      await authAPI.sendEmailVerification(role.toUpperCase(), parseInt(userId), email, regAuthToken);
      toast.success('Verification email sent successfully!');
    } catch (error) {
      // User-friendly error messages
      let errorMessage = 'Failed to send verification email. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        const errorMsg = (errorData?.message || errorData?.error || '').toLowerCase();
        
        if (status === 401) {
          if (errorMsg.includes('expired') || errorMsg.includes('invalid')) {
            errorMessage = 'Registration token expired. Please use the verification link from your email or try registering again.';
          } else {
            errorMessage = 'Session expired. Please try registering again.';
          }
        } else if (status === 400) {
          if (errorMsg.includes('already') && errorMsg.includes('verified')) {
            errorMessage = 'Email is already verified. You can proceed to login.';
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = 'Invalid request. Please check your information and try again.';
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

  const handleVerifyEmail = async () => {
    try {
      setLoading(true);
      
      // Use email verification token for verification
      if (!emailVerificationToken) {
        toast.error('Email verification token missing. Please use the link from your email.');
        return;
      }
      
      // Call the backend to verify the email
      const response = await authAPI.verifyEmail(role, parseInt(userId), emailVerificationToken);
      
      if (response.data && response.data.ok) {
        setIsVerified(true);
        toast.success('Email verified successfully!');
      } else {
        toast.error('Email verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to verify email. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        const errorMsg = (errorData?.message || errorData?.error || '').toLowerCase();
        
        if (status === 400) {
          if (errorMsg.includes('already') && errorMsg.includes('verified')) {
            errorMessage = 'Email is already verified. You can proceed to login.';
            setIsVerified(true);
          } else if (errorMsg.includes('expired')) {
            errorMessage = 'Verification link has expired. Please request a new verification email.';
          } else if (errorMsg.includes('invalid')) {
            errorMessage = 'Invalid verification link. Please use the link from your email or request a new one.';
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
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
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl flex">
          {/* Left Side Content - Hidden on mobile */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:flex lg:w-1/2 flex-col justify-center p-8 xl:p-12 relative"
          >
            {/* Vertical Line Separator */}
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            <div className="max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-6"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-4 shadow-2xl">
                  <FiZap className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4 leading-tight">
                  {isVerified ? 'Welcome to the platform!' : 'Almost there!'}
                </h1>
                <p className="text-lg text-blue-100/80 mb-8 leading-relaxed">
                  {isVerified 
                    ? 'Your account is now verified and ready to use. Start connecting with amazing opportunities.'
                    : 'We\'re excited to have you join our community. Just one more step to get started.'
                  }
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="grid grid-cols-1 gap-4"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                      <FiBriefcase className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">For Businesses</h3>
                  </div>
                  <p className="text-blue-100/80 text-sm leading-relaxed">
                    Post projects and find the perfect talent. Access a global network of skilled professionals.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">For Freelancers</h3>
                  </div>
                  <p className="text-blue-100/80 text-sm leading-relaxed">
                    Find projects and grow your career. Build your portfolio with high-quality clients.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <FiTrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Growth & Success</h3>
                  </div>
                  <p className="text-blue-100/80 text-sm leading-relaxed">
                    Track your progress with advanced analytics and grow your business exponentially.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-8 flex items-center space-x-6"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">50K+</div>
                  <div className="text-blue-200/80 text-xs">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">$2M+</div>
                  <div className="text-blue-200/80 text-xs">Paid Out</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">99%</div>
                  <div className="text-blue-200/80 text-xs">Success Rate</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 flex items-center justify-center p-8"
          >
            <div className="w-full max-w-md">
              {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center mb-8"
        >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl">
            {isVerified ? (
                    <FiCheckCircle className="w-8 h-8 text-white" />
            ) : (
                    <FiMail className="w-8 h-8 text-white" />
            )}
          </div>
                <h2 className="text-3xl font-bold text-white mb-4">
            {isVerified ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
                <p className="text-blue-100/80 leading-relaxed">
            {isVerified 
              ? 'Your email has been successfully verified. You can now access your account.'
              : 'We\'ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.'
            }
          </p>
        </motion.div>

              {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          {!isVerified && (
            <>
                {/* Current Email Display - Only show edit button if user has regAuthToken */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Current Email Address
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 px-4 py-3 border border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm">
                      <div className="flex items-center">
                        <FiMail className="h-5 w-5 text-white/60 mr-3" />
                        <span className="text-white">{email}</span>
                      </div>
                    </div>
                    {regAuthToken && (
                      <button
                        onClick={() => setIsEditingEmail(!isEditingEmail)}
                        className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-2xl transition-all duration-200 backdrop-blur-sm"
                        title="Edit email"
                      >
                        <FiEdit3 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

               {/* Manual Email Input - Show if email is not available */}
               {(email === 'Email not available' || email === 'Please enter your email below' || !email) && (
                  <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-2xl backdrop-blur-sm">
                    <h3 className="text-sm font-medium text-yellow-200 mb-2">
                     Email Not Found
                   </h3>
                    <p className="text-sm text-yellow-100/80 mb-3">
                     Please enter the email address you used for registration:
                   </p>
                    <div className="flex space-x-3">
                     <input
                       type="email"
                       value={newEmail}
                       onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 px-4 py-3 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 bg-white/10 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                       placeholder="Enter your registration email"
                     />
                     <button
                       onClick={() => {
                         if (newEmail) {
                           setEmail(newEmail);
                           setNewEmail('');
                           toast.success('Email set successfully!');
                         } else {
                           toast.error('Please enter an email address');
                         }
                       }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium"
                     >
                       Set Email
                     </button>
                   </div>
                 </div>
               )}

              {/* Edit Email Form */}
              {isEditingEmail && (
                  <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <label className="block text-sm font-medium text-white/80 mb-3">
                    New Email Address
                  </label>
                    <div className="flex space-x-3">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 px-4 py-3 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 bg-white/10 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                      placeholder="Enter new email address"
                    />
                    <button
                      onClick={handleUpdateEmail}
                      disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
              )}

                {/* Verify Email Button - Show when coming from email link */}
                {window.location.pathname === '/verify-email' && (
                  <div className="mb-6">
                    <button
                      onClick={handleVerifyEmail}
                      disabled={loading}
                      className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-green-500/25"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle className="h-5 w-5 mr-3" />
                          Verify My Email
                        </>
                      )}
                    </button>
                </div>
              )}

                {/* Resend Verification - Only show if user has regAuthToken */}
                {regAuthToken && (
                  <div className="mb-6">
                    <button
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/25"
                    >
                      {resendLoading ? (
                        <>
                          <FiRefreshCw className="animate-spin h-5 w-5 mr-3" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiRefreshCw className="h-5 w-5 mr-3" />
                          Resend Verification Email
                        </>
                      )}
                    </button>
                  </div>
                )}


              {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-start">
                    <FiAlertCircle className="h-5 w-5 text-blue-300 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-100">
                      <p className="font-medium mb-1 text-blue-200">Check your email inbox</p>
                      <p className="text-blue-100/80">Look for an email from us and click the verification link. If you don't see it, check your spam folder.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {isVerified && (
            <div className="text-center">
                    <div className="bg-green-500/10 border border-green-400/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                <div className="flex items-center justify-center">
                        <FiCheckCircle className="h-6 w-6 text-green-400 mr-3" />
                        <span className="text-green-200 font-medium text-lg">
                    Email verified successfully!
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (role === 'business') {
                    window.location.href = '/business/subscription';
                  } else if (role === 'freelancer') {
                    window.location.href = '/freelancer/subscription';
                  } else {
                    window.location.href = '/login';
                  }
                }}
                      className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 shadow-2xl hover:shadow-blue-500/25"
              >
                {role === 'business' ? 'Choose Your Plan' : role === 'freelancer' ? 'Choose Your Package' : 'Continue to Login'}
              </button>
            </div>
          )}
        </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
