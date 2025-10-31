import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCalendar, FiUser, FiRefreshCw, FiPlus, FiEye, FiCheckCircle, FiClock, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/helpers';
import { Helmet } from 'react-helmet-async';
import PageTitle from '../../components/common/PageTitle';
import { businessAPI } from '../../utils/api';

const Payout = () => {
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    from: '',
    to: '',
    limit: 20,
    offset: 0,
    sort: 'createdAt:desc'
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leads, setLeads] = useState([]);

  // Create payout form state
  const [createForm, setCreateForm] = useState({
    leadId: '',
    amountCents: '',
    currency: 'usd',
    proofUrl: ''
  });

  const loadPayouts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await businessAPI.listPayouts(filters);
      setPayouts(response.data || []);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      const response = await businessAPI.listLeads({ status: 'CONVERTED', limit: 100 });
      setLeads(response.data);
    } catch (error) {
      // Silently fail - leads are not critical for payouts page
    }
  };

  useEffect(() => {
    loadPayouts();
  }, [filters]);

  const handleCreatePayout = async (e) => {
    e.preventDefault();
    try {
      await businessAPI.createPayout(createForm.leadId, {
        amountCents: parseInt(createForm.amountCents),
        currency: createForm.currency,
        proofUrl: createForm.proofUrl || null
      });
      
      toast.success('Payout created successfully!');
      setShowCreateModal(false);
      setCreateForm({ leadId: '', amountCents: '', currency: 'usd', proofUrl: '' });
      loadPayouts();
    } catch (error) {
      console.error('Failed to create payout:', error);
      toast.error('Failed to create payout. Please try again.');
    }
  };

  const formatCurrency = (amountCents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amountCents / 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'RECORDED':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'RECORDED':
        return <FiClock className="w-4 h-4" />;
      case 'PENDING':
        return <FiAlertCircle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  // Calculate stats
  const stats = {
    total: payouts.length,
    paid: payouts.filter(p => p.status === 'PAID').length,
    pending: payouts.filter(p => p.status === 'PENDING').length,
    recorded: payouts.filter(p => p.status === 'RECORDED').length,
    totalAmount: payouts.reduce((sum, p) => sum + (p.amountCents || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load payouts</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">There was an error loading your payouts.</p>
          <button
            onClick={loadPayouts}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payout Management - RefloHub</title>
        <meta name="description" content="Manage your business payouts to freelancers" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle
            title="Payout Management"
            subtitle="Track and manage payouts to freelancers"
            actions={
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  loadLeads();
                  setShowCreateModal(true);
                }}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 flex items-center gap-2 shadow-2xl hover:shadow-blue-500/25"
              >
                <FiPlus /> Create Payout
              </motion.button>
            }
          />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payouts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <FiDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.paid}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <FiDollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="RECORDED">Recorded</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={loadPayouts}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FiRefreshCw /> Refresh
                </button>
            </div>
          </div>
          </div>

          {/* Payouts List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <FiDollarSign className="mx-auto text-6xl text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No payouts found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No payouts have been created yet. Create your first payout to get started.
                </p>
                  <button
                    onClick={() => {
                    loadLeads();
                    setShowCreateModal(true);
                    }}
                  className="btn-primary flex items-center gap-2 mx-auto"
                  >
                  <FiPlus /> Create First Payout
                  </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Payout ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                            #{payout.id}
                                </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            Lead #{payout.leadId || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(payout.amountCents)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                              {getStatusIcon(payout.status)}
                            <span className="ml-1">{payout.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(payout.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                            {payout.proofUrl && (
                              <a
                                href={payout.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <FiExternalLink className="w-4 h-4" />
                              </a>
                            )}
                              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <FiEye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Payout Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Payout</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiAlertCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Lead
                </label>
                <select
                  value={createForm.leadId}
                  onChange={(e) => setCreateForm({ ...createForm, leadId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a converted lead</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      Lead #{lead.id} - {lead.leadName || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createForm.amountCents / 100}
                  onChange={(e) => setCreateForm({ ...createForm, amountCents: Math.round(parseFloat(e.target.value) * 100) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proof URL (Optional)
                </label>
                <input
                  type="url"
                  value={createForm.proofUrl}
                  onChange={(e) => setCreateForm({ ...createForm, proofUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/proof"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Payout;