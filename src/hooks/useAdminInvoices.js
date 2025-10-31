import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI.js';
import toast from 'react-hot-toast';

// Hook for managing invoices and payments
export const useAdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoiceLines, setInvoiceLines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== INVOICES =====
  const fetchInvoices = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listInvoices(params);
      setInvoices(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch invoices';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getInvoice = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.getInvoice(id);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch invoice';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInvoice = async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.updateInvoice(id, data);
      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === id ? { ...invoice, ...response.data } : invoice
        )
      );
      toast.success('Invoice updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update invoice';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== INVOICE LINES =====
  const fetchInvoiceLines = async (invoiceId, params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listInvoiceLines(invoiceId, params);
      setInvoiceLines(response.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch invoice lines';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addInvoiceLine = async (invoiceId, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.addInvoiceLine(invoiceId, data);
      setInvoiceLines(prev => [...prev, response.data]);
      toast.success('Invoice line added successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to add invoice line';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== PAYMENTS =====
  const fetchPayments = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.listPayments(params);
      setPayments(response.data?.items || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch payments';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getPayment = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.getPayment(id);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch payment';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayment = async (id, data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.updatePayment(id, data);
      setPayments(prev => 
        prev.map(payment => 
          payment.id === id ? { ...payment, ...response.data } : payment
        )
      );
      toast.success('Payment updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update payment';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refundPayment = async (id, amountCents) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.refundPayment(id, amountCents);
      setPayments(prev => 
        prev.map(payment => 
          payment.id === id ? { ...payment, ...response.data } : payment
        )
      );
      toast.success('Payment refunded successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to refund payment';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchInvoices();
    fetchPayments();
  }, []);

  return {
    // Invoices
    invoices,
    fetchInvoices,
    getInvoice,
    updateInvoice,
    
    // Invoice Lines
    invoiceLines,
    fetchInvoiceLines,
    addInvoiceLine,
    
    // Payments
    payments,
    fetchPayments,
    getPayment,
    updatePayment,
    refundPayment,
    
    // Common
    isLoading,
    error
  };
};
