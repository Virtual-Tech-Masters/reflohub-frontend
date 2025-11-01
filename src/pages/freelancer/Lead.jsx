import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiRefreshCw, FiFilter, FiSearch, FiDollarSign, FiCalendar, FiUser, FiMessageSquare } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useFreelancerLeads } from '../../hooks/useFreelancerLeads';
import PageTitle from '../../components/common/PageTitle';

const Lead = () => {
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [businessFilter, setBusinessFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Use the custom hook for data fetching
  const { 
    leads, 
    loading, 
    error, 
    refreshLeads, 
    acknowledgeCommission 
  } = useFreelancerLeads();

  // Filter leads based on search and filters
  useEffect(() => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((lead) => 
        lead.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    // Business filter
    if (businessFilter) {
      filtered = filtered.filter((lead) => 
        lead.businessName?.toLowerCase().includes(businessFilter.toLowerCase())
      );
    }

    // Date range filter
    if (startDate || endDate) {
      filtered = filtered.filter((lead) => {
        const submitted = new Date(lead.submittedAt);
        return (!startDate || submitted >= new Date(startDate)) && 
               (!endDate || submitted <= new Date(endDate));
      });
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, businessFilter, startDate, endDate]);

  // Handle commission acknowledgment
  const handleAcknowledgeCommission = async (leadId) => {
    try {
      await acknowledgeCommission(leadId);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Handle view action
  const handleView = (lead) => {
    navigate(`/freelancer/lead-details/${lead.id}`);
  };

  // Get status color and display text
  const getStatusInfo = (status) => {
    switch (status?.toUpperCase()) {
      case 'SUBMITTED':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
          text: 'Submitted',
          icon: '📝'
        };
      case 'APPROVED':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
          text: 'Approved',
          icon: '✅'
        };
      case 'REJECTED':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
          text: 'Rejected',
          icon: '❌'
        };
      case 'ACKNOWLEDGED':
        return {
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
          text: 'Acknowledged',
          icon: '👀'
        };
      case 'CONVERTED':
        return {
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
          text: 'Converted',
          icon: '💰'
        };
      case 'DUPLICATE':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
          text: 'Duplicate',
          icon: '🔄'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
          text: status || 'Unknown',
          icon: '❓'
        };
    }
  };

  // Format commission display
  const formatCommission = (lead) => {
    if (lead.finalCommissionCents) {
      return `$${(lead.finalCommissionCents / 100).toFixed(2)}`;
    }
    if (lead.proposedCommissionCents) {
      return `$${(lead.proposedCommissionCents / 100).toFixed(2)}`;
    }
    if (lead.proposedCommissionPctBps) {
      return `${(lead.proposedCommissionPctBps / 100).toFixed(2)}%`;
    }
    return 'TBD';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load leads</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">There was an error loading your leads.</p>
          <button
            onClick={refreshLeads}
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
          title="My Leads"
          subtitle="Manage and track your submitted leads"
        />
        <button
          onClick={refreshLeads}
          className="btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="SUBMITTED">📝 Submitted</option>
            <option value="APPROVED">✅ Approved</option>
            <option value="REJECTED">❌ Rejected</option>
            <option value="ACKNOWLEDGED">👀 Acknowledged</option>
            <option value="CONVERTED">💰 Converted</option>
            <option value="DUPLICATE">🔄 Duplicate</option>
          </select>

          {/* Business Filter */}
          <input
            type="text"
            placeholder="Filter by business..."
            value={businessFilter}
            onChange={(e) => setBusinessFilter(e.target.value)}
            className="input-field"
          />

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <FiUser className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leads yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start by submitting your first lead!</p>
            <Link
              to="/freelancer"
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <FiUser /> Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Lead Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLeads.map((lead) => {
                  const statusInfo = getStatusInfo(lead.status);
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {lead.leadName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {lead.leadPhone && `📞 ${lead.leadPhone}`}
                            {lead.leadPhone && lead.leadEmail && ' • '}
                            {lead.leadEmail && `✉️ ${lead.leadEmail}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {lead.businessName || `Business #${lead.businessId}`}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {lead.businessCategory && `🏢 ${lead.businessCategory}`}
                            {lead.businessLocation && ` • 📍 ${lead.businessLocation}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                          <span className="mr-1">{statusInfo.icon}</span>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiDollarSign className="text-green-500" />
                          <span className="font-medium">{formatCommission(lead)}</span>
                        </div>
                        {lead.commissionType && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {lead.commissionType.toLowerCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          lead.paymentStatus === 'PAID' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        }`}>
                          {lead.paymentStatus === 'PAID' ? '💰 Paid' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="text-gray-400" />
                          <span>{new Date(lead.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(lead.submittedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(lead);
                            }}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                          >
                            <FiEye />
                            View
                          </button>
                          {lead.businessId && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const leadName = lead.leadName || `Lead #${lead.id}`;
                                navigate(`/freelancer/chat?businessId=${lead.businessId}&leadId=${lead.id}&leadName=${encodeURIComponent(leadName)}`);
                              }}
                              className="p-2 bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
                              title="Chat with Business"
                              aria-label="Open chat with this business"
                            >
                              <FiMessageSquare size={16} aria-hidden="true" />
                            </motion.button>
                          )}
                          {lead.status === 'APPROVED' && !lead.freelancerAcknowledged && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcknowledgeCommission(lead.id);
                              }}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredLeads.length === 0 && leads.length > 0 && (
          <div className="text-center py-8">
            <FiFilter className="mx-auto text-gray-400 text-2xl mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No leads match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lead;