import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff, FiArrowRight, FiZap, FiShield, FiTrendingUp, FiBriefcase, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const emailRef = useRef(null);

  // Auto-focus email field on component mount
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(email, password);
      if (!result) {
        // Error is already handled by AuthContext.login()
        // No need to show additional error message
      }
    } catch (error) {
      // Only show network errors or errors not handled by AuthContext
      if (!error.response) {
        if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
          toast.error('Unable to connect to server. Please check your internet connection and try again.');
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      }
      // AuthContext already handles API errors, so we don't need to show them again
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-400 to-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding & Features */}
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
                Connect with the perfect talent
              </h1>
              {/* <p className="text-lg text-blue-100/80 mb-8 leading-relaxed">
                Our platform connects businesses with top freelancers and employees worldwide. 
                Join thousands of successful partnerships.
              </p> */}
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

        {/* <motion.div
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
            </motion.div> */}
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-8"
        >
          <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            {/* Glass Card */}
            <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 md:p-8">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center mb-6"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-4 shadow-2xl"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FiZap className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                  Welcome Back
                </h1>
                <p className="text-blue-100/80">
                  Sign in to your dashboard
                </p>
              </motion.div>
              
              {/* Form */}
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                onSubmit={handleLogin} 
                className="space-y-4"
              >
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white/90">
                Email Address
              </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                <input
                      ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          document.querySelector('input[type="password"]')?.focus();
                        }
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                  placeholder="you@example.com"
                  required
                      autoComplete="email"
                />
              </div>
            </div>
            
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white/90">
                Password
              </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                <input
                      type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleLogin(e);
                        }
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          document.querySelector('input[type="checkbox"]')?.focus();
                        }
                      }}
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                  placeholder="••••••••"
                  required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors bg-white/90 hover:bg-white rounded-r-2xl backdrop-blur-sm"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
              </div>
            </div>
            
                {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          document.querySelector('button[type="submit"]')?.focus();
                        }
                      }}
                      className="h-4 w-4 text-blue-400 rounded border-white/30 focus:ring-blue-400 focus:ring-2 transition-colors bg-white/10"
                    />
                    <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-white/80">
                  Remember me
                </label>
              </div>
              
                  <Link 
                    to="#" 
                    className="text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
                  >
                Forgot password?
                  </Link>
            </div>
            
                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      document.querySelector('input[type="email"]')?.focus();
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl hover:shadow-blue-500/25"
            >
              {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              ) : (
                    <FiLogIn className="mr-3 w-5 h-5" />
              )}
              {loading ? 'Signing In...' : 'Sign In'}
                  {!loading && <FiArrowRight className="ml-2 w-4 h-4" />}
                </motion.button>
              </motion.form>
              
              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-white/70">
              Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    Create one now
              </Link>
            </p>
              </motion.div>
            </div>
          </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;