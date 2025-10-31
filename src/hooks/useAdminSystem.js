import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI.js';
import toast from 'react-hot-toast';

// Hook for managing system operations
export const useAdminSystem = () => {
  const [emailLogs, setEmailLogs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [processedEvents, setProcessedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== EMAIL LOGS =====
  const fetchEmailLogs = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listEmailLogs(params);
      setEmailLogs(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch email logs';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.sendEmail(data);
      toast.success('Email sent successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send email';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== JOBS =====
  const fetchJobs = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listJobs(params);
      setJobs(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch jobs';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const triggerJob = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.triggerJob(data);
      toast.success('Job triggered successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to trigger job';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== WEBHOOK EVENTS =====
  const fetchProcessedEvents = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listProcessedEvents(params);
      setProcessedEvents(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch processed events';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const replayWebhookEvent = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.replayWebhookEvent(data);
      toast.success('Webhook event replayed successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to replay webhook event';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchEmailLogs();
    fetchJobs();
    fetchProcessedEvents();
  }, []);

  return {
    // Email Logs
    emailLogs,
    fetchEmailLogs,
    sendEmail,
    
    // Jobs
    jobs,
    fetchJobs,
    triggerJob,
    
    // Webhook Events
    processedEvents,
    fetchProcessedEvents,
    replayWebhookEvent,
    
    // Common
    isLoading,
    error
  };
};
