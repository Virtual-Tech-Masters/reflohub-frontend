import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiFileText, FiDollarSign, FiTrendingUp, FiBriefcase, FiPlus, FiX, FiRefreshCw, FiGift, FiCreditCard, FiShield } from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import PageTitle from '../../components/common/PageTitle';
import StatsCard from '../../components/common/StatsCard';
import { useFreelancerData } from '../../hooks/useFreelancerData';
import CreditPurchaseModal from './TokenPurchaseModal';
import LeadSubmitModal from './LeadSubmitModal';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TOKEN_PACKS = [
  { price: 5, tokens: 10 },
  { price: 10, tokens: 20 },
];

const FreelancerDashboard = () => {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  
  // Use the custom hook for data fetching
  const { 
    data, 
    loading: isLoading, 
    error, 
    refreshData, 
    submitLead, 
    purchaseCredits 
  } = useFreelancerData();

  const { profile, leads, credits, earnings, stats } = data;

  // Handle lead submission
  const handleSubmitLead = async (leadData) => {
    try {
      await submitLead(leadData);
      setShowLeadModal(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Handle token purchase
  const handlePurchaseTokens = async (packKey) => {
    try {
      await purchaseCredits(packKey);
      setShowTokenModal(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Get latest leads for display
  const latestLeads = leads.slice(0, 5);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">There was an error loading your dashboard data.</p>
          <button
            onClick={refreshData}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <PageTitle
          title="Freelancer Dashboard"
          subtitle="Monitor your leads and token balance"
        />
        <button
          onClick={refreshData}
          className="btn-secondary flex items-center gap-2"
          disabled={isLoading}
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      
      {/* Top Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Credit Balance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FiGift className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Credits</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Available credits</p>
              </div>
            </div>
            <button
              className="p-2 rounded-full bg-primary-100 hover:bg-primary-200 text-primary-600"
              onClick={() => setShowTokenModal(true)}
              title="Buy Credits"
            >
              <FiPlus size={20} />
            </button>
          </div>
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {data.credits?.creditsRemaining || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {data.credits?.creditsUsed || 0} used of {data.credits?.creditsTotal || 0} total
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FiShield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current plan</p>
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {data.subscription?.status === 'ACTIVE' ? data.subscription?.plan?.name || 'Active' : 'Inactive'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {data.subscription?.nextCycleAt ? 
              `Renews ${new Date(data.subscription.nextCycleAt).toLocaleDateString()}` : 
              'No active subscription'
            }
          </div>
        </div>

        {/* Earnings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Earnings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total earned</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            ${(data.earnings / 100).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            From {data.stats.acceptedLeads} accepted leads
          </div>
        </div>
      </div>

      {/* Submit Lead Button */}
      <div className="flex justify-center mb-8">
        <button
          className="btn-primary flex items-center gap-2 px-6 py-3 text-base"
          style={{ minWidth: '180px' }}
          onClick={() => setShowLeadModal(true)}
        >
          <FiPlus /> Submit Lead
        </button>
      </div>
      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        open={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onPurchase={() => {
          // Refresh data after purchase
          refreshData();
        }}
      />
      {/* Lead Submit Modal */}
      <LeadSubmitModal
        open={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSubmit={handleSubmitLead}
        businesses={[]} // TODO: Fetch real businesses
        creditBalance={data.credits?.creditsRemaining || 0}
      />
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard 
          title="Total Leads" 
          value={stats.totalLeads} 
          icon={<FiFileText size={20} className="text-primary-500" />} 
          color="primary" 
        />
        <StatsCard 
          title="Leads This Month" 
          value={stats.leadsThisMonth} 
          icon={<FiClock size={20} className="text-accent-500" />} 
          color="accent" 
        />
        <StatsCard 
          title="Accepted Leads" 
          value={stats.acceptedLeads} 
          icon={<FiCheckCircle size={20} className="text-success-500" />} 
          color="success" 
        />
        <StatsCard 
          title="Rejected Leads" 
          value={stats.rejectedLeads} 
          icon={<FiX size={20} className="text-error-500" />} 
          color="error" 
        />
        <StatsCard 
          title="Money Earned" 
          value={`$${stats.moneyEarned}`} 
          icon={<FiDollarSign size={20} className="text-success-500" />} 
          color="success" 
        />
      </div>
      {/* Latest Leads Table */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Latest Leads</h3>
          <Link 
            to="/freelancer/leads" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All Leads →
          </Link>
        </div>
        
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <FiFileText className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leads yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start by submitting your first lead!</p>
            <button
              onClick={() => setShowLeadModal(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <FiPlus /> Submit Lead
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {latestLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium">{lead.leadName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      Business #{lead.businessId}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        lead.status === 'pending' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300' :
                        lead.status === 'accepted' ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300' :
                        'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(lead.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/freelancer/leads/${lead.id}`} 
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboard;