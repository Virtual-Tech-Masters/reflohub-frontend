import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const isValidToken = (token) => token && token.length > 0;

  const isAuthenticated = () => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    return !!(token && user && isValidToken(token));
  };

  const getCurrentAdmin = () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const user = localStorage.getItem('adminUser');
        const onAdminRoute = window.location.pathname.startsWith('/admin');

        if (token && user && isValidToken(token)) {
          const userData = JSON.parse(user);
          if (['ADMIN', 'ANALYST'].includes(userData.role)) {
            setCurrentAdmin(userData);
            if (window.location.pathname === '/admin') {
              setTimeout(() => navigate('/admin/dashboard'), 50);
            }
          } else {
            // Stored adminUser exists but role isn't admin – clear admin storage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setCurrentAdmin(null);
            if (onAdminRoute) {
              toast.error('Admin access required');
              navigate('/admin');
            }
          }
        } else {
          // No valid admin token
          setCurrentAdmin(null);
          if (onAdminRoute) {
            // Clear any generic tokens to avoid accidental reuse on admin scope
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Admin access required');
            // Stay on /admin (login) page; do not redirect away
            if (window.location.pathname !== '/admin') {
              navigate('/admin');
            }
          }
        }
      } catch (error) {
        console.error('AdminAuth: Error checking admin auth:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setCurrentAdmin(null);
        if (window.location.pathname.startsWith('/admin')) {
          toast.error('Admin access required');
          navigate('/admin');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const adminLogin = async (email, password) => {
    try {
      console.log('AdminAuth: Starting login attempt', { email });
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/operator/auth/login`;
      console.log('AdminAuth: Request URL:', apiUrl);
      console.log('AdminAuth: Request body (password hidden):', { email, password: '***' });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-subdomain': 'true',
        },
        body: JSON.stringify({ email, password })
      });

      console.log('AdminAuth: Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        let errorData = null;
        try {
          errorData = await response.json();
          console.log('AdminAuth: Error response data:', errorData);
          message = errorData?.message || errorData?.error || message;
        } catch (parseError) {
          console.error('AdminAuth: Failed to parse error response as JSON:', parseError);
          try {
            const text = await response.text();
            console.log('AdminAuth: Error response text:', text);
          } catch (textError) {
            console.error('AdminAuth: Failed to read error response:', textError);
          }
        }
        // Show the real backend error message, especially for 403
        if (response.status === 403 && errorData?.error) {
          message = errorData.error; // Show the actual backend error
        } else if (response.status === 401 || response.status === 403) {
          message = 'Invalid email or password';
        }
        console.error('AdminAuth: Login failed with error:', {
          status: response.status,
          message,
          errorData
        });
        throw new Error(message);
      }

      const data = await response.json();
      console.log('AdminAuth: Login success response:', data);
      const { token, user } = data;
      const { role } = user || {};

      console.log('AdminAuth: Parsed response', { hasToken: !!token, hasUser: !!user, role });

      if (!token) throw new Error('No token in response');
      if (!['ADMIN', 'ANALYST'].includes(role)) throw new Error('Access denied. Admin privileges required.');

      const adminData = {
        id: user.id,
        email: user.email,
        name: email.split('@')[0],
        role,
        userType: role.toLowerCase(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random&color=fff`
      };

      let tokenString;
      if (typeof token === 'object' && token.accessToken) tokenString = token.accessToken;
      else if (typeof token === 'string') tokenString = token;
      else tokenString = String(token);

      console.log('AdminAuth: Storing admin data', { adminData, tokenLength: tokenString.length });

      // Store under admin-only keys
      localStorage.setItem('adminToken', tokenString);
      localStorage.setItem('adminUser', JSON.stringify(adminData));

      setCurrentAdmin(adminData);
      console.log('AdminAuth: Redirecting to dashboard');
      window.location.href = '/admin/dashboard';
      toast.success('Welcome to Admin Panel!');
      return { admin: adminData, token: token };
    } catch (error) {
      console.error('AdminAuth: Login error:', error);
      console.error('AdminAuth: Error stack:', error.stack);
      console.error('AdminAuth: Full error object:', {
        name: error.name,
        message: error.message,
        cause: error.cause
      });
      toast.error(error.message || 'Admin login failed');
      return false;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setCurrentAdmin(null);
    navigate('/admin');
    toast.success('Logged out successfully');
  };

  const changePassword = async (email, oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token found');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/operator/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-admin-subdomain': 'true'
        },
        body: JSON.stringify({ email, oldPassword, newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password change failed');
      }

      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      console.error('AdminAuth: Password change error:', error);
      toast.error(error.message || 'Password change failed');
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/operator/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-subdomain': 'true' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset failed');
      }
      toast.success('Password reset email sent');
      return true;
    } catch (error) {
      console.error('AdminAuth: Forgot password error:', error);
      toast.error(error.message || 'Password reset failed');
      return false;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/operator/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-subdomain': 'true' },
        body: JSON.stringify({ token, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset failed');
      }
      toast.success('Password reset successfully');
      return true;
    } catch (error) {
      console.error('AdminAuth: Reset password error:', error);
      toast.error(error.message || 'Password reset failed');
      return false;
    }
  };

  const value = {
    currentAdmin,
    loading,
    isAuthenticated,
    getCurrentAdmin,
    adminLogin,
    adminLogout,
    changePassword,
    forgotPassword,
    resetPassword
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
