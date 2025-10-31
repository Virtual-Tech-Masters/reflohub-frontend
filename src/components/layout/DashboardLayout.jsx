import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import RouteLoader from '../loaders/RouteLoader';

const DashboardLayout = ({ userType }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [routeChanging, setRouteChanging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Check if user is authorized to access this dashboard
  useEffect(() => {
    // Don't redirect if still loading
    if (loading) {
      return;
    }
    
    try {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      // Check if userType exists and is valid
      if (!currentUser.userType) {
        navigate('/login');
        return;
      }
      
      if (currentUser.userType !== userType) {
        navigate(`/${currentUser.userType}`);
        return;
      }
      
      // Allow inactive business users to access subscription page and billing success page
      if (userType === 'business' && !currentUser.isActive && 
          location.pathname !== '/business/subscription' && 
          location.pathname !== '/business/billing/success') {
        navigate('/business/subscription');
        return;
      }
      
      // Allow inactive freelancer users to access subscription page and billing success page
      if (userType === 'freelancer' && !currentUser.isActive && 
          location.pathname !== '/freelancer/subscription' && 
          location.pathname !== '/freelancer/billing/success') {
        navigate('/freelancer/subscription');
        return;
      }
    } catch (error) {
      console.error('DashboardLayout: Error in authorization check:', error);
      navigate('/login');
    }
  }, [currentUser, userType, navigate, location.pathname, loading]);

  // Show route changing animation
  useEffect(() => {
    setRouteChanging(true);
    const timer = setTimeout(() => setRouteChanging(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Handle mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return <RouteLoader />;
  }
  
  // If no user after loading, don't render
  if (!currentUser) return null;

  // Hide sidebar for inactive business users on subscription page
    const isInactiveBusinessOnSubscription = userType === 'business' && !currentUser.isActive && 
      (location.pathname === '/business/subscription' || location.pathname === '/business/billing/success');

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative">
      {/* Sidebar - Hide for inactive business users on subscription page */}
      <AnimatePresence mode="wait">
        {sidebarOpen && !isInactiveBusinessOnSubscription && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 md:relative"
          >
            <Sidebar userType={userType} closeSidebar={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hide navbar for inactive business users on subscription page */}
        {!isInactiveBusinessOnSubscription && (
          <Navbar 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            sidebarOpen={sidebarOpen} 
          />
        )}
        
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${isInactiveBusinessOnSubscription ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : ''} ${isInactiveBusinessOnSubscription ? 'p-0' : 'p-4 md:p-6'}`}>
          {routeChanging ? (
            <RouteLoader />
          ) : (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className={isInactiveBusinessOnSubscription ? '' : 'container mx-auto'}
            >
              <Outlet />
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;