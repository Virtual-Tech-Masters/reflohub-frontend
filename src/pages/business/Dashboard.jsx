import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiUsers, FiCheckCircle, FiTrendingUp, FiPlus, FiDollarSign, FiClock, FiRefreshCw, FiActivity } from 'react-icons/fi';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import PageTitle from '../../components/common/PageTitle';
import StatsCard from '../../components/common/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { useBusinessData } from '../../hooks/useBusinessData';
import { getErrorMessage, formatCurrency, truncateText, formatDate } from '../../utils/helpers';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BusinessDashboard = () => {
  const { currentUser } = useAuth();
  const { data, loading: isLoading, error, refreshData } = useBusinessData();
  
  // Use real data from the hook
  const { profile, dashboard, leads, stats } = data;
  
  // Use dashboard data from backend API
  const dashboardData = dashboard || {
    leads: { submitted: 0, approved: 0, rejected: 0, converted: 0 },
    payouts: { totalCents: 0 },
    realizedRevenue: { totalCents: 0 }
  };
  
  // Stats from dashboard API
  const totalLeads = dashboardData.leads.submitted + dashboardData.leads.approved + dashboardData.leads.rejected + dashboardData.leads.converted;
  const submittedLeads = dashboardData.leads.submitted;
  const approvedLeads = dashboardData.leads.approved;
  const rejectedLeads = dashboardData.leads.rejected;
  const convertedLeads = dashboardData.leads.converted;
  
  // Calculate revenue amounts from backend data (safely handle null/undefined)
  const totalPayouts = (dashboardData.payouts?.totalCents || 0) / 100;
  const totalRevenue = (dashboardData.realizedRevenue?.totalCents || 0) / 100;
  
  // Create real chart data from leads
  const leadsChartData = {
    labels: ['Submitted', 'Approved', 'Rejected', 'Converted'],
    datasets: [
      {
        label: 'Leads',
        data: [submittedLeads, approvedLeads, rejectedLeads, convertedLeads],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const revenueChartData = {
    labels: ['Total Payouts', 'Realized Revenue'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [totalPayouts, totalRevenue],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const leadsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Leads Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const commissionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Commission Distribution',
      },
    },
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = getErrorMessage(error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refreshData}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 flex items-center gap-2 mx-auto shadow-2xl hover:shadow-blue-500/25"
          >
            <FiActivity /> Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Business Dashboard - RefloHub</title>
        <meta name="description" content="Manage your leads and monitor commission payments" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle
            title="Business Dashboard"
            subtitle="Manage your leads and monitor commission payments"
            actions={
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={refreshData}
                  className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
                >
                  <FiRefreshCw />
                  Refresh
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to="/business/leads" 
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 flex items-center gap-2 shadow-2xl hover:shadow-blue-500/25"
                  >
                    <FiPlus /> View All Leads
                  </Link>
                </motion.div>
              </div>
            }
          />
      
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatsCard
            title="Total Leads"
            value={totalLeads}
            icon={<FiFileText size={20} className="text-primary-500" />}
            trend="up"
            trendValue="15%"
            color="primary"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatsCard
            title="Pending Review"
            value={submittedLeads}
            icon={<FiClock size={20} className="text-accent-500" />}
            color="accent"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatsCard
            title="Converted"
            value={convertedLeads}
            icon={<FiCheckCircle size={20} className="text-success-500" />}
            trend="up"
            trendValue="8%"
            color="success"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue * 100)}
            icon={<FiDollarSign size={20} className="text-secondary-500" />}
            color="secondary"
          />
          </motion.div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Leads Statistics</h3>
          <div className="h-80">
            <Bar options={leadsOptions} data={leadsChartData} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
          <div className="h-80">
            <Doughnut options={commissionOptions} data={revenueChartData} />
          </div>
          </motion.div>
          </div>
          
          {/* Recent Leads */}
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Leads</h3>
          <Link to="/business/leads" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lead Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Commission
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Array.isArray(leads) && leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {lead.leadName || 'Unnamed Lead'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {lead.details ? truncateText(lead.details, 60) : 'No details provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lead.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 
                      lead.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                      lead.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                    }`}>
                      {lead.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {lead.finalCommissionCents ? formatCurrency(lead.finalCommissionCents) : 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {lead.submittedAt ? formatDate(lead.submittedAt) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {lead.leadEmail || 'No email'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {lead.leadPhone || 'No phone'}
                    </div>
                  </td>
                </tr>
              ))}
              {(!Array.isArray(leads) || leads.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          </motion.div>
          
          {/* Lead Status Summary */}
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center mr-4">
              <FiClock className="text-warning-500 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{submittedLeads}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mr-4">
              <FiTrendingUp className="text-primary-500 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{approvedLeads}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved Leads</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center mr-4">
              <FiCheckCircle className="text-success-500 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{convertedLeads}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Converted Leads</p>
            </div>
          </div>
          </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default BusinessDashboard;