import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { freelancerAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useFreelancerLeads = () => {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leadsLoaded, setLeadsLoaded] = useState(false);

  const fetchLeads = async (params = {}) => {
    try {
      console.log('Fetching leads with params:', params);
      const response = await freelancerAPI.listLeads(params);
      console.log('Leads API response:', response);
      const data = response.data;

      // If backend returns an array already
      if (Array.isArray(data)) {
        return data;
      }

      // If backend returns grouped structure: { businessCount, results: [{ business, leads: [...], ...}] }
      if (data && Array.isArray(data.results)) {
        const flattened = [];
        for (const group of data.results) {
          const biz = group.business || {};
          const bizName = biz.name || null;
          const bizCategory = biz.category?.name || null;
          const bizLocation = biz.location
            ? `${biz.location.state || ''}${biz.location.state ? ', ' : ''}${biz.location.country || ''}`
            : null;
          for (const lead of group.leads || []) {
            // Pull latest commission fields if present
            const latestCommission = Array.isArray(lead.commission) && lead.commission.length > 0
              ? lead.commission[0]
              : null;
            flattened.push({
              ...lead,
              businessName: bizName,
              businessCategory: bizCategory,
              businessLocation: bizLocation,
              // Normalize commission fields expected by UI
              finalCommissionCents: latestCommission?.finalCommissionCents ?? lead.finalCommissionCents ?? null,
              proposedCommissionCents: latestCommission?.proposedCommissionCents ?? lead.proposedCommissionCents ?? null,
              proposedCommissionPctBps: latestCommission?.proposedCommissionPctBps ?? lead.proposedCommissionPctBps ?? null,
              commissionType: latestCommission?.commissionType ?? lead.commissionType ?? null,
            });
          }
        }
        return flattened;
      }

      // Fallback: return empty array if unexpected shape
      return [];
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      throw error;
    }
  };

  const refreshLeads = async (params = {}) => {
    if (!currentUser || leadsLoaded) {
      console.log('No current user or leads already loaded, skipping leads fetch');
      setLoading(false);
      return;
    }

    setLeadsLoaded(true);

    try {
      setLoading(true);
      setError(null);
      console.log('Refreshing leads for user:', currentUser.id);
      const leadsData = await fetchLeads(params);
      console.log('Leads data received:', leadsData);
      setLeads(Array.isArray(leadsData) ? leadsData : []);
    } catch (error) {
      console.error('Failed to refresh leads:', error);
      setError(error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const getLead = async (leadId) => {
    try {
      const response = await freelancerAPI.getLead(leadId);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lead:', error);
      throw error;
    }
  };

  const submitLead = async (leadData) => {
    try {
      const response = await freelancerAPI.submitLead(leadData);
      toast.success('Lead submitted successfully!');
      // Refresh leads after successful submission
      await refreshLeads();
      return response.data;
    } catch (error) {
      console.error('Failed to submit lead:', error);
      const message = error.response?.data?.message || 'Failed to submit lead';
      toast.error(message);
      throw error;
    }
  };

  const acknowledgeCommission = async (leadId) => {
    try {
      const response = await freelancerAPI.acknowledgeCommission(leadId);
      toast.success('Commission acknowledged!');
      // Refresh leads after successful acknowledgment
      await refreshLeads();
      return response.data;
    } catch (error) {
      console.error('Failed to acknowledge commission:', error);
      const message = error.response?.data?.message || 'Failed to acknowledge commission';
      toast.error(message);
      throw error;
    }
  };

  const sendMessage = async (leadId, message) => {
    try {
      const response = await freelancerAPI.message(leadId, message);
      toast.success('Message sent!');
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
      throw error;
    }
  };

  const getConversation = async (leadId, params = {}) => {
    try {
      const response = await freelancerAPI.conversation(leadId, params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      // Reset the loaded flag when user changes
      setLeadsLoaded(false);
      refreshLeads();
    }
  }, [currentUser?.id]); // Only depend on user ID, not entire currentUser object

  return {
    leads,
    loading,
    error,
    refreshLeads,
    getLead,
    submitLead,
    acknowledgeCommission,
    sendMessage,
    getConversation
  };
};
