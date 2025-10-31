import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiMapPin, FiRefreshCw, FiBriefcase, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useBusinesses } from '../../hooks/useBusinesses';
import { commonAPI } from '../../utils/api';
import PageTitle from '../../components/common/PageTitle';
import LeadSubmitModal from './LeadSubmitModal';

const Business = () => {
  // Location states
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Filter states
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Lead submission modal states
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Use the custom hook for data fetching
  const { 
    businesses, 
    loading, 
    error, 
    refreshBusinesses, 
    totalCount 
  } = useBusinesses();

  // Load business locations on component mount
  useEffect(() => {
    fetchBusinessLocations();
  }, []);

  // Fetch business locations and derive country list
  const fetchBusinessLocations = async () => {
    try {
      setLoadingCountries(true);
      const response = await commonAPI.getBusinessLocations();
      const locs = response.data || [];
      setLocations(locs);
      const uniqueCountries = [...new Set(locs.map(l => l.country).filter(Boolean))]
        .map(name => ({ id: name, name }));
      setCountries(uniqueCountries);
    } catch (error) {
      console.error('Error fetching business locations:', error);
      toast.error('Failed to load locations');
      setLocations([]);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Handle country change
  const handleCountryChange = (countryId, countryName) => {
    setSelectedCountry(countryName);
    setSelectedStates([]);
    setSelectedCities([]);
    setCities([]);
    // derive states from locations
    setLoadingStates(true);
    const statesInCountry = [...new Set(locations
      .filter(l => l.country === countryName)
      .map(l => l.state)
      .filter(Boolean))].map(name => ({ id: name, name }));
    setStates(statesInCountry);
    setLoadingStates(false);
  };

  // Handle state change
  const handleStateChange = (stateId, stateName) => {
    const newStates = selectedStates.includes(stateName) 
      ? selectedStates.filter(s => s !== stateName)
      : [...selectedStates, stateName].slice(0, 5); // Max 5 states
    
    setSelectedStates(newStates);
    setSelectedCities([]);
    setCities([]);
    if (newStates.length > 0) {
      setLoadingCities(true);
      const citiesForStates = [...new Set(locations
        .filter(l => l.country === selectedCountry && newStates.includes(l.state))
        .map(l => l.city)
        .filter(Boolean))].map(name => ({ id: name, name }));
      setCities(citiesForStates);
      setLoadingCities(false);
    }
  };

  // Handle city change
  const handleCityChange = (cityName) => {
    const newCities = selectedCities.includes(cityName)
      ? selectedCities.filter(c => c !== cityName)
      : [...selectedCities, cityName].slice(0, 25); // Max 25 cities
    
    setSelectedCities(newCities);
  };

  // Build query parameters
  const buildQueryParams = () => {
    const params = {
      page: currentPage,
      limit: 50
    };

    if (selectedCountry) params.country = selectedCountry;
    if (selectedStates.length > 0) params.state = selectedStates.join(',');
    if (selectedCities.length > 0) params.city = selectedCities.join(',');
    if (selectedCategories.length > 0) params.categoryIds = selectedCategories.join(',');
    if (searchTerm) params.q = searchTerm;

    return params;
  };

  // Fetch businesses with current filters
  const handleSearch = () => {
    const params = buildQueryParams();
    refreshBusinesses(params);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCountry('');
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedCategories([]);
    setSearchTerm('');
    setCurrentPage(1);
    setStates([]);
    setCities([]);
    refreshBusinesses({ page: 1, limit: 50 });
  };

  // Handle lead submission
  const handleSubmitLead = (business) => {
    setSelectedBusiness(business);
    setShowLeadModal(true);
  };

  // Handle lead submission success
  const handleLeadSubmitted = (leadData) => {
    toast.success('Lead submitted successfully!');
    setShowLeadModal(false);
    setSelectedBusiness(null);
  };


  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading businesses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load businesses</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">There was an error loading the businesses.</p>
          <button
            onClick={refreshBusinesses}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <PageTitle
          title="Businesses"
          subtitle="Find businesses to submit leads to"
        />
        <button
          onClick={refreshBusinesses}
          className="btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Location Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  const selected = countries.find(c => c.name === e.target.value);
                  if (selected) {
                    handleCountryChange(selected.id, selected.name);
                  }
                }}
                disabled={loadingCountries}
                className="input-field"
              >
                <option value="">
                  {loadingCountries ? 'Loading countries...' : 'Select Country'}
                </option>
                {countries.map((country) => (
                  <option key={country.id} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* States */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                States (Max 5)
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                {loadingStates ? (
                  <div className="text-sm text-gray-500">Loading states...</div>
                ) : states.length === 0 ? (
                  <div className="text-sm text-gray-500">Select country first</div>
                ) : (
                  states.map((state) => (
                    <label key={state.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedStates.includes(state.name)}
                        onChange={() => handleStateChange(state.id, state.name)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>{state.name}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedStates.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Selected: {selectedStates.join(', ')}
                </div>
              )}
            </div>

            {/* Cities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cities (Max 25)
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                {loadingCities ? (
                  <div className="text-sm text-gray-500">Loading cities...</div>
                ) : cities.length === 0 ? (
                  <div className="text-sm text-gray-500">Select state first</div>
                ) : (
                  cities.map((city) => (
                    <label key={city.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city.name)}
                        onChange={() => handleCityChange(city.name)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>{city.name}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedCities.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Selected: {selectedCities.slice(0, 3).join(', ')}
                  {selectedCities.length > 3 && ` +${selectedCities.length - 3} more`}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              <FiSearch />
              Search Businesses
            </button>
            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center gap-2"
            >
              <FiRefreshCw />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <FiBriefcase className="text-primary-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Businesses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount || businesses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FiMapPin className="text-green-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Locations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(businesses.map(b => `${b.location?.state || 'Unknown'}, ${b.location?.country || 'Unknown'}`)).size}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FiFilter className="text-blue-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(businesses.map(b => b.category?.name).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FiBriefcase className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No businesses found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {loading 
                ? "Loading businesses..." 
                : "Try adjusting your filters to see more businesses."
              }
            </p>
            {!loading && (
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          businesses.map((business) => (
            <motion.div
              key={business.id}
              className="card hover:shadow-lg transition-shadow duration-200"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {business.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {business.category?.name || 'General'}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FiMapPin className="mr-1" size={14} />
                    {business.location?.state || 'Unknown'}, {business.location?.country || 'Unknown'}
                  </div>
                </div>
                {business.hasVerifiedBadge && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
                  <span className="text-sm font-medium">{business.category?.name || 'General'}</span>
                </div>

                {business.website && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Website</span>
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Visit Site
                    </a>
                  </div>
                )}

                {business.bio && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="line-clamp-2">{business.bio}</p>
                  </div>
                )}
                
                {/* Submit Lead Button */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleSubmitLead(business)}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <FiPlus size={16} />
                    Submit Lead
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {/* Lead Submission Modal */}
      <LeadSubmitModal
        open={showLeadModal}
        onClose={() => {
          setShowLeadModal(false);
          setSelectedBusiness(null);
        }}
        onSubmit={handleLeadSubmitted}
        businesses={businesses}
        selectedBusiness={selectedBusiness}
        creditBalance={10} // TODO: Get actual credit balance from user data
      />
    </div>
  );
};

export default Business;