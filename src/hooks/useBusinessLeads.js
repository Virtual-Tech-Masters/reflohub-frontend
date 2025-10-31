import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { businessAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export const useBusinessLeads = () => {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await businessAPI.listLeads();
      const leadsData = response.data.leads || [];
      
      setLeads(leadsData);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateLeadStatus = async (leadId, status) => {
    try {
      await businessAPI.updateLeadStatus(leadId, { status });
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, status } : lead
        )
      );
      toast.success('Lead status updated successfully!');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateLeadPaymentStatus = async (leadId, paymentStatus) => {
    try {
      await businessAPI.updateLeadPaymentStatus(leadId, { paymentStatus });
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, paymentStatus } : lead
        )
      );
      toast.success('Payment status updated successfully!');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteLead = async (leadId) => {
    try {
      await businessAPI.deleteLead(leadId);
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      toast.success('Lead deleted successfully!');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const getLeadStats = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
    const quarterStart = new Date(todayStart.getTime() - 90 * 24 * 60 * 60 * 1000);

    return {
      today: leads.filter(lead => 
        new Date(lead.createdAt) >= todayStart
      ).length,
      week: leads.filter(lead => 
        new Date(lead.createdAt) >= weekStart
      ).length,
      month: leads.filter(lead => 
        new Date(lead.createdAt) >= monthStart
      ).length,
      quarter: leads.filter(lead => 
        new Date(lead.createdAt) >= quarterStart
      ).length,
      total: leads.length,
      accepted: leads.filter(lead => lead.status === 'accepted').length,
      rejected: leads.filter(lead => lead.status === 'rejected').length,
      pending: leads.filter(lead => lead.status === 'pending').length,
      paid: leads.filter(lead => lead.paymentStatus === 'paid').length,
      unpaid: leads.filter(lead => lead.paymentStatus === 'unpaid').length,
    };
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    refreshLeads: fetchLeads,
    updateLeadStatus,
    updateLeadPaymentStatus,
    deleteLead,
    getLeadStats
  };
};
