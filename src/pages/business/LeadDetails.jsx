import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiDollarSign, 
  FiCheckCircle, FiX, FiMessageSquare, FiClock, FiTrendingUp,
  FiEdit, FiSave, FiAlertCircle, FiExternalLink, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { businessAPI } from '../../utils/api';
import PageTitle from '../../components/common/PageTitle';
import { getErrorMessage, formatCurrency, formatDate, formatDateTime, escapeHtml } from '../../utils/helpers';

const LeadDetails = () => {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  
  // Form states
  const [rejectReason, setRejectReason] = useState('');
  const [convertData, setConvertData] = useState({
    commissionAmountCents: '',
    commissionPercentBps: '',
    commissionCurrency: 'usd',
    note: '',
    realizedRevenueCents: '',
    realizedRevenueCurrency: 'usd'
  });
  const [commissionData, setCommissionData] = useState({
    commissionType: 'FIXED',
    proposedCommissionCents: '',
    proposedCommissionPctBps: '',
    commissionCurrency: 'usd'
  });

  useEffect(() => {
    if (leadId) {
      loadLeadDetails();
    }
  }, [leadId]);

  const loadLeadDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to use the getLead endpoint first
      let leadData;
      try {
        const response = await businessAPI.getLead(leadId);
        leadData = response.data;
      } catch (getLeadError) {
        // Fallback to listLeads if getLead fails
        const response = await businessAPI.listLeads({ limit: 100 });
        const leadsArray = Array.isArray(response.data) ? response.data : (response.data?.leads || []);
        leadData = leadsArray.find(lead => lead.id === parseInt(leadId));
      }
      
      if (!leadData) {
        setError(new Error('Lead not found'));
        return;
      }
      
      // Extract freelancer data if available in lead data
      const freelancerData = leadData.freelancer || leadData.freelancerLinks?.[0]?.freelancer || null;
      
      setLead({
        ...leadData,
        freelancer: freelancerData,
        messages: leadData.messages || [],
        commission: leadData.commission || []
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading('approve');
      await businessAPI.approveLead(leadId, 'Approved via lead details');
      toast.success('Lead approved successfully!');
      await loadLeadDetails();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      setActionLoading('reject');
      await businessAPI.rejectLead(leadId, rejectReason);
      toast.success('Lead rejected successfully!');
      setShowRejectModal(false);
      setRejectReason('');
      await loadLeadDetails();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProposeCommission = async () => {
    // Validate commission data
    if (commissionData.commissionType === 'FIXED' && (!commissionData.proposedCommissionCents || commissionData.proposedCommissionCents <= 0)) {
      toast.error('Please enter a valid commission amount');
      return;
    }
    if (commissionData.commissionType === 'PERCENTAGE' && (!commissionData.proposedCommissionPctBps || commissionData.proposedCommissionPctBps <= 0)) {
      toast.error('Please enter a valid commission percentage');
      return;
    }
    
    try {
      setActionLoading('commission');
      
      // Convert to proper format
      const submitData = {
        commissionType: commissionData.commissionType,
        commissionCurrency: commissionData.commissionCurrency || 'usd',
        ...(commissionData.commissionType === 'FIXED' && {
          proposedCommissionCents: Math.round(parseFloat(commissionData.proposedCommissionCents) * 100)
        }),
        ...(commissionData.commissionType === 'PERCENTAGE' && {
          proposedCommissionPctBps: Math.round(parseFloat(commissionData.proposedCommissionPctBps) * 100)
        })
      };
      
      await businessAPI.proposeCommission(leadId, submitData);
      toast.success('Commission proposed successfully!');
      setShowCommissionModal(false);
      setCommissionData({
        commissionType: 'FIXED',
        proposedCommissionCents: '',
        proposedCommissionPctBps: '',
        commissionCurrency: 'usd'
      });
      await loadLeadDetails();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvert = async () => {
    // Validate convert data
    if (!convertData.commissionAmountCents && !convertData.commissionPercentBps) {
      toast.error('Please enter either commission amount or percentage');
      return;
    }
    if (!convertData.realizedRevenueCents || convertData.realizedRevenueCents <= 0) {
      toast.error('Please enter a valid realized revenue amount');
      return;
    }
    
    try {
      setActionLoading('convert');
      
      // Convert to proper format (cents)
      const submitData = {
        commissionCurrency: convertData.commissionCurrency || 'usd',
        realizedRevenueCurrency: convertData.realizedRevenueCurrency || 'usd',
        note: convertData.note || null,
        ...(convertData.commissionAmountCents && {
          commissionAmountCents: Math.round(parseFloat(convertData.commissionAmountCents) * 100)
        }),
        ...(convertData.commissionPercentBps && {
          commissionPercentBps: Math.round(parseFloat(convertData.commissionPercentBps) * 100)
        }),
        realizedRevenueCents: Math.round(parseFloat(convertData.realizedRevenueCents) * 100)
      };
      
      await businessAPI.convertLead(leadId, submitData);
      toast.success('Lead converted successfully!');
      setShowConvertModal(false);
      setConvertData({
        commissionAmountCents: '',
        commissionPercentBps: '',
        commissionCurrency: 'usd',
        note: '',
        realizedRevenueCents: '',
        realizedRevenueCurrency: 'usd'
      });
      await loadLeadDetails();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'CONVERTED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'DUPLICATE':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    const errorMessage = getErrorMessage(error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load lead</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
          <button
            onClick={loadLeadDetails}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lead not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested lead could not be found.</p>
          <button
            onClick={() => navigate('/business/leads')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiArrowLeft /> Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Lead Details - RefloHub</title>
        <meta name="description" content="View and manage lead details" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle
            title={
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/business/leads')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Lead #{lead.id}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {lead.leadName || 'Unnamed Lead'} • {lead.submittedAt ? formatDateTime(lead.submittedAt) : 'N/A'}
                  </p>
                </div>
              </div>
            }
            subtitle="View and manage lead information"
            actions={
              <div className="flex gap-2">
                {lead.status === 'SUBMITTED' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleApprove}
                      disabled={actionLoading === 'approve'}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiCheckCircle />
                      {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowRejectModal(true)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FiX />
                      Reject
                    </motion.button>
                  </>
                )}
                {lead.status === 'APPROVED' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCommissionModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiDollarSign />
                    Propose Commission
                  </motion.button>
                )}
                {lead.status === 'APPROVED' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConvertModal(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiTrendingUp />
                    Convert Lead
                  </motion.button>
                )}
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                    <p className="text-gray-900 dark:text-white">{lead.leadName}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                    <p className="text-gray-900 dark:text-white">{lead.leadPhone || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                    <p className="text-gray-900 dark:text-white">{lead.leadEmail || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                  </span>
                </div>
                </div>
                {lead.details && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Details</label>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{escapeHtml(lead.details)}</p>
                  </div>
                )}
              </div>

              {/* Freelancer Information */}
              {lead.freelancer && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Freelancer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                      <p className="text-gray-900 dark:text-white">{lead.freelancer.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                      <p className="text-gray-900 dark:text-white">{lead.freelancer.email}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                      <p className="text-gray-900 dark:text-white">{lead.freelancer.phone || 'N/A'}</p>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Location</label>
                      <p className="text-gray-900 dark:text-white">{lead.freelancer.location || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Commission History */}
              {lead.commission && lead.commission.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Commission History</h3>
                  <div className="space-y-3">
                    {lead.commission.map((comm, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comm.commissionType} Commission
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            comm.commissionStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                            comm.commissionStatus === 'PROPOSED' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {comm.commissionStatus}
                  </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {comm.commissionType === 'FIXED' ? 
                            formatCurrency(comm.proposedCommissionCents || comm.finalCommissionCents || 0) :
                            `${((comm.proposedCommissionPctBps || comm.finalCommissionPctBps || 0) / 100).toFixed(2)}%`
                          }
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {comm.createdAt ? formatDateTime(comm.createdAt) : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {lead.messages && lead.messages.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Messages</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {lead.messages.map((message, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {message.senderType}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDate(message.createdAt)}
                      </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{escapeHtml(message.message)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Submitted</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{lead.submittedAt ? formatDateTime(lead.submittedAt) : 'N/A'}</p>
                    </div>
                  </div>
                  {lead.approvedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Approved</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{formatDateTime(lead.approvedAt)}</p>
                      </div>
                    </div>
                  )}
                  {lead.rejectedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Rejected</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{formatDateTime(lead.rejectedAt)}</p>
                      </div>
                    </div>
                  )}
                  {lead.convertedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Converted</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{formatDateTime(lead.convertedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue Information */}
              {lead.realizedRevenueCents && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue</h3>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(lead.realizedRevenueCents)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Realized Revenue</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <FiX className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Lead</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Provide a reason for rejection</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                placeholder="Please provide a reason for rejecting this lead..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === 'reject'}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'reject' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiX className="w-4 h-4" />
                )}
                Reject Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FiDollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Propose Commission</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Set commission for this lead</p>
              </div>
            </div>

              <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commission Type
                </label>
                <select
                  value={commissionData.commissionType}
                  onChange={(e) => setCommissionData({ ...commissionData, commissionType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="FIXED">Fixed Amount</option>
                  <option value="PERCENTAGE">Percentage</option>
                </select>
                </div>

              {commissionData.commissionType === 'FIXED' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={commissionData.proposedCommissionCents ? (commissionData.proposedCommissionCents / 100) : ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setCommissionData({ 
                        ...commissionData, 
                        proposedCommissionCents: isNaN(value) || value < 0 ? '' : Math.round(value * 100)
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={commissionData.proposedCommissionPctBps ? (commissionData.proposedCommissionPctBps / 100) : ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setCommissionData({ 
                        ...commissionData, 
                        proposedCommissionPctBps: isNaN(value) || value < 0 || value > 100 ? '' : value * 100
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="15.00"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCommissionModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProposeCommission}
                disabled={actionLoading === 'commission'}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'commission' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiDollarSign className="w-4 h-4" />
                )}
                Propose Commission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <FiTrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Convert Lead</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Finalize commission and revenue</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Final Commission Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={convertData.commissionAmountCents ? (convertData.commissionAmountCents / 100) : ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setConvertData({ 
                        ...convertData, 
                        commissionAmountCents: isNaN(value) || value < 0 ? '' : value * 100,
                        commissionPercentBps: '' // Clear percentage when amount is set
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">OR</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Final Commission Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={convertData.commissionPercentBps ? (convertData.commissionPercentBps / 100) : ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setConvertData({ 
                        ...convertData, 
                        commissionPercentBps: isNaN(value) || value < 0 || value > 100 ? '' : value * 100,
                        commissionAmountCents: '' // Clear amount when percentage is set
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Realized Revenue (USD) *
                  </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={convertData.realizedRevenueCents ? (convertData.realizedRevenueCents / 100) : ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setConvertData({ 
                      ...convertData, 
                      realizedRevenueCents: isNaN(value) || value < 0 ? '' : value * 100 
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
                  </div>

                  <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                    <textarea
                  value={convertData.note}
                  onChange={(e) => setConvertData({ ...convertData, note: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Conversion notes..."
                />
            </div>
          </div>

            <div className="flex gap-3 mt-6">
            <button 
                onClick={() => setShowConvertModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleConvert}
                disabled={actionLoading === 'convert'}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'convert' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiTrendingUp className="w-4 h-4" />
                )}
                Convert Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeadDetails;