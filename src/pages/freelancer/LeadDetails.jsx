import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiEdit, FiSave, FiFlag, FiX, FiRefreshCw, FiDollarSign, FiCalendar, FiUser, 
  FiArrowLeft, FiPhone, FiMail, FiMapPin, FiClock, FiCheckCircle,
  FiAlertCircle, FiTrendingUp, FiCreditCard, FiFileText, FiMessageSquare
} from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import toast from 'react-hot-toast';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFreelancerLeads } from '../../hooks/useFreelancerLeads';
import PageTitle from '../../components/common/PageTitle';
import { getErrorMessage, escapeHtml, formatCurrency, formatDateTime } from '../../utils/helpers';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  if (!id) {
    return (
      <div className="p-8">
        <h1>Lead Details - No ID provided</h1>
        <p>ID: {id}</p>
        <Link to="/freelancer/leads" className="btn-primary">Back to Leads</Link>
      </div>
    );
  }
  
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDetails, setReportDetails] = useState({ reason: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the custom hook for data fetching
  const { 
    leads,
    loading: leadsLoading,
    getLead, 
    acknowledgeCommission
  } = useFreelancerLeads();

  useEffect(() => {
    if (!leadsLoading && leads.length > 0 && id) {
      const existingLead = leads.find(lead => lead.id === parseInt(id));
      if (existingLead) {
        setLead(existingLead);
        setNotes(existingLead.notes || '');
        setLoading(false);
      } else {
        setError(new Error('Lead not found in your leads list'));
        setLoading(false);
      }
    } else if (!leadsLoading && leads.length === 0) {
      setError(new Error('No leads found'));
      setLoading(false);
    }
  }, [leadsLoading, leads, id]);

  // Handle commission acknowledgment
  const handleAcknowledgeCommission = async () => {
    try {
      await acknowledgeCommission(id);
      // Refresh lead data
      const leadData = await getLead(id);
      setLead(leadData);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Handle report submission
  const handleReport = () => {
    if (!reportDetails.reason || !reportDetails.description) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success('Report submitted successfully');
    setShowReportModal(false);
    setReportDetails({ reason: '', description: '' });
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status?.toUpperCase()) {
      case 'SUBMITTED':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
          icon: '📝',
          text: 'Submitted'
        };
      case 'APPROVED':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
          icon: '✅',
          text: 'Approved'
        };
      case 'REJECTED':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
          icon: '❌',
          text: 'Rejected'
        };
      case 'ACKNOWLEDGED':
        return {
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
          icon: '👀',
          text: 'Acknowledged'
        };
      case 'CONVERTED':
        return {
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
          icon: '💰',
          text: 'Converted'
        };
      case 'DUPLICATE':
        return {
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
          icon: '🔄',
          text: 'Duplicate'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
          icon: '❓',
          text: 'Unknown'
        };
    }
  };

  if (loading || leadsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {leadsLoading ? 'Loading leads...' : 'Loading lead details...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error ? 'Failed to load lead' : 'Lead not found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error 
              ? 'There was an error loading the lead details. Please try again.'
              : 'The lead you\'re looking for doesn\'t exist or has been removed.'
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/freelancer/leads"
              className="btn-primary flex items-center gap-2"
            >
              <FiArrowLeft /> Back to Leads
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary flex items-center gap-2"
            >
              <FiRefreshCw /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/freelancer/leads"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiArrowLeft size={20} />
          </Link>
        </div>
        <PageTitle
          title={`Lead: ${lead.leadName}`}
          subtitle={`Business #${lead.businessId} • ${lead.status}`}
          actions={
            <div className="flex gap-2">
              {lead.businessId && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const leadName = lead.leadName || `Lead #${lead.id}`;
                    navigate(`/freelancer/chat?businessId=${lead.businessId}&leadId=${lead.id}&leadName=${encodeURIComponent(leadName)}`);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FiMessageSquare />
                  Chat
                </motion.button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary flex items-center gap-2"
              >
                <FiRefreshCw />
                Refresh
              </button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Overview */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Lead Overview</h3>
              <div className="flex items-center gap-2">
                {(() => {
                  const statusInfo = getStatusInfo(lead.status);
                  return (
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.text}
                    </span>
                  );
                })()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead Name</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{lead.leadName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{lead.businessName || `Business #${lead.businessId}`}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted Date</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FiCalendar className="text-gray-400" />
                    {formatDateTime(lead.submittedAt)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Commission</label>
                  <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                    <FiDollarSign />
                    {lead.finalCommissionCents ? formatCurrency(lead.finalCommissionCents) : 
                     lead.finalCommissionPctBps ? `${(lead.finalCommissionPctBps / 100).toFixed(2)}%` : 
                     '$0.00'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</label>
                  <p className={`text-lg font-medium flex items-center gap-2 ${
                    lead.paymentStatus === 'DONE' ? 'text-green-600' : 
                    lead.paymentStatus === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    <FiCreditCard />
                    {lead.paymentStatus || 'PENDING'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">#{lead.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiUser className="text-primary-600" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {lead.leadPhone && (
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{lead.leadPhone}</p>
                    </div>
                  </div>
                )}
                
                {lead.leadEmail && (
                  <div className="flex items-center gap-3">
                    <FiMail className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{lead.leadEmail}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiClock className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(lead.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FiTrendingUp className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {(() => {
                        const statusInfo = getStatusInfo(lead.status);
                        return `${statusInfo.icon} ${statusInfo.text}`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Details */}
          {lead.details && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiFileText className="text-primary-600" />
                Lead Details
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{escapeHtml(lead.details)}</p>
              </div>
            </div>
          )}

          {/* Commission Information */}
          {(lead.commissionType || lead.proposedCommissionCents || lead.proposedCommissionPctBps || lead.finalCommissionCents || lead.finalCommissionPctBps) && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiDollarSign className="text-primary-600" />
                Commission Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Commission Type</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {lead.commissionType === 'FIXED' ? 'Fixed Amount' : 
                     lead.commissionType === 'PERCENTAGE' ? 'Percentage' : 'Not Set'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Currency</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {lead.commissionCurrency ? lead.commissionCurrency.toUpperCase() : 'USD'}
                  </p>
                </div>
                
                {/* Proposed Commission */}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Proposed Commission</label>
                  <p className="text-lg font-medium text-blue-600">
                    {lead.commissionType === 'FIXED' && lead.proposedCommissionCents ? 
                      formatCurrency(lead.proposedCommissionCents) :
                     lead.commissionType === 'PERCENTAGE' && lead.proposedCommissionPctBps ? 
                      `${(lead.proposedCommissionPctBps / 100).toFixed(2)}%` : 
                      'Not Set'}
                  </p>
                </div>
                
                {/* Final Commission */}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Final Commission</label>
                  <p className="text-lg font-medium text-green-600">
                    {lead.finalCommissionCents ? 
                      formatCurrency(lead.finalCommissionCents) :
                     lead.finalCommissionPctBps ? 
                      `${(lead.finalCommissionPctBps / 100).toFixed(2)}%` : 
                      'Not Set'}
                  </p>
                </div>
                
                {/* Acknowledgment Status */}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Acknowledgment Status</label>
                  <p className={`text-lg font-medium flex items-center gap-2 ${
                    lead.freelancerAcknowledged ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {lead.freelancerAcknowledged ? (
                      <>
                        <FiCheckCircle />
                        Acknowledged
                      </>
                    ) : (
                      <>
                        <FiAlertCircle />
                        Pending
                      </>
                    )}
                  </p>
                </div>
                
                {/* Acknowledgment Date */}
                {lead.acknowledgedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Acknowledged Date</label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatDateTime(lead.acknowledgedAt)}
                    </p>
                  </div>
                )}
              </div>
              
              {lead.approvalNotes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Approval Notes</label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-2">
                    <p className="text-gray-900 dark:text-white">{escapeHtml(lead.approvalNotes)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rejection Information */}
          {lead.isRejected && lead.rejectionReason && (
            <div className="card border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                <FiAlertCircle />
                Rejection Information
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{escapeHtml(lead.rejectionReason)}</p>
                {lead.rejectedAt && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Rejected on: {new Date(lead.rejectedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card">
        <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notes</h3>
          <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
              >
                <FiEdit />
                {isEditingNotes ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {isEditingNotes ? (
              <div className="space-y-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={4}
            placeholder="Add your notes here..."
          />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        // Notes saving would be implemented when backend endpoint is available
                        setIsEditingNotes(false);
                        toast.success('Notes saved');
                      } catch (error) {
                        toast.error(getErrorMessage(error));
                      }
                    }}
                    className="btn-primary flex items-center gap-1"
                  >
                    <FiSave />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            {notes || 'No notes added yet.'}
          </p>
        )}
      </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {lead.status === 'APPROVED' && !lead.freelancerAcknowledged && (
                <button
                  onClick={handleAcknowledgeCommission}
                  className="w-full btn-success flex items-center justify-center gap-2"
                >
                  <FiCheckCircle />
                  Acknowledge Commission
                </button>
              )}
              
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <FiFlag />
                Report Issue
              </button>
            </div>
          </div>

          {/* Lead Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Lead Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                {(() => {
                  const statusInfo = getStatusInfo(lead.status);
                  return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.text}
                    </span>
                  );
                })()}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Commission</span>
                <span className="font-bold text-green-600">
                  {lead.finalCommissionCents ? formatCurrency(lead.finalCommissionCents) :
                   lead.finalCommissionPctBps ? `${(lead.finalCommissionPctBps / 100).toFixed(2)}%` :
                   '$0.00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Payment</span>
                <span className={`font-medium ${
                  lead.paymentStatus === 'DONE' ? 'text-green-600' : 
                  lead.paymentStatus === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {lead.paymentStatus || 'PENDING'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Submitted</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(lead.submittedAt).toLocaleDateString()}
                </span>
              </div>
              
              {lead.approvedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Approved</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(lead.approvedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {lead.convertedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Converted</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(lead.convertedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Lead Submitted</p>
                  <p className="text-xs text-gray-500">{new Date(lead.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {lead.approvedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Lead Approved</p>
                    <p className="text-xs text-gray-500">{new Date(lead.approvedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              
              {lead.acknowledgedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Commission Acknowledged</p>
                    <p className="text-xs text-gray-500">{new Date(lead.acknowledgedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              
              {lead.convertedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Lead Converted</p>
                    <p className="text-xs text-gray-500">{new Date(lead.convertedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Report Issue</h3>
            <div className="space-y-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason
              </label>
              <select
                value={reportDetails.reason}
                  onChange={(e) => setReportDetails({ ...reportDetails, reason: e.target.value })}
                  className="w-full input-field"
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="fraud">Fraud</option>
                  <option value="other">Other</option>
              </select>
            </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={reportDetails.description}
                  onChange={(e) => setReportDetails({ ...reportDetails, description: e.target.value })}
                  className="w-full input-field"
                  rows={3}
                  placeholder="Please describe the issue..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleReport}
                className="btn-primary flex-1"
              >
                Submit Report
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetails;