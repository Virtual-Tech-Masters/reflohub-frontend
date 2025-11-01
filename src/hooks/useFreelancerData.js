import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { freelancerAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

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
      throw error;
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await freelancerAPI.listLeads();
      return response.data.leads || [];
    } catch (error) {
      throw error;
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await freelancerAPI.getCredits();
      return response.data;
    } catch (error) {
      return { creditsRemaining: 0, creditsTotal: 0, creditsUsed: 0 };
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await freelancerAPI.getDashboard();
      return response.data;
    } catch (error) {
      return null;
    }
  };

  const calculateStats = (leads) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalLeads = leads.length;
    // Normalize status comparison
    const acceptedLeads = leads.filter(lead => {
      const statusUpper = (lead.status || '').toUpperCase();
      return statusUpper === 'ACCEPTED' || statusUpper === 'APPROVED';
    }).length;
    const rejectedLeads = leads.filter(lead => {
      const statusUpper = (lead.status || '').toUpperCase();
      return statusUpper === 'REJECTED';
    }).length;
    const pendingLeads = leads.filter(lead => {
      const statusUpper = (lead.status || '').toUpperCase();
      return statusUpper === 'PENDING' || statusUpper === 'SUBMITTED';
    }).length;
    const leadsThisMonth = leads.filter(lead => 
      lead.submittedAt && new Date(lead.submittedAt) >= startOfMonth
    ).length;
    
    // Calculate money earned from actual commission data (in cents)
    const moneyEarned = leads.reduce((sum, lead) => {
      const commission = lead.finalCommissionCents || 
                       (typeof lead.commissionEarned === 'number' && lead.commissionEarned < 1000 ? lead.commissionEarned * 100 : lead.commissionEarned) || 
                       0;
      return sum + commission;
    }, 0);

    return {
      totalLeads,
      acceptedLeads,
      rejectedLeads,
      pendingLeads,
      leadsThisMonth,
      moneyEarned: Math.round(moneyEarned / 100) // Convert to dollars for display
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
      setError(error);
      toast.error(getErrorMessage(error));
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
      toast.error(getErrorMessage(error));
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
      toast.error(getErrorMessage(error));
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
      toast.error(getErrorMessage(error));
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
