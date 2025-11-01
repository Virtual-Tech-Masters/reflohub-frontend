import { useState, useEffect } from 'react';
import { businessAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

/**
 * Hook to get list of freelancers a business can chat with
 * (Freelancers who have submitted at least one lead)
 */
export const useBusinessChatList = () => {
  const { currentUser } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFreelancers = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get all leads to extract unique freelancers
        const response = await businessAPI.listLeads({ limit: 1000 });
        const leads = Array.isArray(response.data) ? response.data : (response.data?.leads || []);
        
        // Extract unique freelancers from leads
        const freelancerMap = new Map();
        leads.forEach(lead => {
          if (lead.freelancer || lead.freelancerLinks?.[0]?.freelancer) {
            const freelancer = lead.freelancer || lead.freelancerLinks[0].freelancer;
            if (!freelancerMap.has(freelancer.id)) {
              freelancerMap.set(freelancer.id, {
                id: freelancer.id,
                fullName: freelancer.fullName || freelancer.name,
                email: freelancer.email,
                phone: freelancer.phone,
              });
            }
          }
        });
        
        setFreelancers(Array.from(freelancerMap.values()));
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        toast.error(`Failed to load freelancers: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, [currentUser?.id]);

  return { freelancers, loading, error };
};

