import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const SearchFilters = ({
  filters = [],
  onFilterChange,
  onSearch,
  searchPlaceholder = 'Search...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Handle search input
  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    const newFilters = {
      ...activeFilters,
      [filterKey]: value
    };
    
    // Remove empty filters
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key] || newFilters[key] === '') {
        delete newFilters[key];
      }
    });
    
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    onFilterChange?.({});
    onSearch?.('');
  };

  // Count active filters
  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
            <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <div key={filter.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {filter.label}
                    </label>
                    
                    {filter.type === 'select' && (
                      <select
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All {filter.label}</option>
                        {filter.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {filter.type === 'date' && (
                      <input
                        type="date"
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                    
                    {filter.type === 'dateRange' && (
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          placeholder="From"
                          value={activeFilters[`${filter.key}_from`] || ''}
                          onChange={(e) => handleFilterChange(`${filter.key}_from`, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="date"
                          placeholder="To"
                          value={activeFilters[`${filter.key}_to`] || ''}
                          onChange={(e) => handleFilterChange(`${filter.key}_to`, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                    
                    {filter.type === 'text' && (
                      <input
                        type="text"
                        placeholder={filter.placeholder || `Filter by ${filter.label}`}
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <FiX className="w-4 h-4" />
                  <span>Clear all filters</span>
                </button>
                
                <div className="text-sm text-gray-500">
                  {activeFilterCount > 0 && `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="p-4 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => {
              const filter = filters.find(f => f.key === key);
              if (!filter) return null;
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  <span>{filter.label}: {value}</span>
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="hover:text-blue-600"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
