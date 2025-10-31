import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { freelancerAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useBusinesses = () => {
  const { currentUser } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const businessesLoadedRef = useRef(false);

  const fetchBusinesses = async (params = {}) => {
    try {
      // Default parameters - fetch specific business
      const requestParams = {
        limit: 50,
        page: 1,
        country: 'India', // Specific country - required by backend
        categoryIds: '5', // Specific category - required by backend
        ...params
      };
      
      console.log('Fetching businesses with params:', requestParams);
      const response = await freelancerAPI.getBusinesses(requestParams);
      console.log('Full API response:', response.data);
      console.log('Businesses array:', response.data.results);
      console.log('Businesses count:', response.data.results?.length);
      console.log('Total count from API:', response.data.count);
      
      return {
        results: response.data.results || [],
        count: response.data.count || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 50
      };
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
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
      console.log('Refreshing businesses with params:', params);
      const data = await fetchBusinesses(params);
      console.log('Businesses data received:', data);
      console.log('Number of businesses:', data.results.length);
      console.log('Business names:', data.results.map(b => b.name));
      
      setBusinesses(data.results);
      setTotalCount(data.count);
      businessesLoadedRef.current = true;
    } catch (error) {
      console.error('Failed to refresh businesses:', error);
      setError(error);
      // Don't show error toast for now, just log it
      console.log('Business API not available - showing empty state');
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
      console.error('Failed to fetch business:', error);
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
      // Load specific business by default
      refreshBusinesses({ 
        country: 'India',
        categoryIds: '5' // Specific category
      });
    }
  }, [currentUser?.id]);

  return {
    businesses,
    loading,
    error,
    totalCount,
    refreshBusinesses,
    getBusiness
  };
};