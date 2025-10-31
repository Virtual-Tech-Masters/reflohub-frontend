import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI.js';
import toast from 'react-hot-toast';

// Hook for managing coupons
export const useAdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [couponRedemptions, setCouponRedemptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== COUPONS =====
  const fetchCoupons = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listCoupons(params);
      setCoupons(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch coupons';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createCoupon = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.createCoupon(data);
      setCoupons(prev => [...prev, response.data]);
      toast.success('Coupon created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create coupon';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCoupon = async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.updateCoupon(id, data);
      setCoupons(prev => 
        prev.map(coupon => 
          coupon.id === id ? { ...coupon, ...response.data } : coupon
        )
      );
      toast.success('Coupon updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update coupon';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== COUPON REDEMPTIONS =====
  const fetchCouponRedemptions = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listCouponRedemptions(params);
      setCouponRedemptions(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch coupon redemptions';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCoupons();
    fetchCouponRedemptions();
  }, []);

  return {
    // Coupons
    coupons,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    
    // Coupon Redemptions
    couponRedemptions,
    fetchCouponRedemptions,
    
    // Common
    isLoading,
    error
  };
};
