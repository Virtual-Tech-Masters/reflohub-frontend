import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { freelancerAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export const useBusinesses = () => {
  const { currentUser } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const businessesLoadedRef = useRef(false);

  const fetchBusinesses = async (params = {}) => {
    try {
      // Default parameters
      const requestParams = {
        limit: 50,
        page: 1,
        ...params
      };
      
      const response = await freelancerAPI.getBusinesses(requestParams);
      
      return {
        results: response.data.results || [],
        count: response.data.count || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 50
      };
    } catch (error) {
      // If API fails, return empty array instead of throwing
      return {
        results: [],
        count: 0,
        page: 1,
        limit: 50
      };
    }
  };

  const refreshBusinesses = async (params = {}) => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchBusinesses(params);
      
      setBusinesses(data.results);
      setTotalCount(data.count);
      businessesLoadedRef.current = true;
    } catch (error) {
      setError(error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getBusiness = async (businessId) => {
    try {
      // For now, find the business from the already loaded list
      const business = businesses.find(b => b.id === businessId);
      if (business) return business;
      
      // If not found, return fallback
      throw new Error('Business not found in loaded list');
    } catch (error) {
      // Return a fallback business object if API fails
      return {
        id: businessId,
        name: 'Business Not Found',
        category: 'Unknown',
        location: { state: 'Unknown', country: 'Unknown', city: 'Unknown' },
        bio: 'Business information is not available at the moment.',
        isActive: false,
        isVerified: false,
        hasVerifiedBadge: false,
        hasCampaign: false,
        commission: 0,
        leadType: 'General Lead',
        contact: { email: 'N/A', phone: 'N/A' },
        description: 'Business information is not available at the moment.'
      };
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      businessesLoadedRef.current = false;
      // Load businesses on mount
      refreshBusinesses({});
    }
  }, [currentUser?.id]);

  const getBusinessLeads = async (businessId) => {
    try {
      // This would typically call an API endpoint to get leads for a specific business
      // For now, return empty array as this feature may not be implemented yet
      return [];
    } catch (error) {
      return [];
    }
  };

  return {
    businesses,
    loading,
    error,
    totalCount,
    refreshBusinesses,
    getBusiness,
    getBusinessLeads
  };
};