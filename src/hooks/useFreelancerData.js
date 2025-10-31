import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { freelancerAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useFreelancerData = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState({
    profile: null,
    leads: [],
    credits: { creditsRemaining: 0, creditsTotal: 0, creditsUsed: 0 },
    subscription: { status: 'INACTIVE', plan: null, nextCycleAt: null },
    earnings: 0,
    stats: {
      totalLeads: 0,
      acceptedLeads: 0,
      rejectedLeads: 0,
      pendingLeads: 0,
      leadsThisMonth: 0,
      moneyEarned: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await freelancerAPI.getProfile();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await freelancerAPI.listLeads();
      return response.data.leads || [];
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      throw error;
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await freelancerAPI.getCredits();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch credits:', error);
      return { creditsRemaining: 0, creditsTotal: 0, creditsUsed: 0 };
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await freelancerAPI.getDashboard();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      return null;
    }
  };

  const calculateStats = (leads) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalLeads = leads.length;
    const acceptedLeads = leads.filter(lead => lead.status === 'accepted').length;
    const rejectedLeads = leads.filter(lead => lead.status === 'rejected').length;
    const pendingLeads = leads.filter(lead => lead.status === 'pending').length;
    const leadsThisMonth = leads.filter(lead => 
      new Date(lead.submittedAt) >= startOfMonth
    ).length;
    
    // Calculate money earned (assuming $100 per accepted lead for now)
    const moneyEarned = acceptedLeads * 100;

    return {
      totalLeads,
      acceptedLeads,
      rejectedLeads,
      pendingLeads,
      leadsThisMonth,
      moneyEarned
    };
  };

  const refreshData = async () => {
    if (!currentUser || dataLoaded) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [profile, leads, credits, dashboard] = await Promise.all([
        fetchProfile(),
        fetchLeads(),
        fetchCredits(),
        fetchDashboard()
      ]);

      const stats = calculateStats(leads);

      setData({
        profile,
        leads,
        credits,
        subscription: dashboard?.subscription || { status: 'INACTIVE', plan: null, nextCycleAt: null },
        earnings: dashboard?.totalEarned || stats.moneyEarned,
        stats
      });
      setDataLoaded(true);

    } catch (error) {
      console.error('Failed to fetch freelancer data:', error);
      setError(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const submitLead = async (leadData) => {
    try {
      const response = await freelancerAPI.submitLead(leadData);
      toast.success('Lead submitted successfully!');
      // Refresh data after successful submission
      await refreshData();
      return response.data;
    } catch (error) {
      console.error('Failed to submit lead:', error);
      const message = error.response?.data?.message || 'Failed to submit lead';
      toast.error(message);
      throw error;
    }
  };

  const purchaseCredits = async (packKey) => {
    try {
      const response = await freelancerAPI.purchaseCredits(packKey);
      toast.success('Credits purchased successfully!');
      // Refresh data after successful purchase
      await refreshData();
      return response.data;
    } catch (error) {
      console.error('Failed to purchase credits:', error);
      const message = error.response?.data?.message || 'Failed to purchase credits';
      toast.error(message);
      throw error;
    }
  };

  const acknowledgeCommission = async (leadId) => {
    try {
      const response = await freelancerAPI.acknowledgeCommission(leadId);
      toast.success('Commission acknowledged!');
      // Refresh data after successful acknowledgment
      await refreshData();
      return response.data;
    } catch (error) {
      console.error('Failed to acknowledge commission:', error);
      const message = error.response?.data?.message || 'Failed to acknowledge commission';
      toast.error(message);
      throw error;
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      setDataLoaded(false);
      refreshData();
    }
  }, [currentUser?.id]);

  return {
    data,
    loading,
    error,
    refreshData,
    submitLead,
    purchaseCredits,
    acknowledgeCommission
  };
};
