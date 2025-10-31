import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI.js';
import toast from 'react-hot-toast';

// Hook for managing locations and categories
export const useAdminLocations = () => {
  const [businessLocations, setBusinessLocations] = useState([]);
  const [businessCategories, setBusinessCategories] = useState([]);
  const [businessCapacity, setBusinessCapacity] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== BUSINESS LOCATIONS =====
  const fetchBusinessLocations = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listBusinessLocations(params);
      setBusinessLocations(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch locations';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createBusinessLocation = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.createBusinessLocation(data);
      setBusinessLocations(prev => [...prev, response.data]);
      toast.success('Location created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create location';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== BUSINESS CATEGORIES =====
  const fetchBusinessCategories = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listBusinessCategories(params);
      setBusinessCategories(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch categories';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createBusinessCategory = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.createBusinessCategory(data);
      setBusinessCategories(prev => [...prev, response.data]);
      toast.success('Category created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create category';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== BUSINESS CAPACITY =====
  const fetchBusinessCapacity = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.getBusinessCapacity();
      setBusinessCapacity(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch capacity';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBusinessCapacity = async (region, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.updateBusinessCapacity(region, data);
      setBusinessCapacity(prev => 
        prev.map(item => 
          item.region === region ? { ...item, ...response.data } : item
        )
      );
      toast.success('Capacity updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update capacity';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== WAITLIST =====
  const fetchWaitlist = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listWaitlist(params);
      setWaitlist(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch waitlist';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createWaitlist = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.createWaitlist(data);
      setWaitlist(prev => [...prev, response.data]);
      toast.success('Waitlist entry created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create waitlist entry';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWaitlist = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await adminAPI.deleteWaitlist(id);
      setWaitlist(prev => prev.filter(item => item.id !== id));
      toast.success('Waitlist entry deleted successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete waitlist entry';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchBusinessLocations();
    fetchBusinessCategories();
    fetchBusinessCapacity();
    fetchWaitlist();
  }, []);

  return {
    // Business Locations
    businessLocations,
    fetchBusinessLocations,
    createBusinessLocation,
    
    // Business Categories
    businessCategories,
    fetchBusinessCategories,
    createBusinessCategory,
    
    // Business Capacity
    businessCapacity,
    fetchBusinessCapacity,
    updateBusinessCapacity,
    
    // Waitlist
    waitlist,
    fetchWaitlist,
    createWaitlist,
    deleteWaitlist,
    
    // Common
    isLoading,
    error
  };
};
