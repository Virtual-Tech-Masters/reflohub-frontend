import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { businessAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useBusinessFreelancers = () => {
  const { currentUser } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFreelancers = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For now, return empty array since freelancers API might not exist yet
      // In a real implementation, this would call businessAPI.listFreelancers()
      const freelancersData = [];
      
      setFreelancers(freelancersData);
      
      if (freelancersData.length === 0) {
        console.log('No freelancers found - this might be because the freelancers API is not implemented yet');
      }
    } catch (err) {
      console.error('Failed to fetch freelancers:', err);
      setError(err);
      toast.error('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const getFreelancerStats = () => {
    return {
      total: freelancers.length,
      active: freelancers.filter(f => f.isActive).length,
      topRated: freelancers.filter(f => f.rating >= 4.5).length,
      newThisMonth: freelancers.filter(f => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(f.createdAt) >= monthAgo;
      }).length,
    };
  };

  const getFreelancerById = (freelancerId) => {
    return freelancers.find(f => f.id === freelancerId);
  };

  const updateFreelancerStatus = async (freelancerId, status) => {
    try {
      // This would be a real API call when the endpoint exists
      console.log('Updating freelancer status:', freelancerId, status);
      toast.success('Freelancer status updated successfully!');
      await fetchFreelancers();
    } catch (err) {
      console.error('Failed to update freelancer status:', err);
      toast.error(err.response?.data?.message || 'Failed to update freelancer status.');
      throw err;
    }
  };

  const sendMessage = async (freelancerId, message) => {
    try {
      // This would be a real API call when the endpoint exists
      console.log('Sending message to freelancer:', freelancerId, message);
      toast.success('Message sent successfully!');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(err.response?.data?.message || 'Failed to send message.');
      throw err;
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  return {
    freelancers,
    loading,
    error,
    refreshFreelancers: fetchFreelancers,
    getFreelancerStats,
    getFreelancerById,
    updateFreelancerStatus,
    sendMessage
  };
};
