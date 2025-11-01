import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, FiUsers, FiFileText, FiSettings, FiActivity, 
  FiUser, FiDollarSign, FiList, 
  FiBell, FiCheckSquare, FiBarChart, FiX, FiAperture, FiCommand, FiArchive, FiHelpCircle, FiShield,
  FiMapPin, FiTag, FiCreditCard, FiPackage, FiTrendingUp, FiMessageSquare
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navVariants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const navItemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 }
    }
  }
};

const Sidebar = ({ userType, closeSidebar }) => {
  const { currentUser } = useAuth();
  
  // Navigation links based on user type
  const getNavLinks = () => {
    switch (userType) {
      case 'admin':
        return [
          { to: '/admin/dashboard', icon: <FiHome size={20} />, label: 'Dashboard' },
          { to: '/admin/dashboard/users', icon: <FiUsers size={20} />, label: 'Users' },
          { to: '/admin/dashboard/verifications', icon: <FiShield size={20} />, label: 'Verifications' },
          { to: '/admin/dashboard/locations', icon: <FiMapPin size={20} />, label: 'Locations' },
          { to: '/admin/dashboard/coupons', icon: <FiTag size={20} />, label: 'Coupons' },
          { to: '/admin/dashboard/plans', icon: <FiPackage size={20} />, label: 'Plans' },
          { to: '/admin/dashboard/subscriptions', icon: <FiCreditCard size={20} />, label: 'Subscriptions' },
          { to: '/admin/dashboard/leads', icon: <FiTrendingUp size={20} />, label: 'Leads' },
          { to: '/admin/dashboard/invoices', icon: <FiFileText size={20} />, label: 'Invoices' },
          { to: '/admin/dashboard/reports', icon: <FiBarChart size={20} />, label: 'Reports' },
        ];
      case 'business':
        return [
          { to: '/business', icon: <FiHome size={20} />, label: 'Dashboard' },
          { to: '/business/leads', icon: <FiAperture size={20} />, label: 'Leads' },
          { to: '/business/chat', icon: <FiMessageSquare size={20} />, label: 'Chat' },
          { to: '/business/profile', icon: <FiUser size={20} />, label: 'Profile' },
          { to: '/business/billing', icon: <FiCreditCard size={20} />, label: 'Billing' },
          { to: '/business/payout', icon: <FiArchive size={20} />, label: 'Payout' },
        ];
      case 'freelancer':
        return [
          { to: '/freelancer', icon: <FiHome size={20} />, label: 'Dashboard' },
          { to: '/freelancer/businesses', icon: <FiCheckSquare size={20} />, label: 'Businesses' },
          { to: '/freelancer/leads', icon: <FiList size={20} />, label: 'Leads' },
          { to: '/freelancer/pending-commissions', icon: <FiFileText size={20} />, label: 'Pending Commissions' },
          { to: '/freelancer/earnings', icon: <FiDollarSign size={20} />, label: 'Earnings' },
          { to: '/freelancer/billing', icon: <FiCreditCard size={20} />, label: 'Billing & Credits' },
          { to: '/freelancer/training', icon: <FiHelpCircle size={20} />, label: 'Training' },
          { to: '/freelancer/chat', icon: <FiMessageSquare size={20} />, label: 'Chat' },
          { to: '/freelancer/profile', icon: <FiUser size={20} />, label: 'Profile' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="h-full w-64 bg-white/80 dark:bg-white/10 backdrop-blur-md border-r border-gray-200 dark:border-white/20 shadow-lg">
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-white/20">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          {userType === 'admin' ? 'Admin Portal' :
           userType === 'business' ? 'Business Portal' :
           userType === 'freelancer' ? 'Freelancer Portal' : 'Portal'}
        </h1>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
          onClick={closeSidebar}
        >
          <FiX size={24} />
        </motion.button>
      </div>
      <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
        <div className="px-4 py-6">
          <motion.nav 
            initial="closed"
            animate="open"
            variants={navVariants}
          >
            <ul className="space-y-2">
              {getNavLinks().map((link, index) => (
                <motion.li key={index} variants={navItemVariants}>
                  <NavLink
                    to={link.to}
                    end={link.to.split('/').length === 2}
                    className={({ isActive }) => 
                      `flex items-center px-4 py-3 text-gray-700 dark:text-white/80 rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 text-gray-900 dark:text-white border border-blue-200 dark:border-white/30' 
                          : 'hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span>{link.label}</span>
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-white/20">
          <div className="flex items-center">
            <img
              src={currentUser?.avatar || `https://ui-avatars.com/api/?name=User&background=random&color=fff`}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-xs text-gray-600 dark:text-white/60">
                {currentUser?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;