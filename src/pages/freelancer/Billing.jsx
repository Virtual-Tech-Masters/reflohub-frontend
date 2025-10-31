import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiDollarSign, FiCalendar, FiRefreshCw, FiDownload, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { freelancerAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const FreelancerBilling = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState({
    subscription: null,
    credits: { creditsRemaining: 0, creditsTotal: 0, creditsUsed: 0 },
    invoices: [],
    payments: [],
    earnings: 0
  });

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, creditsResponse] = await Promise.all([
        freelancerAPI.getDashboard(),
        freelancerAPI.getCredits()
      ]);
      
      const dashboard = dashboardResponse.data;
      const credits = creditsResponse.data;
      
      setBillingData({
        subscription: dashboard.subscription,
        credits: credits,
        invoices: dashboard.invoices || [],
        payments: dashboard.payments || [],
        earnings: dashboard.totalEarned || 0
      });
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
      case 'SUCCEEDED':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING':
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      case 'FAILED':
      case 'UNCOLLECTIBLE':
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Credits</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your subscription, credits, and payments</p>
          </div>
          <button
            onClick={fetchBillingData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Credit Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiCreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Credit Balance</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {billingData.credits.creditsRemaining}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Available Credits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {billingData.credits.creditsTotal}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Credits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                {billingData.credits.creditsUsed}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Credits Used</div>
            </div>
          </div>
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Subscription</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Plan</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {billingData.subscription?.status === 'ACTIVE' 
                  ? billingData.subscription?.plan?.name || 'Active' 
                  : 'No Active Subscription'
                }
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
              <div className="flex items-center gap-2">
                {getStatusIcon(billingData.subscription?.status)}
                <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {billingData.subscription?.status?.toLowerCase() || 'Inactive'}
                </span>
              </div>
            </div>
            {billingData.subscription?.nextCycleAt && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Next Billing</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(billingData.subscription.nextCycleAt)}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Credits</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {billingData.subscription?.plan?.creditsGranted || 0} credits
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FiCalendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Invoices</h2>
          </div>
          
          {billingData.invoices.length > 0 ? (
            <div className="space-y-4">
              {billingData.invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invoice.status)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Invoice #{invoice.id}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(invoice.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(invoice.totalCents || invoice.subtotalCents)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {invoice.billingReason?.toLowerCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No invoices found</p>
            </div>
          )}
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Earnings Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {formatCurrency(billingData.earnings)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {billingData.payments.filter(p => p.status === 'SUCCEEDED').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Successful Payments</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FreelancerBilling;
