import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiPlus, FiFlag, FiEdit, FiSave, FiX, FiRefreshCw, FiDollarSign, FiMapPin, FiUsers, FiArrowLeft, FiPhone, FiMail, FiGlobe, FiShield, FiCheckCircle, FiAlertCircle, FiCalendar, FiUser, FiHome } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import toast from 'react-hot-toast';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBusinesses } from '../../hooks/useBusinesses';
import { useFreelancerLeads } from '../../hooks/useFreelancerLeads';
import PageTitle from '../../components/common/PageTitle';
import LeadSubmitModal from './LeadSubmitModal';

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDetails, setReportDetails] = useState({ reason: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLeads, setUserLeads] = useState([]);

  // Use the custom hooks for data fetching
  const { getBusiness, getBusinessLeads } = useBusinesses();
  const { submitLead } = useFreelancerLeads();

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch business details
        const businessData = await getBusiness(id);
        setBusiness(businessData);
        setNotes(businessData.notes || '');
        
        // Fetch user's leads for this business
        try {
          const leadsData = await getBusinessLeads(id);
          setUserLeads(leadsData);
        } catch (leadsError) {
          console.log('No leads found for this business or error fetching leads');
          setUserLeads([]);
        }
      } catch (error) {
        console.error('Failed to fetch business:', error);
        setError(error);
        toast.error('Failed to load business details');
        navigate('/freelancer/businesses');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBusinessData();
    }
  }, [id, navigate]);

  // Handle lead submission
  const handleSubmitLead = async (leadData) => {
    try {
      await submitLead(leadData);
    setShowLeadModal(false);
      // Refresh business data
      const businessData = await getBusiness(id);
      setBusiness(businessData);
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300';
      case 'rejected':
        return 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The business you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/freelancer/businesses"
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiArrowLeft /> Back to Businesses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/freelancer/businesses"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiArrowLeft size={20} />
          </Link>
          <PageTitle
            title={business.name}
            subtitle={`${business.category} • ${business.state}, ${business.country}`}
          />
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary flex items-center gap-2"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Business Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiHome className="text-primary-600" />
              Business Information
            </h3>
            
            {/* Business Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</label>
                <p className="text-lg font-medium">{business.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                <p className="text-lg font-medium">{business.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                <p className="text-lg font-medium flex items-center gap-1">
                  <FiMapPin />
                  {business.state}, {business.country}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Commission</label>
                <p className="text-lg font-medium text-green-600 flex items-center gap-1">
                  <FiDollarSign />
                  {business.commission || 0}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                <FiPhone className="text-primary-600" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {business.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <FiMail className="text-gray-400" />
                      <a 
                        href={`mailto:${business.email}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}
                {business.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <FiPhone className="text-gray-400" />
                      <a 
                        href={`tel:${business.phone}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}
                {business.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</label>
                    <div className="flex items-center gap-2 mt-1">
                      <FiGlobe className="text-gray-400" />
                      <a 
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {business.website}
                      </a>
                    </div>
                  </div>
                )}
                {business.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-1">
                      <FiMapPin />
                      {business.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Business Status & Verification */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                <FiShield className="text-primary-600" />
                Status & Verification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</label>
                  <div className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      business.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {business.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification Status</label>
                  <div className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      business.isVerified 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    }`}>
                      {business.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verified</label>
                  <div className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      business.emailVerified 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {business.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Verified</label>
                  <div className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      business.phoneVerified 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {business.phoneVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Bio */}
            {business.bio && (
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                  <FiUser className="text-primary-600" />
                  Business Description
                </h4>
                <p className="text-gray-700 dark:text-gray-300">{business.bio}</p>
              </div>
            )}

            {/* Account Details */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                <FiCalendar className="text-primary-600" />
                Account Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</label>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {new Date(business.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {new Date(business.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Leads for this Business */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Your Leads for this Business</h3>
            {userLeads.length === 0 ? (
              <div className="text-center py-8">
                <FiUsers className="mx-auto text-gray-400 text-2xl mb-2" />
                <p className="text-gray-600 dark:text-gray-400">No leads submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userLeads.map((lead) => (
                  <div key={lead.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{lead.leadName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Submitted: {new Date(lead.submittedAt).toLocaleDateString()}</span>
                      <span className="text-green-600 font-medium">
                        Commission: ${lead.commissionEarned || 0}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>

          {/* Notes */}
          <div className="card">
        <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Notes</h3>
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
                  placeholder="Add your notes about this business..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingNotes(false);
                      // TODO: Save notes to backend
                      toast.success('Notes saved');
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
          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowLeadModal(true)}
                className="w-full btn-primary flex items-center justify-center gap-2"
                disabled={!business.hasCampaign}
              >
                <FiPlus />
                Submit Lead
              </button>
              
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <FiFlag />
                Report Issue
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Commission</span>
                <span className="font-medium text-green-600">${business.commission || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Your Leads</span>
                <span className="font-medium">{userLeads.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Accepted</span>
                <span className="font-medium text-green-600">
                  {userLeads.filter(l => l.status === 'accepted').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Earned</span>
                <span className="font-medium text-green-600">
                  ${userLeads.reduce((sum, l) => sum + (l.commissionEarned || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Submit Modal */}
      <LeadSubmitModal
        open={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSubmit={handleSubmitLead}
        businesses={[business]}
        selectedBusiness={business}
        tokenBalance={10} // Test tokens for testing
      />

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

export default BusinessDetails;