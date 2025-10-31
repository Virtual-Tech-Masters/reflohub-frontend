import { useState } from 'react';
import { adminAPI } from '../utils/adminAPI.js';
import toast from 'react-hot-toast';

// Hook for managing admin authentication
export const useAdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.login(email, password);
      
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Login successful');
        return response.data;
      }
      
      throw new Error('Invalid response from server');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (email, oldPassword, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.changePassword(email, oldPassword, newPassword);
      
      if (response.data?.ok) {
        toast.success('Password changed successfully');
        return response.data;
      }
      
      throw new Error('Password change failed');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Password change failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.resetPassword(token, password);
      
      if (response.data?.ok) {
        toast.success('Password reset successfully');
        return response.data;
      }
      
      throw new Error('Password reset failed');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Password reset failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminAPI.forgotPassword(email);
      
      if (response.data?.ok) {
        toast.success('Password reset email sent');
        return response.data;
      }
      
      throw new Error('Failed to send reset email');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send reset email';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  return {
    login,
    changePassword,
    resetPassword,
    forgotPassword,
    logout,
    getCurrentUser,
    isAuthenticated,
    isLoading,
    error
  };
};
