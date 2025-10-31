import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUser, FiMapPin, FiDollarSign, FiBriefcase, FiClock, FiTrendingUp, FiMail, FiPhone } from 'react-icons/fi';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import PageTitle from '../../components/common/PageTitle';

// Dummy data for freelancer details and lead history
const freelancerData = {
  1: {
    id: 1,
    name: 'Alex Carter',
    title: 'Lead Generation Specialist',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: 'New York, NY',
    industries: ['Real Estate', 'Tech', 'Healthcare'],
    commissionRate: '15%',
    rating: 4.7,
    totalLeads: 142,
    conversionRate: '32%',
    avgCommission: '$85',
    skills: ['Cold Calling', 'Market Research', 'CRM Management'],
    availability: ['Mon-Fri 9am-5pm EST', 'Sat 10am-2pm EST'],
    preferredBusinessTypes: ['Startups', 'SMBs', 'Enterprise'],
    bio: 'Specialized in generating high-quality leads across multiple industries with a focus on personalized outreach and targeted marketing strategies.',
    contact: {
      email: 'alex.carter@example.com',
      phone: '(555) 123-4567'
    },
    leadHistory: [
      {
        id: 101,
        date: '2023-06-15',
        business: 'TechCorp Solutions',
        industry: 'SaaS',
        status: 'Converted',
        value: '$2,400',
        commission: '$360'
      },
      {
        id: 102,
        date: '2023-06-10',
        business: 'Urban Living Realty',
        industry: 'Real Estate',
        status: 'Pending',
        value: '$5,000',
        commission: '$750'
      },
      {
        id: 103,
        date: '2023-05-28',
        business: 'HealthPlus Clinic',
        industry: 'Healthcare',
        status: 'Converted',
        value: '$1,800',
        commission: '$270'
      }
    ]
  },
  // ... similar data for other freelancers
};

const FreelancerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setFreelancer(freelancerData[id]);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Freelancer not found</h3>
        <button
          onClick={() => navigate('/freelancers')}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/freelancers')}
        className="mb-6 flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
      >
        ← Back to all providers
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-start mb-4 md:mb-0">
              <img
                src={freelancer.avatar}
                alt={freelancer.name}
                className="w-20 h-20 rounded-full mr-4"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{freelancer.name}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">{freelancer.title}</p>
                <div className="flex items-center mt-1">
                  <div className="flex items-center">
                    {renderRatingStars(freelancer.rating)}
                  </div>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    {freelancer.rating.toFixed(1)} ({freelancer.totalLeads} leads generated)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center justify-center">
                <FiMail className="mr-2" /> Contact
              </button>
              <button className="px-4 py-2 bg-success-500 hover:bg-success-600 text-white rounded-lg transition-colors flex items-center justify-center">
                <FiPhone className="mr-2" /> Request Call
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'leads' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              Lead History
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'availability' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
            >
              Availability
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">About</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{freelancer.bio}</p>
                
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Industries</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {freelancer.industries.map((industry, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {industry}
                    </span>
                  ))}
                </div>

                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferred Business Types</h3>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">
                  {freelancer.preferredBusinessTypes.map((type, index) => (
                    <li key={index}>{type}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{freelancer.totalLeads}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{freelancer.conversionRate}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Commission</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{freelancer.avgCommission}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Commission Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{freelancer.commissionRate}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FiMail className="text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">{freelancer.contact.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FiPhone className="text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">{freelancer.contact.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <FiMapPin className="text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">{freelancer.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Lead History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Business</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {freelancer.leadHistory.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{lead.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{lead.business}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {lead.industry}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lead.status === 'Converted' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{lead.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{lead.commission}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Availability Schedule</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freelancer.availability.map((slot, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow flex items-center">
                      <FiClock className="text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">{slot}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-4">Time Zone</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                All times shown in {freelancer.location.split(', ')[1]} time zone
              </p>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferred Contact Times</h3>
              <p className="text-gray-600 dark:text-gray-300">
                This provider prefers to be contacted during their available hours for the fastest response.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDetails;