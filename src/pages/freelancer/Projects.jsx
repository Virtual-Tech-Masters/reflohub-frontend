import React, { useState } from 'react';
import { FiSearch, FiFilter, FiList, FiMapPin, FiCalendar, FiUser, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Dummy data for leads
const dummyLeads = [
  {
    id: 1,
    leadName: 'Acme Corp',
    businessName: 'TechSolutions Inc.',
    leadType: 'virtual',
    status: 'pending',
    submittedAt: '2024-06-01',
    country: 'USA',
    category: 'Tech',
    province: 'California',
    commission: 200,
  },
  {
    id: 2,
    leadName: 'Beta LLC',
    businessName: 'DesignHub Studio',
    leadType: 'physical',
    status: 'accepted',
    submittedAt: '2024-06-02',
    country: 'USA',
    category: 'Real Estate',
    province: 'New York',
    commission: 300,
  },
  {
    id: 3,
    leadName: 'Gamma Inc',
    businessName: 'DataWise Analytics',
    leadType: 'virtual',
    status: 'rejected',
    submittedAt: '2024-06-03',
    country: 'Canada',
    category: 'Tech',
    province: 'Ontario',
    commission: 150,
  },
];

const categories = ['All', 'Tech', 'Real Estate'];
const countries = ['All', 'USA', 'Canada'];
const provinces = ['All', 'California', 'New York', 'Ontario'];

const Leads = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [country, setCountry] = useState('All');
  const [province, setProvince] = useState('All');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  // Filter logic
  const filteredLeads = dummyLeads.filter(lead => {
    return (
      (category === 'All' || lead.category === category) &&
      (country === 'All' || lead.country === country) &&
      (province === 'All' || lead.province === province) &&
      (!date || lead.submittedAt === date) &&
      (
        lead.leadName.toLowerCase().includes(search.toLowerCase()) ||
        lead.businessName.toLowerCase().includes(search.toLowerCase())
      )
    );
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FiList /> Leads</h2>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Category</label>
          <select className="border rounded p-2" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Country</label>
          <select className="border rounded p-2" value={country} onChange={e => setCountry(e.target.value)}>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Province/State</label>
          <select className="border rounded p-2" value={province} onChange={e => setProvince(e.target.value)}>
            {provinces.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Date</label>
          <input type="date" className="border rounded p-2" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">Search</label>
          <div className="flex items-center border rounded p-2">
            <FiSearch className="mr-2 text-gray-400" />
            <input
              type="text"
              className="flex-1 outline-none bg-transparent"
              placeholder="Search by lead or business name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Leads Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Province</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Commission</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">{lead.leadName}</td>
                <td className="px-6 py-4">{lead.businessName}</td>
                <td className="px-6 py-4">{lead.leadType}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    lead.status === 'pending' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300' :
                    lead.status === 'accepted' ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300' :
                    'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4">{lead.country}</td>
                <td className="px-6 py-4">{lead.category}</td>
                <td className="px-6 py-4">{lead.province}</td>
                <td className="px-6 py-4">{lead.submittedAt}</td>
                <td className="px-6 py-4">${lead.commission}</td>
                <td className="px-6 py-4">
                  <button className="text-primary-600 hover:underline" onClick={() => navigate(`/freelancer/lead-details/${lead.id}`)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Leads };
export default Leads;