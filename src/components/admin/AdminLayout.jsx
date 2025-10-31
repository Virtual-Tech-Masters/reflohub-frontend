import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, 
  FiX, 
  FiLogOut, 
  FiUser, 
  FiSettings,
  FiShield,
  FiChevronDown,
  FiBell,
  FiSearch,
  FiBriefcase
} from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentAdmin, adminLogout, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Don't redirect - let the context handle authentication
  useEffect(() => {
    console.log('AdminLayout: Mounted - loading:', loading, 'currentAdmin:', currentAdmin);
  }, [loading, currentAdmin]);

  const handleLogout = () => {
    adminLogout();
    setUserMenuOpen(false);
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FiShield },
    { name: 'Businesses', href: '/admin/dashboard/businesses', icon: FiBriefcase },
    { name: 'Freelancers', href: '/admin/dashboard/freelancers', icon: FiUser },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading while context is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading if no admin data
  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 lg:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
            <div className="flex items-center">
              <FiShield className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">RefloHub Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src={currentAdmin.avatar}
                  alt={currentAdmin.name}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{currentAdmin.name}</p>
                <p className="text-xs text-gray-400">{currentAdmin.role}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-grow bg-gray-900">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
            <div className="flex items-center">
              <FiShield className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">RefloHub Admin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src={currentAdmin.avatar}
                  alt={currentAdmin.name}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{currentAdmin.name}</p>
                <p className="text-xs text-gray-400">{currentAdmin.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <FiBell className="h-6 w-6" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={currentAdmin.avatar}
                    alt={currentAdmin.name}
                  />
                  <span className="hidden md:block text-gray-700">{currentAdmin.name}</span>
                  <FiChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{currentAdmin.name}</p>
                        <p className="text-gray-500">{currentAdmin.email}</p>
                      </div>
                      <a
                        href="/admin/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiSettings className="h-4 w-4 mr-3" />
                        Settings
                      </a>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiLogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
