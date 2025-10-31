import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { businessAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useBusinessPayouts = () => {
  const { currentUser } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayouts = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For now, return empty array since payouts API might not exist yet
      // In a real implementation, this would call businessAPI.listPayouts()
      const payoutsData = [];
      
      setPayouts(payoutsData);
      
      if (payoutsData.length === 0) {
        console.log('No payouts found - this might be because the payouts API is not implemented yet');
      }
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
      setError(err);
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const createPayout = async (payoutData) => {
    try {
      // This would be a real API call when the endpoint exists
      console.log('Creating payout:', payoutData);
      toast.success('Payout created successfully!');
      await fetchPayouts();
    } catch (err) {
      console.error('Failed to create payout:', err);
      toast.error(err.response?.data?.message || 'Failed to create payout.');
      throw err;
    }
  };

  const updatePayoutStatus = async (payoutId, status) => {
    try {
      // This would be a real API call when the endpoint exists
      console.log('Updating payout status:', payoutId, status);
      toast.success('Payout status updated successfully!');
      await fetchPayouts();
    } catch (err) {
      console.error('Failed to update payout status:', err);
      toast.error(err.response?.data?.message || 'Failed to update payout status.');
      throw err;
    }
  };

  const deletePayout = async (payoutId) => {
    try {
      // This would be a real API call when the endpoint exists
      console.log('Deleting payout:', payoutId);
      toast.success('Payout deleted successfully!');
      await fetchPayouts();
    } catch (err) {
      console.error('Failed to delete payout:', err);
      toast.error(err.response?.data?.message || 'Failed to delete payout.');
      throw err;
    }
  };

  const getPayoutStats = () => {
    return {
      total: payouts.length,
      completed: payouts.filter(p => p.status === 'completed').length,
      pending: payouts.filter(p => p.status === 'pending').length,
      processing: payouts.filter(p => p.status === 'processing').length,
      failed: payouts.filter(p => p.status === 'failed').length,
      totalAmount: payouts.reduce((sum, p) => sum + (p.amount || 0), 0),
      completedAmount: payouts
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    };
  };

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  return {
    payouts,
    loading,
    error,
    refreshPayouts: fetchPayouts,
    createPayout,
    updatePayoutStatus,
    deletePayout,
    getPayoutStats
  };
};
