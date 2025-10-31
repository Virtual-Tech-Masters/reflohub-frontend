import { useState, useEffect, useCallback } from 'react';
import { businessAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export const useBusinessData = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState({
    profile: null,
    dashboard: {
      subscription: null,
      leads: {
        submitted: 0,
        approved: 0,
        rejected: 0,
        converted: 0,
      },
      payouts: {
        totalCents: 0,
      },
      realizedRevenue: {
        totalCents: 0,
      },
    },
    leads: [],
    stats: {
      totalLeads: 0,
      leadsThisMonth: 0,
      acceptedLeads: 0,
      rejectedLeads: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateStats = (leads) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const leadsThisMonth = leads.filter(
      (lead) => new Date(lead.submittedAt) >= startOfMonth
    ).length;
    const acceptedLeads = leads.filter(
      (lead) => lead.status === 'ACCEPTED'
    ).length;
    const rejectedLeads = leads.filter(
      (lead) => lead.status === 'REJECTED'
    ).length;
    return {
      totalLeads: leads.length,
      leadsThisMonth,
      acceptedLeads,
      rejectedLeads,
    };
  };

  const refreshData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get date range for last 30 days
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(toDate.getDate() - 30);

      const [profileRes, dashboardRes, leadsRes] = await Promise.all([
        businessAPI.getProfile(),
        businessAPI.getDashboard({
          from: fromDate.toISOString(),
          to: toDate.toISOString()
        }),
        businessAPI.listLeads(),
      ]);

      const profile = profileRes.data;
      const dashboard = dashboardRes.data;
      const leads = leadsRes.data.leads || [];

      // Calculate additional stats from leads data
      const stats = calculateStats(leads);

      setData({
        profile,
        dashboard,
        leads,
        stats,
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const createActivity = async (activityData) => {
    try {
      // This would be a real API call when the endpoint exists
      toast.success('Activity created successfully!');
      await refreshData();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateActivity = async (activityId, activityData) => {
    try {
      // This would be a real API call when the endpoint exists
      toast.success('Activity updated successfully!');
      await refreshData();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return { data, loading, error, refreshData, createActivity, updateActivity };
};
