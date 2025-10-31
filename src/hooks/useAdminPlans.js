import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI.js';
import toast from 'react-hot-toast';

// Hook for managing business and freelancer plans
export const useAdminPlans = () => {
  const [bizPlans, setBizPlans] = useState([]);
  const [frPlans, setFrPlans] = useState([]);
  const [bizPlanVersions, setBizPlanVersions] = useState([]);
  const [frPlanVersions, setFrPlanVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== BUSINESS PLANS =====
  const fetchBizPlans = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listBizPlans(params);
      setBizPlans(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch business plans';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createBizPlan = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.createBizPlan(data);
      setBizPlans(prev => [...prev, response.data]);
      toast.success('Business plan created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create business plan';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== BUSINESS PLAN VERSIONS =====
  const fetchBizPlanVersions = async (planId, params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listBizPlanVersions(planId, params);
      setBizPlanVersions(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch business plan versions';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createBizPlanVersion = async (planId, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.createBizPlanVersion(planId, data);
      setBizPlanVersions(prev => [...prev, response.data]);
      toast.success('Business plan version created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create business plan version';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBizPlanVersion = async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.updateBizPlanVersion(id, data);
      setBizPlanVersions(prev => 
        prev.map(version => 
          version.id === id ? { ...version, ...response.data } : version
        )
      );
      toast.success('Business plan version updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update business plan version';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== FREELANCER PLANS =====
  const fetchFrPlans = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listFrPlans(params);
      setFrPlans(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch freelancer plans';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createFrPlan = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.createFrPlan(data);
      setFrPlans(prev => [...prev, response.data]);
      toast.success('Freelancer plan created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create freelancer plan';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== FREELANCER PLAN VERSIONS =====
  const fetchFrPlanVersions = async (planId, params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listFrPlanVersions(planId, params);
      setFrPlanVersions(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch freelancer plan versions';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createFrPlanVersion = async (planId, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.createFrPlanVersion(planId, data);
      setFrPlanVersions(prev => [...prev, response.data]);
      toast.success('Freelancer plan version created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create freelancer plan version';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFrPlanVersion = async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.updateFrPlanVersion(id, data);
      setFrPlanVersions(prev => 
        prev.map(version => 
          version.id === id ? { ...version, ...response.data } : version
        )
      );
      toast.success('Freelancer plan version updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update freelancer plan version';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchBizPlans();
    fetchFrPlans();
  }, []);

  return {
    // Business Plans
    bizPlans,
    fetchBizPlans,
    createBizPlan,
    
    // Business Plan Versions
    bizPlanVersions,
    fetchBizPlanVersions,
    createBizPlanVersion,
    updateBizPlanVersion,
    
    // Freelancer Plans
    frPlans,
    fetchFrPlans,
    createFrPlan,
    
    // Freelancer Plan Versions
    frPlanVersions,
    fetchFrPlanVersions,
    createFrPlanVersion,
    updateFrPlanVersion,
    
    // Common
    isLoading,
    error
  };
};
