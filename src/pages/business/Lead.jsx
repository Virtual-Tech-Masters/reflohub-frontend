import React, { useState } from 'react';
import { FiSearch, FiFilter, FiMessageSquare, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useBusinessLeads } from '../../hooks/useBusinessLeads';

const Lead = () => {
  const { leads, loading, error, refreshLeads, updateLeadStatus, updateLeadPaymentStatus, deleteLead, getLeadStats } = useBusinessLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    freelancer: 'all',
    priority: 'all',
    country: 'all',
    province: 'all',
    state: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const statusColors = {
    new: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
    accepted: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
    rejected: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
    qualified: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
  };

  const paymentStatusColors = {
    done: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
  };

  const priorityColors = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500'
  };

  const stats = getLeadStats();

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.services.some(service => 
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = filters.status === 'all' || lead.status === filters.status;
    const matchesPaymentStatus = filters.paymentStatus === 'all' || lead.paymentStatus === filters.paymentStatus;
    const matchesFreelancer = filters.freelancer === 'all' || lead.freelancer.name === filters.freelancer;
    const matchesPriority = filters.priority === 'all' || lead.priority === filters.priority;
    const matchesCountry = filters.country === 'all' || lead.location.country === filters.country;
    const matchesProvince = filters.province === 'all' || lead.location.province === filters.province;
    const matchesState = filters.state === 'all' || lead.location.state === filters.state;
    
    const leadDate = new Date(lead.createdAt);
    const matchesDateFrom = !filters.dateFrom || leadDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || leadDate <= new Date(filters.dateTo);

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesFreelancer && 
           matchesPriority && matchesCountry && matchesProvince && matchesState && 
           matchesDateFrom && matchesDateTo;
  });

  const freelancers = ['all', ...new Set(leads.map(lead => lead.freelancer.name))];
  const countries = ['all', ...new Set(leads.map(lead => lead.location.country))];
  const provinces = ['all', ...new Set(leads.map(lead => lead.location.province))];
  const states = ['all', ...new Set(leads.map(lead => lead.location.state))];

  const resetFilters = () => {
    setFilters({
      status: 'all',
      paymentStatus: 'all',
      freelancer: 'all',
      priority: 'all',
      country: 'all',
      province: 'all',
      state: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
  };

  const handleFreelancerClick = (freelancerId) => {
    window.location.href = `/business/freelancers/${freelancerId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load leads</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">There was an error loading your leads.</p>
          <button
            onClick={refreshLeads}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lead Management</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Leads</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.today}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Leads</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.week}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Leads</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.month}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Quarterly Leads</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.quarter}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid to Freelancers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">${stats.totalPaid.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search leads by company, freelancer, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Reset Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="qualified">Qualified</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="done">Done</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Freelancer</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                    value={filters.freelancer}
                    onChange={(e) => setFilters({...filters, freelancer: e.target.value})}
                  >
                    {freelancers.map(freelancer => (
                      <option key={freelancer} value={freelancer}>
                        {freelancer === 'all' ? 'All Freelancers' : freelancer}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                    value={filters.country}
                    onChange={(e) => setFilters({...filters, country: e.target.value})}
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>
                        {country === 'all' ? 'All Countries' : country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                    value={filters.province}
                    onChange={(e) => setFilters({...filters, province: e.target.value})}
                  >
                    {provinces.map(province => (
                      <option key={province} value={province}>
                        {province === 'all' ? 'All Provinces' : province}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                    value={filters.state}
                    onChange={(e) => setFilters({...filters, state: e.target.value})}
                  >
                    {states.map(state => (
                      <option key={state} value={state}>
                        {state === 'all' ? 'All States' : state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date From</label>
                  <input
                    type="date"
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date To</label>
                  <input
                    type="date"
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Freelancer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Services
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/business/leads/${lead.id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">${lead.value.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[lead.status]}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[lead.paymentStatus]}`}>
                        {lead.paymentStatus.charAt(0).toUpperCase() + lead.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white cursor-pointer" onClick={() => handleFreelancerClick(lead.freelancer.id)}>{lead.freelancer.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{lead.freelancer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{lead.location.city}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{lead.location.state}, {lead.location.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {lead.services.slice(0, 2).map((service, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded">
                            {service}
                          </span>
                        ))}
                        {lead.services.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded">
                            +{lead.services.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                        <FiMessageSquare />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    <div className="text-gray-500 dark:text-gray-400 py-8">
                      No leads found matching your criteria
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Lead;