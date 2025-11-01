import { useState, useEffect } from 'react';
import { freelancerAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

/**
 * Hook to get list of businesses a freelancer can chat with
 * (Businesses where freelancer has submitted at least one lead)
 */
export const useFreelancerChatList = () => {
  const { currentUser } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get businesses the freelancer has submitted leads to (can chat with)
        const response = await freelancerAPI.getChatBusinesses();
        const businessesList = Array.isArray(response.data) ? response.data : [];
        
        setBusinesses(businessesList);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        toast.error(`Failed to load businesses: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [currentUser?.id]);

  return { businesses, loading, error };
};

