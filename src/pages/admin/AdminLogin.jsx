import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiMail, 
  FiLock, 
  FiLogIn, 
  FiEye, 
  FiEyeOff, 
  FiShield, 
  FiArrowLeft,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('ADMIN');
  const { adminLogin, isAuthenticated } = useAdminAuth();
  const emailRef = useRef(null);

  // Auto-focus email field on component mount
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = '/admin/dashboard';
    }
  }, [isAuthenticated]);
  
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
      const result = await adminLogin(email, password);
      if (result) {
        // Redirect will be handled by AdminAuthContext
        console.log('Admin login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <FiShield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            RefloHub Admin
          </h2>
          <p className="text-slate-300 text-sm">
            Secure Admin Access Portal
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
        >
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="admin@reflohub.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Admin Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all duration-200 ${
                    role === 'ADMIN'
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  <FiShield className="h-4 w-4 mr-2" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ANALYST')}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all duration-200 ${
                    role === 'ANALYST'
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  <FiCheckCircle className="h-4 w-4 mr-2" />
                  Analyst
                </button>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <FiLogIn className="h-5 w-5 mr-2" />
                  Access Admin Panel
                </>
              )}
            </motion.button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start">
              <FiAlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium">Security Notice</p>
                <p className="mt-1">
                  This is a secure admin portal. All login attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to Regular Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Link
            to="/login"
            className="inline-flex items-center text-slate-300 hover:text-white transition-colors duration-200"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Back to Regular Login
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-slate-400 text-xs"
        >
          <p>© 2024 RefloHub. All rights reserved.</p>
          <p className="mt-1">Authorized personnel only</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
