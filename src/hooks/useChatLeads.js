import { useState, useEffect } from 'react';
import { businessAPI, freelancerAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

/**
 * Hook to fetch leads for mention functionality in chat
 * @param {number|null} freelancerId - For business users: freelancer ID to filter leads
 * @param {number|null} businessId - For freelancer users: business ID to filter leads
 * @param {string} userType - 'business' or 'freelancer'
 */
export const useChatLeads = (freelancerId, businessId, userType) => {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!currentUser?.id) {
        setLeads([]);
        return;
      }

      // Only fetch if we have the filter ID
      if (userType === 'business' && !freelancerId) {
        setLeads([]);
        return;
      }

      if (userType === 'freelancer' && !businessId) {
        setLeads([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (userType === 'business') {
          // Fetch all business leads and filter by freelancer
          const response = await businessAPI.listLeads({ limit: 1000 });
          const allLeads = Array.isArray(response.data) ? response.data : [];
          
          // Filter leads for this specific freelancer
          const filteredLeads = allLeads.filter(lead => {
            const leadFreelancer = lead.freelancer || lead.freelancerLinks?.[0]?.freelancer;
            return leadFreelancer?.id === freelancerId;
          });

          // Format leads for mention display
          setLeads(filteredLeads.map(lead => ({
            id: lead.id,
            name: lead.leadName || `Lead #${lead.id}`,
            phone: lead.leadPhone,
            email: lead.leadEmail,
            status: lead.status,
          })));
        } else {
          // Fetch all freelancer leads and filter by business
          const response = await freelancerAPI.listLeads({ limit: 1000 });
          const allLeads = Array.isArray(response.data) ? response.data : [];
          
          // Filter leads for this specific business
          const filteredLeads = allLeads.filter(lead => lead.businessId === businessId);

          // Format leads for mention display
          setLeads(filteredLeads.map(lead => ({
            id: lead.id,
            name: lead.leadName || `Lead #${lead.id}`,
            phone: lead.leadPhone,
            email: lead.leadEmail,
            status: lead.status,
          })));
        }
      } catch (err) {
        setError(getErrorMessage(err));
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [currentUser?.id, freelancerId, businessId, userType]);

  return { leads, loading, error };
};

