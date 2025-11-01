import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiEye, FiCheck, FiX, FiDollarSign, FiClock, 
  FiFilter, FiSearch, FiRefreshCw, FiTrendingUp, FiUsers, FiMessageSquare
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { businessAPI } from '../../utils/api';
import PageTitle from '../../components/common/PageTitle';
import CommissionForm from '../../components/business/CommissionForm';
import ReasonModal from '../../components/business/ReasonModal';
import { getErrorMessage, formatDate, truncateText, debounce } from '../../utils/helpers';

const LeadManagement = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCommissionForm, setShowCommissionForm] = useState(false);
  const [commissionLead, setCommissionLead] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectLeadId, setRejectLeadId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0
  });
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    loadLeads();
  }, [filters, pagination.page, pagination.limit]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const params = {
        status: filters.status || undefined,
        q: filters.search || undefined,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit
      };
      
      const response = await businessAPI.listLeads(params);
      
      // The API returns leads directly as an array, not nested under 'leads' property
      const leadsArray = Array.isArray(response.data) ? response.data : (response.data?.leads || []);
      
      // Debug: Log first lead to see structure
      if (leadsArray.length > 0) {
        console.log('First lead structure:', leadsArray[0]);
        console.log('Freelancer data:', leadsArray[0]?.freelancer);
        console.log('FreelancerLinks:', leadsArray[0]?.freelancerLinks);
        console.log('All keys:', Object.keys(leadsArray[0]));
      }
      
      setLeads(leadsArray);
      
      // Update total count (use total from response if available, otherwise use array length)
      if (response.data?.total !== undefined) {
        setPagination(prev => ({ ...prev, total: response.data.total }));
      } else if (response.data?.count !== undefined) {
        setPagination(prev => ({ ...prev, total: response.data.count }));
      } else {
        // If we have full results (no pagination), use array length
        // Otherwise, assume there might be more
        const hasMore = leadsArray.length === pagination.limit;
        setPagination(prev => ({ 
          ...prev, 
          total: hasMore ? prev.total : leadsArray.length 
        }));
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search handler
  const debouncedSearch = debounce((value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
  }, 500);

  const handleSearchChange = (value) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      debouncedSearch(value);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleApproveLead = async (leadId, note = '') => {
    try {
      setActionLoading(leadId);
      await businessAPI.approveLead(leadId, note);
      
      // Reload leads to get updated data from server
      await loadLeads();
      
      toast.success('Lead approved successfully!');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectLead = async (leadId, reason) => {
    if (!reason || !reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      setActionLoading(leadId);
      await businessAPI.rejectLead(leadId, reason);
      
      // Reload leads to get updated data from server
      await loadLeads();
      
      toast.success('Lead rejected successfully');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProposeCommission = async (leadId, commissionData) => {
    try {
      setActionLoading(leadId);
      await businessAPI.proposeCommission(leadId, commissionData);
      
      // Reload leads to get updated data from server
      await loadLeads();
      
      toast.success('Commission proposed successfully!');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'CONVERTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };


  const filteredLeads = leads.filter(lead => {
    const matchesStatus = !filters.status || lead.status === filters.status;
    const matchesSearch = !filters.search || 
      lead.leadName.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.leadEmail?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Lead Management - RefloHub</title>
        <meta name="description" content="Review and manage incoming leads from freelancers" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle
            title="Lead Management"
            subtitle="Review and manage incoming leads"
          />

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Leads
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-field pl-10"
                placeholder="Search by name or email..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CONVERTED">Converted</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadLeads}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-blue-500/25"
            >
              <FiRefreshCw />
              Refresh
            </motion.button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lead Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Freelancer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => navigate(`/business/leads/${lead.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {lead.leadName || 'Unnamed Lead'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {lead.details ? truncateText(lead.details, 60) : 'No details provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {lead.freelancer ? (
                      <>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {lead.freelancer.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {lead.freelancer.email || 'N/A'}
                        </div>
                      </>
                    ) : lead.freelancerLinks?.[0]?.freelancer ? (
                      <>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {lead.freelancerLinks[0].freelancer.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {lead.freelancerLinks[0].freelancer.email || 'N/A'}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No freelancer info
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {lead.leadEmail || 'No email'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {lead.leadPhone || 'No phone'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                      {lead.campaign && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                          From Campaign
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {lead.submittedAt ? formatDate(lead.submittedAt) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                          setShowModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        title="Quick Preview"
                      >
                        <FiEye size={16} />
                      </button>
                      
                      {/* Chat button - show if freelancer exists */}
                      {(lead.freelancer || lead.freelancerLinks?.[0]?.freelancer) && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const freelancerId = lead.freelancer?.id || lead.freelancerLinks?.[0]?.freelancer?.id;
                            if (freelancerId) {
                              const leadName = lead.leadName || `Lead #${lead.id}`;
                              navigate(`/business/chat?freelancerId=${freelancerId}&leadId=${lead.id}&leadName=${encodeURIComponent(leadName)}`);
                            }
                          }}
                          className="p-2 bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
                          title="Chat with Freelancer"
                          aria-label="Open chat with this freelancer"
                        >
                          <FiMessageSquare size={16} aria-hidden="true" />
                        </motion.button>
                      )}
                      
                      {lead.status === 'SUBMITTED' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCommissionLead(lead);
                              setShowCommissionForm(true);
                            }}
                            disabled={actionLoading === lead.id}
                            className="p-2 bg-green-500/20 text-green-600 hover:bg-green-500/30 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Review & Set Commission"
                            aria-label="Review and set commission for this lead"
                          >
                            {actionLoading === lead.id ? (
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                            ) : (
                              <FiCheck size={16} aria-hidden="true" />
                            )}
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRejectLeadId(lead.id);
                              setShowRejectModal(true);
                            }}
                            disabled={actionLoading === lead.id}
                            className="p-2 bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Reject Lead"
                            aria-label="Reject this lead"
                          >
                            <FiX size={16} aria-hidden="true" />
                          </motion.button>
                        </>
                      )}
                      
                      {lead.status === 'APPROVED' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setCommissionLead(lead);
                            setShowCommissionForm(true);
                          }}
                          className="p-2 bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
                          title="Update Commission"
                        >
                          <FiDollarSign size={16} />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && !loading && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filters.search || filters.status ? 'Try adjusting your filters' : 'No leads have been submitted yet'}
            </p>
            {filters.search || filters.status ? (
              <button
                onClick={() => {
                  setFilters({ status: '', search: '' });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredLeads.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Results per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">leads per page</span>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {pagination.total > 0 ? (
                  <>
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
                  </>
                ) : (
                  'No leads to display'
                )}
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg">
                  {pagination.page}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Preview Modal */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Preview
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Freelancer Information */}
                {(selectedLead.freelancer || selectedLead.freelancerLinks?.[0]?.freelancer) && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Freelancer</h4>
                    {(() => {
                      const freelancer = selectedLead.freelancer || selectedLead.freelancerLinks?.[0]?.freelancer;
                      return (
                        <>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {freelancer?.fullName || 'N/A'}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {freelancer?.email || 'N/A'}
                          </p>
                          {freelancer?.phone && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              {freelancer.phone}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Lead Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lead Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name: </span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedLead.leadName}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted: </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedLead.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status: </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedLead.status)}`}>
                        {selectedLead.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lead Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detailed Message</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedLead.details || 'No detailed message provided'}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</span>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedLead.leadEmail || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</span>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedLead.leadPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    navigate(`/business/leads/${selectedLead.id}`);
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FiEye className="w-4 h-4" />
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Commission Form Modal */}
      <CommissionForm
        open={showCommissionForm}
        onClose={() => {
          setShowCommissionForm(false);
          setCommissionLead(null);
        }}
        lead={commissionLead}
        onSuccess={() => {
          loadLeads(); // Refresh the leads list
        }}
      />

      {/* Reject Reason Modal */}
      <ReasonModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectLeadId(null);
        }}
        onSubmit={(reason) => {
          handleRejectLead(rejectLeadId, reason);
          setShowRejectModal(false);
          setRejectLeadId(null);
        }}
        title="Reject Lead"
        placeholder="Please provide a reason for rejecting this lead..."
        buttonText="Reject Lead"
        loading={actionLoading === rejectLeadId}
      />
        </div>
      </div>
    </>
  );
};

export default LeadManagement;
