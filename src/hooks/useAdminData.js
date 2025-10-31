import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI.js';
import toast from 'react-hot-toast';

// Hook for managing admin dashboard data
export const useAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalFreelancers: 0,
    revenue: 0,
    isLoading: true,
    error: null
  });

  const [revenueData, setRevenueData] = useState(null);
  const [usersData, setUsersData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Check if admin token exists before making API calls
        const adminToken = localStorage.getItem('token');
        if (!adminToken) {
          console.log('useAdminDashboard: No admin token found, waiting...');
          // Wait a bit for the token to be stored
          setTimeout(() => {
            const retryToken = localStorage.getItem('token');
            if (retryToken) {
              console.log('useAdminDashboard: Token found on retry, fetching data');
              fetchDashboardData();
            } else {
              console.log('useAdminDashboard: Still no token, setting error');
              setDashboardData(prev => ({ ...prev, isLoading: false, error: 'No admin token found' }));
            }
          }, 500);
          return;
        }
        
        console.log('useAdminDashboard: Token found, making API calls');
        
        // Fetch businesses and freelancers data
        const [businessesRes, freelancersRes, revenueRes] = await Promise.all([
          adminAPI.searchBusinesses({ limit: 200 }),
          adminAPI.searchFreelancers({ limit: 200 }),
          adminAPI.reportRevenue({ 
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString()
          })
        ]);

        const businesses = businessesRes.data?.items || [];
        const freelancers = freelancersRes.data?.items || [];
        const revenue = revenueRes.data || [];

        // Calculate total revenue from array (using correct schema variable: totalCents)
        const totalRevenue = Array.isArray(revenue) 
          ? revenue.reduce((sum, item) => sum + (item.totalCents || 0), 0)
          : 0;

        setDashboardData({
          totalUsers: businesses.length + freelancers.length,
          totalBusinesses: businesses.length,
          totalFreelancers: freelancers.length,
          revenue: totalRevenue,
          isLoading: false,
          error: null
        });

        // Set chart data
        setRevenueData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Revenue',
            data: [10000, 15000, 12000, 18000, 16000, 21000, 22000, 24000, 19000, 23000, 25000, 28000],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
          }]
        });

        setUsersData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Businesses',
              data: [10, 15, 20, 25, 30, 35],
              backgroundColor: '#3b82f6',
            },
            {
              label: 'Freelancers',
              data: [20, 30, 40, 50, 60, 70],
              backgroundColor: '#14b8a6',
            }
          ]
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to fetch dashboard data'
        }));
        toast.error('Failed to load dashboard data');
      }
    };

    fetchDashboardData();
  }, []);

  return {
    dashboardData,
    revenueData,
    usersData,
    refetch: () => {
      setDashboardData(prev => ({ ...prev, isLoading: true }));
      // Trigger re-fetch by updating a dependency
    }
  };
};

// Hook for managing users (businesses and freelancers)
export const useAdminUsers = ({ userType = 'all', search = '', status = 'all' } = {}) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let allUsers = [];

        if (userType === 'all' || userType === 'business') {
          const businessesRes = await adminAPI.searchBusinesses({ 
            limit: 200,
            name: search || undefined,
            isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
            isVerified: status === 'verified' ? true : status === 'unverified' ? false : undefined
          });
          const businesses = (businessesRes.data?.items || []).map(business => ({
            ...business,
            id: `business-${business.id}`, // Make ID unique
            userType: 'business',
            name: business.name || business.businessName || business.contactName,
            email: business.email,
            status: business.isActive ? 'active' : 'inactive',
            joinedDate: business.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'N/A',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name || business.businessName || business.contactName)}&background=random&color=fff`
          }));
          allUsers = [...allUsers, ...businesses];
        }

        if (userType === 'all' || userType === 'freelancer') {
          const freelancersRes = await adminAPI.searchFreelancers({ 
            limit: 200,
            email: search || undefined,
            isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
            isVerified: status === 'verified' ? true : status === 'unverified' ? false : undefined
          });
          const freelancers = (freelancersRes.data?.items || []).map(freelancer => ({
            ...freelancer,
            id: `freelancer-${freelancer.id}`, // Make ID unique
            userType: 'freelancer',
            name: freelancer.fullName,
            email: freelancer.email,
            status: freelancer.isActive ? 'active' : 'inactive',
            joinedDate: freelancer.createdAt ? new Date(freelancer.createdAt).toLocaleDateString() : 'N/A',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.fullName)}&background=random&color=fff`
          }));
          allUsers = [...allUsers, ...freelancers];
        }

        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message || 'Failed to fetch users');
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [userType, search, status]);

  const updateUser = async (userId, data) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      if (user.userType === 'business') {
        await adminAPI.updateBusiness(userId, data);
      } else if (user.userType === 'freelancer') {
        await adminAPI.updateFreelancer(userId, data);
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, ...data } : u
      ));
      
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (userId, reason) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      // Extract original ID from unique ID
      const originalId = userId.replace(`${user.userType}-`, '');

      if (user.userType === 'business') {
        await adminAPI.softDeleteBusiness(originalId, { deleteReason: reason });
      } else if (user.userType === 'freelancer') {
        await adminAPI.softDeleteFreelancer(originalId, { deleteReason: reason });
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: 'inactive' } : u
      ));
      
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const restoreUser = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      // Extract original ID from unique ID
      const originalId = userId.replace(`${user.userType}-`, '');

      if (user.userType === 'business') {
        await adminAPI.restoreBusiness(originalId);
      } else if (user.userType === 'freelancer') {
        await adminAPI.restoreFreelancer(originalId);
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: 'active' } : u
      ));
      
      toast.success('User restored successfully');
    } catch (error) {
      console.error('Error restoring user:', error);
      toast.error('Failed to restore user');
    }
  };

  return {
    users,
    isLoading,
    error,
    updateUser,
    deleteUser,
    restoreUser
  };
};

// Hook for managing pending verifications
export const useAdminVerifications = () => {
  const [pendingFreelancers, setPendingFreelancers] = useState([]);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [freelancersRes, businessesRes] = await Promise.all([
          adminAPI.getPendingFreelancers(),
          adminAPI.getPendingBusinesses()
        ]);

        setPendingFreelancers(freelancersRes.data || []);
        setPendingBusinesses(businessesRes.data || []);
      } catch (error) {
        console.error('Error fetching verifications:', error);
        setError(error.message || 'Failed to fetch verifications');
        toast.error('Failed to load verifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerifications();
  }, []);

  const verifyFreelancer = async (id, data) => {
    try {
      await adminAPI.verifyFreelancer(id, data);
      setPendingFreelancers(prev => prev.filter(f => f.id !== id));
      toast.success('Freelancer verification updated');
    } catch (error) {
      console.error('Error verifying freelancer:', error);
      toast.error('Failed to verify freelancer');
    }
  };

  const verifyBusiness = async (id, data) => {
    try {
      await adminAPI.verifyBusiness(id, data);
      setPendingBusinesses(prev => prev.filter(b => b.id !== id));
      toast.success('Business verification updated');
    } catch (error) {
      console.error('Error verifying business:', error);
      toast.error('Failed to verify business');
    }
  };

  return {
    pendingFreelancers,
    pendingBusinesses,
    isLoading,
    error,
    verifyFreelancer,
    verifyBusiness
  };
};
