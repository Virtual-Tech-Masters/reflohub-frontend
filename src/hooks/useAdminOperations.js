import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI.js';
import toast from 'react-hot-toast';

// Hook for managing admin operations (CRUD, leads, campaigns)
export const useAdminOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business Operations
  const updateBusiness = async (businessId, updateData) => {
    try {
      setLoading(true);
      const response = await adminAPI.updateBusiness(businessId, updateData);
      toast.success('Business updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating business:', error);
      toast.error('Failed to update business');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBusiness = async (businessId, reason) => {
    try {
      setLoading(true);
      const response = await adminAPI.softDeleteBusiness(businessId, reason);
      toast.success('Business deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Failed to delete business');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const restoreBusiness = async (businessId) => {
    try {
      setLoading(true);
      const response = await adminAPI.restoreBusiness(businessId);
      toast.success('Business restored successfully');
      return response.data;
    } catch (error) {
      console.error('Error restoring business:', error);
      toast.error('Failed to restore business');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const impersonateBusiness = async (businessId) => {
    try {
      setLoading(true);
      const response = await adminAPI.impersonateBusiness(businessId);
      toast.success('Impersonation token generated');
      return response.data;
    } catch (error) {
      console.error('Error impersonating business:', error);
      toast.error('Failed to generate impersonation token');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Freelancer Operations
  const updateFreelancer = async (freelancerId, updateData) => {
    try {
      setLoading(true);
      const response = await adminAPI.updateFreelancer(freelancerId, updateData);
      toast.success('Freelancer updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating freelancer:', error);
      toast.error('Failed to update freelancer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteFreelancer = async (freelancerId, reason) => {
    try {
      setLoading(true);
      const response = await adminAPI.softDeleteFreelancer(freelancerId, reason);
      toast.success('Freelancer deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting freelancer:', error);
      toast.error('Failed to delete freelancer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const restoreFreelancer = async (freelancerId) => {
    try {
      setLoading(true);
      const response = await adminAPI.restoreFreelancer(freelancerId);
      toast.success('Freelancer restored successfully');
      return response.data;
    } catch (error) {
      console.error('Error restoring freelancer:', error);
      toast.error('Failed to restore freelancer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const impersonateFreelancer = async (freelancerId) => {
    try {
      setLoading(true);
      const response = await adminAPI.impersonateFreelancer(freelancerId);
      toast.success('Impersonation token generated');
      return response.data;
    } catch (error) {
      console.error('Error impersonating freelancer:', error);
      toast.error('Failed to generate impersonation token');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verification Operations
  const verifyFreelancer = async (freelancerId, isVerified, verificationNotes) => {
    try {
      setLoading(true);
      const response = await adminAPI.verifyFreelancer(freelancerId, {
        isVerified,
        verificationNotes
      });
      toast.success(`Freelancer ${isVerified ? 'verified' : 'rejected'} successfully`);
      return response.data;
    } catch (error) {
      console.error('Error verifying freelancer:', error);
      toast.error('Failed to verify freelancer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyBusiness = async (businessId, isVerified, verificationNotes) => {
    try {
      setLoading(true);
      const response = await adminAPI.verifyBusiness(businessId, {
        isVerified,
        verificationNotes
      });
      toast.success(`Business ${isVerified ? 'verified' : 'rejected'} successfully`);
      return response.data;
    } catch (error) {
      console.error('Error verifying business:', error);
      toast.error('Failed to verify business');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const bulkVerifyFreelancers = async (verifications) => {
    try {
      setLoading(true);
      const response = await adminAPI.bulkVerifyFreelancers({ list: verifications });
      toast.success('Bulk verification completed');
      return response.data;
    } catch (error) {
      console.error('Error bulk verifying freelancers:', error);
      toast.error('Failed to bulk verify freelancers');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const bulkVerifyBusinesses = async (verifications) => {
    try {
      setLoading(true);
      const response = await adminAPI.bulkVerifyBusinesses({ list: verifications });
      toast.success('Bulk verification completed');
      return response.data;
    } catch (error) {
      console.error('Error bulk verifying businesses:', error);
      toast.error('Failed to bulk verify businesses');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // Business operations
    updateBusiness,
    deleteBusiness,
    restoreBusiness,
    impersonateBusiness,
    // Freelancer operations
    updateFreelancer,
    deleteFreelancer,
    restoreFreelancer,
    impersonateFreelancer,
    // Verification operations
    verifyFreelancer,
    verifyBusiness,
    bulkVerifyFreelancers,
    bulkVerifyBusinesses
  };
};

// Hook for managing leads with detailed information
export const useAdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeads = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.listLeads(filters);
      const leadsData = response.data?.items || response.data || [];
      
      // Enhance leads with additional details
      const enhancedLeads = await Promise.all(
        leadsData.map(async (lead) => {
          try {
            // Fetch business details
            const businessRes = await adminAPI.getBusiness(lead.businessId);
            const business = businessRes.data;
            
            // Fetch freelancer details
            const freelancerRes = await adminAPI.getFreelancer(lead.freelancerId);
            const freelancer = freelancerRes.data;
            
            // Check if business has campaigns
            const campaignsRes = await adminAPI.listBusinessCampaigns(lead.businessId);
            const campaigns = campaignsRes.data?.items || campaignsRes.data || [];
            
            return {
              ...lead,
              business: {
                id: business.id,
                name: business.name || business.businessName || business.contactName,
                email: business.email,
                phone: business.phone,
                location: business.location,
                industry: business.industry,
                hasCampaigns: campaigns.length > 0,
                campaigns: campaigns
              },
              freelancer: {
                id: freelancer.id,
                name: freelancer.fullName,
                email: freelancer.email,
                phone: freelancer.phone,
                skills: freelancer.skills,
                experience: freelancer.experience
              },
              // Lead specific details
              status: lead.status || 'PENDING',
              acknowledgment: lead.acknowledgment || false,
              acknowledgmentDate: lead.acknowledgmentDate,
              createdAt: lead.createdAt,
              updatedAt: lead.updatedAt
            };
          } catch (error) {
            console.error('Error enhancing lead:', error);
            return lead;
          }
        })
      );
      
      setLeads(enhancedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError(error.message);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (leadId, updateData) => {
    try {
      setLoading(true);
      const response = await adminAPI.updateLead(leadId, updateData);
      toast.success('Lead updated successfully');
      
      // Refresh leads data
      await fetchLeads();
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (leadId) => {
    try {
      setLoading(true);
      // Note: This might need to be implemented in the backend
      // For now, we'll just update the status to 'DELETED'
      const response = await adminAPI.updateLead(leadId, { status: 'DELETED' });
      toast.success('Lead deleted successfully');
      
      // Refresh leads data
      await fetchLeads();
      return response.data;
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeLead = async (leadId) => {
    try {
      setLoading(true);
      const response = await adminAPI.updateLead(leadId, {
        acknowledgment: true,
        acknowledgmentDate: new Date().toISOString()
      });
      toast.success('Lead acknowledged successfully');
      
      // Refresh leads data
      await fetchLeads();
      return response.data;
    } catch (error) {
      console.error('Error acknowledging lead:', error);
      toast.error('Failed to acknowledge lead');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    updateLead,
    deleteLead,
    acknowledgeLead
  };
};

// Hook for managing campaigns
export const useAdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBusinessCampaigns = async (businessId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.listBusinessCampaigns(businessId);
      const campaignsData = response.data?.items || response.data || [];
      setCampaigns(campaignsData);
      
      return campaignsData;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError(error.message);
      toast.error('Failed to fetch campaigns');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (campaignId, updateData) => {
    try {
      setLoading(true);
      const response = await adminAPI.updateCampaign(campaignId, updateData);
      toast.success('Campaign updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId) => {
    try {
      setLoading(true);
      const response = await adminAPI.deleteCampaign(campaignId);
      toast.success('Campaign deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    campaigns,
    loading,
    error,
    fetchBusinessCampaigns,
    updateCampaign,
    deleteCampaign
  };
};
