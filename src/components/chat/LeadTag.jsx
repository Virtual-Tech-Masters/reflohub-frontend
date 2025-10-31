import { motion } from 'framer-motion';
import { FiTag, FiExternalLink, FiUser, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const LeadTag = ({ lead, userType }) => {
  if (!lead) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ACKNOWLEDGED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'CONVERTED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

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
    return 'No commission set';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4 mx-4 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FiTag className="text-primary-600" size={16} />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Lead #{lead.id}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
          </div>
        </div>

        <Link
          to={userType === 'BUSINESS' ? `/business/leads/${lead.id}` : `/freelancer/lead-details/${lead.id}`}
          className="flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
        >
          <FiExternalLink size={14} />
          View Details
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <FiUser className="text-gray-500" size={14} />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Lead Name</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.leadName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FiDollarSign className="text-gray-500" size={14} />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Commission</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCommission(lead)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-500" size={14} />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(lead.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {lead.details && (
        <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lead Details</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{lead.details}</p>
        </div>
      )}
    </motion.div>
  );
};

export default LeadTag;
