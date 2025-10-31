import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  // Validate token format (basic check)
  const isValidToken = (token) => {
    if (!token) return false;
    try {
      // Basic JWT format check (3 parts separated by dots)
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        console.log('AuthContext: Checking stored user:', user);
        console.log('AuthContext: Checking stored token:', token ? 'exists' : 'missing');
        
        if (user && token && isValidToken(token)) {
          const parsedUser = JSON.parse(user);
          console.log('AuthContext: Setting current user:', parsedUser);
          setCurrentUser(parsedUser);
        } else {
          console.log('AuthContext: No valid user or token found, clearing state');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error checking auth state:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login with:', { email });
      
      const response = await authAPI.login(email, password);
      console.log('AuthContext: Login response:', response);
      
      // The backend returns { token: { accessToken, refreshToken }, user: {...}, emailVerified, isActive }
      const { token, user, emailVerified, isActive } = response.data;
      const { role } = user;
      
      if (!token || !token.accessToken) {
        console.error('AuthContext: Missing access token:', { token });
        throw new Error('No access token in response');
      }
      
      const accessToken = token.accessToken;
      
      const userData = {
        id: user.id,
        email: user.email,
        name: user.fullName || user.name || email.split('@')[0],
        role: role,
        userType: role.toLowerCase(), // Add userType for DashboardLayout compatibility
        emailVerified: emailVerified,
        isActive: isActive,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.name || email.split('@')[0])}&background=random&color=fff`,
      };
      
      console.log('AuthContext: Storing user data:', userData);
      
      // Store token and user data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setCurrentUser(userData);
      
      // Redirect based on user role and status
      if (role === 'BUSINESS') {
        if (!emailVerified) {
          toast.error('Please verify your email before logging in.');
          navigate('/email-verification-required');
          return { user: userData, token: accessToken };
        }
        if (!isActive) {
          toast.error('Your account is not active. Please choose a subscription plan.');
          navigate('/business/subscription');
          return { user: userData, token: accessToken };
        }
        toast.success('Welcome back!');
        navigate('/business');
        return { user: userData, token: accessToken };
      } else if (role === 'FREELANCER') {
        if (!emailVerified) {
          toast.error('Please verify your email before logging in.');
          navigate('/email-verification-required');
          return { user: userData, token: accessToken };
        }
        if (!isActive) {
          toast.error('Your account is not active. Please choose a subscription plan.');
          navigate('/freelancer/subscription');
          return { user: userData, token: accessToken };
        }
        toast.success('Welcome back!');
        navigate('/freelancer');
        return { user: userData, token: accessToken };
      } else {
        // Invalid role - clear auth data and redirect
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setCurrentUser(null);
        toast.error('Invalid user role. Please contact support.');
        navigate('/login');
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      
      // User-friendly error messages
      let message = 'Login failed. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 401) {
          message = 'Invalid email or password. Please check your credentials and try again.';
        } else if (status === 403) {
          message = 'Your account has been suspended. Please contact support for assistance.';
        } else if (status === 404) {
          message = 'Account not found. Please check your email address or register for a new account.';
        } else if (status === 429) {
          message = 'Too many login attempts. Please wait a few minutes before trying again.';
        } else if (status >= 500) {
          message = 'Server error. Please try again later.';
        } else if (errorData?.message) {
          // Use backend message if it's user-friendly, otherwise use default
          const backendMsg = errorData.message.toLowerCase();
          if (backendMsg.includes('invalid') || backendMsg.includes('credential')) {
            message = 'Invalid email or password. Please check your credentials and try again.';
          } else if (backendMsg.includes('suspended') || backendMsg.includes('blocked')) {
            message = 'Your account has been suspended. Please contact support.';
          } else {
            message = errorData.message;
          }
        }
      } else if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
        message = 'Unable to connect to server. Please check your internet connection and try again.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      return false;
    }
  };

  // Register function
  const register = async (registrationData, userType) => {
    try {
      const role = userType.toUpperCase();
      console.log('AuthContext: Registering with role:', role, 'data:', registrationData);
      
      const response = await authAPI.register(role, registrationData);
      
      if (!response.data) {
        throw new Error('No data in response');
      }
      
      // Handle different response structures based on user type
      if (role === 'BUSINESS') {
        // Business registration returns { user: {...}, regAuthToken: "..." }
        const { user, regAuthToken } = response.data;
        
        if (!user) {
          throw new Error('No user data in response');
        }
        
        if (!regAuthToken) {
          throw new Error('No registration token in response');
        }
        
        console.log('AuthContext: Business registration successful, user created with ID:', user.id);
        console.log('AuthContext: User email:', user.email);
        console.log('AuthContext: User name:', user.name);
        
        // Store email in localStorage for email verification page
        localStorage.setItem('registrationEmail', user.email);
        
        // Automatically send verification email
        try {
          await authAPI.sendEmailVerification(role, user.id, user.email, regAuthToken);
          toast.success('Business registration successful! Verification email sent to your inbox.');
        } catch (error) {
          console.error('Failed to send verification email:', error);
          toast.error('Registration successful, but failed to send verification email. Please use the resend button.');
        }
        
        // Redirect to email verification page with parameters
        const verificationUrl = `/email-verification?role=${role.toLowerCase()}&userId=${user.id}&regAuthToken=${regAuthToken}&email=${encodeURIComponent(user.email)}`;
        navigate(verificationUrl);
        
        return { user, regAuthToken };
      } else if (role === 'FREELANCER') {
        // Freelancer registration returns { user: {...}, regAuthToken: "..." }
        const { user, regAuthToken } = response.data;
        
        if (!user) {
          throw new Error('No user data in response');
        }
        
        if (!regAuthToken) {
          throw new Error('No registration token in response');
        }
        
        console.log('AuthContext: Freelancer registration successful, user created with ID:', user.id);
        console.log('AuthContext: User email:', user.email);
        console.log('AuthContext: User fullName:', user.fullName || user.name);
        
        // Store email in localStorage for email verification page
        localStorage.setItem('registrationEmail', user.email);
        
        // Automatically send verification email
        try {
          await authAPI.sendEmailVerification(role, user.id, user.email, regAuthToken);
          toast.success('Freelancer registration successful! Verification email sent to your inbox.');
        } catch (error) {
          console.error('Failed to send verification email:', error);
          toast.error('Registration successful, but failed to send verification email. Please use the resend button.');
        }
        
        // Redirect to email verification page with parameters
        const verificationUrl = `/email-verification?role=${role.toLowerCase()}&userId=${user.id}&regAuthToken=${regAuthToken}&email=${encodeURIComponent(user.email)}`;
        navigate(verificationUrl);
        
        return { user, regAuthToken };
      } else {
        // Other user types return { tokens: { accessToken, refreshToken }, user: {...} }
        const { tokens, user } = response.data;
        
        if (!tokens || !tokens.accessToken) {
          throw new Error('No access token in response');
        }
        
        const token = tokens.accessToken;
        
        if (!user) {
          throw new Error('No user data in response');
        }
        
        console.log('AuthContext: Registration successful, user created with ID:', user.id);
        console.log('AuthContext: User email:', user.email);
        console.log('AuthContext: User fullName:', user.fullName || user.name);
        
        // Don't store token/user data since we're redirecting to login
        // The user will need to log in with their credentials
        
        console.log('AuthContext: Registration successful, redirecting to login');
        // Redirect to login page after successful registration
        navigate('/login');
        toast.success('Registration successful! Please log in with your new account.');
        return true;
      }
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      
      // User-friendly error messages
      let message = 'Registration failed. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        const errorMsg = (errorData?.message || errorData?.error || '').toLowerCase();
        
        if (status === 400) {
          if (errorMsg.includes('email') && errorMsg.includes('already') || errorMsg.includes('exists')) {
            message = 'This email address is already registered. Please use a different email or try logging in.';
          } else if (errorMsg.includes('password')) {
            message = 'Password does not meet requirements. Please use a stronger password.';
          } else if (errorMsg.includes('terms')) {
            message = 'Please accept the terms and conditions to continue.';
          } else if (errorData?.message) {
            message = errorData.message;
          } else {
            message = 'Invalid registration data. Please check all fields and try again.';
          }
        } else if (status === 409) {
          message = 'This email address is already registered. Please use a different email or try logging in.';
        } else if (status >= 500) {
          message = 'Server error. Please try again later.';
        } else if (errorData?.message) {
          message = errorData.message;
        }
      } else if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
        message = 'Unable to connect to server. Please check your internet connection and try again.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
    toast.success('Successfully logged out!');
  };

  // Update user profile
  const updateProfile = (userData) => {
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Profile updated successfully!');
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};