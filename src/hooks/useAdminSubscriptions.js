import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI.js';
import toast from 'react-hot-toast';

// Hook for managing subscriptions and cycles
export const useAdminSubscriptions = () => {
  const [bizSubscriptions, setBizSubscriptions] = useState([]);
  const [frSubscriptions, setFrSubscriptions] = useState([]);
  const [bizCycles, setBizCycles] = useState([]);
  const [frCycles, setFrCycles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== BUSINESS SUBSCRIPTIONS =====
  const fetchBizSubscriptions = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listBizSubscriptions(params);
      setBizSubscriptions(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch business subscriptions';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getBizSubscription = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.getBizSubscription(id);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch business subscription';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBizSubscription = async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.updateBizSubscription(id, data);
      setBizSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, ...response.data } : sub
        )
      );
      toast.success('Business subscription updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update business subscription';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBizSubscription = async (id, atPeriodEnd = true) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.cancelBizSubscription(id, atPeriodEnd);
      setBizSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, ...response.data } : sub
        )
      );
      toast.success('Business subscription cancelled successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to cancel business subscription';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== BUSINESS SUBSCRIPTION CYCLES =====
  const fetchBizSubscriptionCycles = async (subscriptionId, params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listBizSubscriptionCycles(subscriptionId, params);
      setBizCycles(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch business subscription cycles';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBizCycle = async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.updateBizCycle(id, data);
      setBizCycles(prev => 
        prev.map(cycle => 
          cycle.id === id ? { ...cycle, ...response.data } : cycle
        )
      );
      toast.success('Business cycle updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update business cycle';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const issueFreeCycles = async (id, count) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.issueFreeCycles(id, count);
      toast.success(`${count} free cycles issued successfully`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to issue free cycles';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerifiedBadgeAddon = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.toggleVerifiedBadgeAddon(id);
      setBizSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, ...response.data } : sub
        )
      );
      toast.success('Verified badge addon toggled successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to toggle verified badge addon';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== FREELANCER SUBSCRIPTIONS =====
  const fetchFrSubscriptions = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listFrSubscriptions(params);
      setFrSubscriptions(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch freelancer subscriptions';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getFrSubscription = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.getFrSubscription(id);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch freelancer subscription';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFrSubscription = async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.updateFrSubscription(id, data);
      setFrSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, ...response.data } : sub
        )
      );
      toast.success('Freelancer subscription updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update freelancer subscription';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== FREELANCER SUBSCRIPTION CYCLES =====
  const fetchFrSubscriptionCycles = async (subscriptionId, params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listFrSubscriptionCycles(subscriptionId, params);
      setFrCycles(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch freelancer subscription cycles';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFrCycle = async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.updateFrCycle(id, data);
      setFrCycles(prev => 
        prev.map(cycle => 
          cycle.id === id ? { ...cycle, ...response.data } : cycle
        )
      );
      toast.success('Freelancer cycle updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update freelancer cycle';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchBizSubscriptions();
    fetchFrSubscriptions();
  }, []);

  return {
    // Business Subscriptions
    bizSubscriptions,
    fetchBizSubscriptions,
    getBizSubscription,
    updateBizSubscription,
    cancelBizSubscription,
    
    // Business Subscription Cycles
    bizCycles,
    fetchBizSubscriptionCycles,
    updateBizCycle,
    issueFreeCycles,
    toggleVerifiedBadgeAddon,
    
    // Freelancer Subscriptions
    frSubscriptions,
    fetchFrSubscriptions,
    getFrSubscription,
    updateFrSubscription,
    
    // Freelancer Subscription Cycles
    frCycles,
    fetchFrSubscriptionCycles,
    updateFrCycle,
    
    // Common
    isLoading,
    error
  };
};
