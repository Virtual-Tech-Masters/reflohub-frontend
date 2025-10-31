import React, { useState } from 'react';
import { FiBook, FiAward, FiClock, FiSearch, FiFilter, FiPlay, FiCheck, FiLock, FiBarChart, FiRefreshCw } from 'react-icons/fi';
import PageTitle from '../../components/common/PageTitle';

const Training = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    level: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Training categories (will be dynamic when admin adds them)
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'development', name: 'Development' },
    { id: 'design', name: 'Design' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'business', name: 'Business' },
    { id: 'soft-skills', name: 'Soft Skills' }
  ];

  // Filter trainings based on search and filters
  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = 
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (training.skills && training.skills.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesCategory = filters.category === 'all' || training.category === filters.category;
    const matchesStatus = 
      filters.status === 'all' || 
      (filters.status === 'completed' && training.completed) ||
      (filters.status === 'in-progress' && !training.completed && training.progress > 0) ||
      (filters.status === 'not-started' && training.progress === 0);
    const matchesLevel = filters.level === 'all' || training.level.toLowerCase() === filters.level;

    return matchesSearch && matchesCategory && matchesStatus && matchesLevel;
  });

  // Start/resume training
  const startTraining = (id) => {
    // In a real app, this would navigate to the training player
    console.log(`Starting training ${id}`);
  };

  // Calculate stats
  const completedCount = trainings.filter(t => t.completed).length;
  const inProgressCount = trainings.filter(t => !t.completed && t.progress > 0).length;
  const certificationCount = trainings.filter(t => t.certification && t.completed).length;

  // Refresh trainings (placeholder for future API call)
  const refreshTrainings = () => {
    setLoading(true);
    // TODO: Add API call to fetch trainings from admin
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <PageTitle
          title="Training Center"
          subtitle="Enhance your skills with professional training courses"
        />
        <button
          onClick={refreshTrainings}
          className="btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-500 mr-4">
              <FiBook className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trainings</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{trainings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 dark:bg-success-900/20 text-success-500 mr-4">
              <FiCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completedCount}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-100 dark:bg-accent-900/20 text-accent-500 mr-4">
              <FiAward className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Certifications</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{certificationCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search trainings by title, description, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <FiFilter />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="not-started">Not Started</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
              <select
                className="input-field"
                value={filters.level}
                onChange={(e) => setFilters({...filters, level: e.target.value})}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Trainings Grid */}
      {trainings.length === 0 ? (
        <div className="card text-center py-12">
          <FiBook className="mx-auto text-gray-400 text-6xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No training courses available</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Training courses will be added by administrators and will appear here when available.
          </p>
          <button
            onClick={refreshTrainings}
            className="btn-primary flex items-center gap-2 mx-auto"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Check for New Courses
          </button>
        </div>
      ) : filteredTrainings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.map(training => (
            <div key={training.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  training.completed 
                    ? 'bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200'
                    : training.progress > 0
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {training.completed ? 'Completed' : training.progress > 0 ? 'In Progress' : 'Not Started'}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {training.level}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{training.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{training.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <FiClock className="mr-1" />
                <span className="mr-4">{training.duration}</span>
                <FiBook className="mr-1" />
                <span>{training.modules} modules</span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{training.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      training.completed 
                        ? 'bg-success-500'
                        : training.progress > 0
                          ? 'bg-primary-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                    }`} 
                    style={{ width: `${training.progress}%` }}
                  ></div>
                </div>
              </div>
              
              {training.skills && training.skills.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Skills Covered:</div>
                  <div className="flex flex-wrap gap-2">
                    {training.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => startTraining(training.id)}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
                  training.completed
                    ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300 hover:bg-success-200 dark:hover:bg-success-800/30'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                } transition-colors`}
              >
                {training.completed ? (
                  <>
                    <FiCheck className="mr-2" />
                    View Certificate
                  </>
                ) : (
                  <>
                    <FiPlay className="mr-2" />
                    {training.progress > 0 ? 'Continue' : 'Start'} Training
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FiSearch className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No trainings found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({ category: 'all', status: 'all', level: 'all' });
            }}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Training;