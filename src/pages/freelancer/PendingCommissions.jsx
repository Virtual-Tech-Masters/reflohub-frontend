import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiRefreshCw, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useFreelancerLeads } from '../../hooks/useFreelancerLeads';
import PageTitle from '../../components/common/PageTitle';

const PendingCommissions = () => {
  const navigate = useNavigate();
  const [pendingCommissions, setPendingCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { leads, refreshLeads } = useFreelancerLeads();

  useEffect(() => {
    // Filter leads that have pending commissions
    const pending = leads.filter(lead => 
      lead.status === 'accepted' && 
      lead.commissionEarned > 0 && 
      !lead.commissionAcknowledged
    );
    setPendingCommissions(pending);
    setLoading(false);
  }, [leads]);

  const handleAcknowledgeCommission = async (leadId) => {
    // This would be handled by the useFreelancerLeads hook
    console.log('Acknowledging commission for lead:', leadId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading pending commissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <PageTitle
          title="Pending Commissions"
          subtitle="Track your pending commission payments"
        />
        <button
          onClick={refreshLeads}
          className="btn-secondary flex items-center gap-2"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {pendingCommissions.length === 0 ? (
        <div className="card text-center py-12">
          <FiDollarSign className="mx-auto text-gray-400 text-6xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending commissions</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have any pending commission payments at the moment.
          </p>
          <button
            onClick={() => navigate('/freelancer/leads')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiCheckCircle />
            View All Leads
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingCommissions.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{lead.leadName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">Business #{lead.businessId}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">${lead.commissionEarned}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiClock className="text-gray-400" />
                        <span>{new Date(lead.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          onClick={() => navigate(`/freelancer/lead-details/${lead.id}`)}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAcknowledgeCommission(lead.id)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export { PendingCommissions };
export default PendingCommissions;