import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiRefreshCw, FiTrendingUp, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { useFreelancerLeads } from '../../hooks/useFreelancerLeads';
import PageTitle from '../../components/common/PageTitle';
import { formatCurrency } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const Earnings = () => {
  const [paidEarnings, setPaidEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const navigate = useNavigate();
  
  const { leads, refreshLeads } = useFreelancerLeads();

  useEffect(() => {
    // Filter leads that have been paid (converted status)
    const paid = leads.filter(lead => {
      const statusUpper = (lead.status || '').toUpperCase();
      return statusUpper === 'CONVERTED' && 
             (lead.finalCommissionCents || (typeof lead.commissionEarned === 'number' ? lead.commissionEarned * 100 : lead.commissionEarned) || 0) > 0;
    });
    setPaidEarnings(paid);
    
    // Calculate total earnings (convert to cents if needed)
    const total = paid.reduce((sum, lead) => {
      const commission = lead.finalCommissionCents || 
                        (typeof lead.commissionEarned === 'number' && lead.commissionEarned < 1000 ? lead.commissionEarned * 100 : lead.commissionEarned) || 
                        0;
      return sum + commission;
    }, 0);
    setTotalEarnings(total);
    
    setLoading(false);
  }, [leads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <PageTitle
          title="Earnings"
          subtitle="Track your paid commission earnings"
        />
        <button
          onClick={refreshLeads}
          className="btn-secondary flex items-center gap-2"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 dark:bg-success-900/20 text-success-500 mr-4">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totalEarnings)}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-500 mr-4">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid Commissions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{paidEarnings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-100 dark:bg-accent-900/20 text-accent-500 mr-4">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {leads.length > 0 ? Math.round((paidEarnings.length / leads.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {paidEarnings.length === 0 ? (
        <div className="card text-center py-12">
          <FiDollarSign className="mx-auto text-gray-400 text-6xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No earnings yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't received any commission payments yet. Keep submitting quality leads!
          </p>
          <button
            onClick={() => navigate('/freelancer/businesses')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiTrendingUp />
            Find Businesses
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paidEarnings.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{lead.leadName || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{lead.businessName || `Business #${lead.businessId || 'N/A'}`}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">
                      {lead.finalCommissionCents ? formatCurrency(lead.finalCommissionCents) :
                       lead.commissionEarned ? formatCurrency(typeof lead.commissionEarned === 'number' && lead.commissionEarned < 1000 ? lead.commissionEarned * 100 : lead.commissionEarned) :
                       '$0.00'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="text-gray-400" />
                        <span>{new Date(lead.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300">
                        Paid
                      </span>
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

export { Earnings };
export default Earnings;

