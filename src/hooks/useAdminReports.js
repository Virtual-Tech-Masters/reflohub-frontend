import { useState } from 'react';
import { adminAPI } from '../utils/adminAPI.js';
import toast from 'react-hot-toast';

// Hook for managing reports
export const useAdminReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== REVENUE REPORT =====
  const getRevenueReport = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.reportRevenue(params);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch revenue report';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== SUBSCRIPTIONS REPORT =====
  const getSubscriptionsReport = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.reportSubscriptions(params);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch subscriptions report';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LEADS FUNNEL REPORT =====
  const getLeadsFunnelReport = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.reportLeadsFunnel(params);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch leads funnel report';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== PAYOUTS REPORT =====
  const getPayoutsReport = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.reportPayouts(params);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch payouts report';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== CREDIT USAGE REPORT =====
  const getCreditUsageReport = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.reportCreditUsage(params);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch credit usage report';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== COMPREHENSIVE DASHBOARD DATA =====
  const getDashboardData = async (dateRange = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { from, to } = dateRange;
      const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const defaultTo = new Date().toISOString();
      
      const params = {
        from: from || defaultFrom,
        to: to || defaultTo,
        groupBy: 'day'
      };

      const [
        revenueData,
        subscriptionsData,
        leadsFunnelData,
        payoutsData,
        creditUsageData
      ] = await Promise.all([
        getRevenueReport(params),
        getSubscriptionsReport(params),
        getLeadsFunnelReport(params),
        getPayoutsReport(params),
        getCreditUsageReport(params)
      ]);

      return {
        revenue: revenueData,
        subscriptions: subscriptionsData,
        leadsFunnel: leadsFunnelData,
        payouts: payoutsData,
        creditUsage: creditUsageData
      };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getRevenueReport,
    getSubscriptionsReport,
    getLeadsFunnelReport,
    getPayoutsReport,
    getCreditUsageReport,
    getDashboardData,
    isLoading,
    error
  };
};
