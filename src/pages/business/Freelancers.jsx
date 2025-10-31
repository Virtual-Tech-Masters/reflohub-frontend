import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiStar, FiMapPin, FiDollarSign, FiFilter, FiSearch, FiBriefcase, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageTitle from '../../components/common/PageTitle';
import { useBusinessFreelancers } from '../../hooks/useBusinessFreelancers';
import { getErrorMessage } from '../../utils/helpers';

const Freelancers = () => {
  const { freelancers, loading, error, refreshFreelancers, getFreelancerStats } = useBusinessFreelancers();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const stats = getFreelancerStats();

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'topRated' && freelancer.rating >= 4.5) ||
      (filter === 'highConversion' && parseFloat(freelancer.conversionRate) >= 30);
    
    const matchesSearch = 
      freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills.some(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    return matchesFilter && matchesSearch;
  });

  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'leads':
        return b.totalLeads - a.totalLeads;
      case 'conversion':
        return parseFloat(b.conversionRate) - parseFloat(a.conversionRate);
      case 'commission':
        return parseFloat(b.avgCommission.replace('$', '')) - parseFloat(a.avgCommission.replace('$', ''));
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    const errorMessage = getErrorMessage(error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load freelancers</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
          <button
            onClick={refreshFreelancers}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Find Lead Providers - RefloHub</title>
        <meta name="description" content="Connect with professionals who can generate business leads for you" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle
            title="Find Lead Providers"
            subtitle="Connect with professionals who can generate business leads for you"
            actions={
              <button
                onClick={refreshFreelancers}
                className="btn-secondary flex items-center gap-2"
              >
                <FiRefreshCw /> Refresh
              </button>
            }
          />
      
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <FiUser className="text-primary-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FiStar className="text-green-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Rated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.topRated}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <FiTrendingUp className="text-yellow-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FiBriefcase className="text-blue-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newThisMonth}</p>
            </div>
          </div>
          </div>
          </div>
          
          {/* Filters and Search */}
          <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              All Providers
            </button>
            <button
              onClick={() => setFilter('topRated')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'topRated' ? 'bg-success-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              Top Rated
            </button>
            <button
              onClick={() => setFilter('highConversion')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'highConversion' ? 'bg-secondary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              High Conversion
            </button>
          </div>
          
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="rating">Sort by Rating</option>
              <option value="leads">Sort by Leads</option>
              <option value="conversion">Sort by Conversion</option>
              <option value="commission">Sort by Commission</option>
            </select>
          </div>
          </div>
          </div>

          {/* Freelancers List */}
      {sortedFreelancers.length === 0 ? (
        <div className="card text-center py-12">
          <FiUser className="mx-auto text-6xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || filter !== 'all' ? 'No freelancers found' : 'No freelancers available'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No freelancers are currently available. Check back later or contact support.'
            }
          </p>
          {(searchQuery || filter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedFreelancers.map((freelancer) => (
            <motion.div
              key={freelancer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/business/freelancers/${freelancer.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={freelancer.avatar}
                    alt={freelancer.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {freelancer.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {freelancer.title}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FiStar className="text-yellow-400 mr-1" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {freelancer.rating}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FiMapPin className="mr-2" />
                  {freelancer.location}
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FiDollarSign className="mr-2" />
                  {freelancer.commissionRate} commission
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FiBriefcase className="mr-2" />
                  {freelancer.totalLeads} leads generated
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {freelancer.conversionRate}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: freelancer.conversionRate }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {freelancer.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {freelancer.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                      +{freelancer.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/business/freelancers/${freelancer.id}`);
                  }}
                  className="flex-1 btn-primary text-sm"
                >
                  View Profile
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle message action
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Message
                </button>
              </div>
            </motion.div>
          ))}
          </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Freelancers;