import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiBriefcase, FiUser, FiDollarSign, FiActivity } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import toast from 'react-hot-toast';

import PageTitle from '../../components/common/PageTitle';
import StatsCard from '../../components/common/StatsCard';
import { useAdminDashboard } from '../../hooks/useAdminData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const { dashboardData, revenueData, usersData } = useAdminDashboard();
  
  // Stats calculation
  const totalUsers = dashboardData.totalUsers;
  const totalBusinesses = dashboardData.totalBusinesses;
  const totalFreelancers = dashboardData.totalFreelancers;
  const totalRevenue = dashboardData.revenue;
  
  // Activities data (placeholder for now)
  const totalActivities = 0;
  const ongoingActivities = 0;
  const upcomingActivities = 0;
  const completedActivities = 0;
  
  // Chart options
  const revenueOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const usersOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Growth by Type',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const activitiesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Activities Status',
      },
    },
  };
  
  // Card animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <div>
      <PageTitle
        title="Admin Dashboard"
        subtitle="Overview of the platform performance and metrics"
      />
      
      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={cardVariants}>
          <StatsCard
            title="Total Users"
            value={totalUsers}
            icon={<FiUsers size={20} className="text-primary-500" />}
            trend="up"
            trendValue="12%"
            color="primary"
          />
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <StatsCard
            title="Businesses"
            value={totalBusinesses}
            icon={<FiBriefcase size={20} className="text-secondary-500" />}
            trend="up"
            trendValue="8%"
            color="secondary"
          />
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <StatsCard
            title="Freelancers"
            value={totalFreelancers}
            icon={<FiUser size={20} className="text-accent-500" />}
            trend="up"
            trendValue="15%"
            color="accent"
          />
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <StatsCard
            title="Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<FiDollarSign size={20} className="text-success-500" />}
            trend="up"
            trendValue="10%"
            color="success"
          />
        </motion.div>
      </motion.div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-80">
            {revenueData ? (
              <Line options={revenueOptions} data={revenueData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading chart data...
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <div className="h-80">
            {usersData ? (
              <Bar options={usersOptions} data={usersData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading chart data...
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Activities Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card mb-8"
      >
        <h3 className="text-lg font-semibold mb-4">Activities Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <FiActivity className="text-primary-500 text-3xl mx-auto mb-2" />
            <h4 className="text-sm text-gray-600 dark:text-gray-400">Total Activities</h4>
            <p className="text-2xl font-bold">{totalActivities}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-8 h-8 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 rounded-full bg-warning-500"></div>
            </div>
            <h4 className="text-sm text-gray-600 dark:text-gray-400">Upcoming</h4>
            <p className="text-2xl font-bold">{upcomingActivities}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
            </div>
            <h4 className="text-sm text-gray-600 dark:text-gray-400">Ongoing</h4>
            <p className="text-2xl font-bold">{ongoingActivities}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 rounded-full bg-success-500"></div>
            </div>
            <h4 className="text-sm text-gray-600 dark:text-gray-400">Completed</h4>
            <p className="text-2xl font-bold">{completedActivities}</p>
          </div>
        </div>
      </motion.div>
      
      {/* Loading State */}
      {dashboardData.isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard data...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;