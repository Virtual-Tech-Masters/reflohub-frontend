import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiClock, FiCheckCircle, FiXCircle, FiEye, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageTitle from '../../components/common/PageTitle';
import { adminAPI } from '../../utils/adminAPI';

const Freelancers = () => {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.searchFreelancers({ limit: 200 });
      setFreelancers(response.data?.items || []);
    } catch (err) {
      console.error('Error fetching freelancers:', err);
      setError(err.message || 'Failed to fetch freelancers');
      toast.error('Failed to load freelancers');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFreelancers = freelancers.filter(freelancer => {
    const search = searchTerm.toLowerCase();
    return (
      (freelancer.fullName || '').toLowerCase().includes(search) ||
      (freelancer.email || '').toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (freelancer) => {
    if (!freelancer.isVerified) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
          <FiClock className="inline mr-1" /> Pending
        </span>
      );
    }
    if (freelancer.isActive) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <FiCheckCircle className="inline mr-1" /> Verified
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
        <FiXCircle className="inline mr-1" /> Inactive
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading freelancers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Freelancers" subtitle="Manage and verify freelancer accounts" />

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search freelancers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Freelancers Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Freelancer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFreelancers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No freelancers found
                  </td>
                </tr>
              ) : (
                filteredFreelancers.map((freelancer) => (
                  <motion.tr
                    key={freelancer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-200 dark:bg-primary-900 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {freelancer.fullName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {freelancer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {freelancer.phone && (
                        <div className="text-sm text-gray-900 dark:text-white">
                          {freelancer.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {freelancer.createdAt ? new Date(freelancer.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(freelancer)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/dashboard/freelancers/${freelancer.id}`)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
                      >
                        <FiEye className="mr-1" size={16} />
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Freelancers;

