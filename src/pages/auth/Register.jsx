import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, 
  FiLock, 
  FiUser, 
  FiBriefcase, 
  FiMapPin, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight,
  FiCheck,
  FiGift,
  FiPhone,
  FiGlobe,
  FiCalendar,
  FiFileText,
  FiHome,
  FiZap,
  FiShield,
  FiTrendingUp,
  FiStar,
  FiAward
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authAPI, commonAPI, businessAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Removed test override; using real availability from backend

const Register = () => {
  const [activeTab, setActiveTab] = useState('freelancer');
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [businessCategories, setBusinessCategories] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState('');
  
  const { register } = useAuth();

  // Freelancer form data
  const [freelancerData, setFreelancerData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: '+1',
    bio: '',
    profilePictureUrl: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    idProofUrl: '',
    isStudent: false,
    studentIdProofUrl: '',
    location: {
      country: '',
      countryId: null,
      state: '',
      stateId: null,
      city: '',
      cityId: null
    },
    referralCodeUsed: '',
    acceptTerms: false
  });

  // Business form data
  const [businessData, setBusinessData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: '+1',
    address: '',
    bio: '',
    logoUrl: '',
    website: '',
    state: '',
    stateId: null,
    country: '',
    countryId: null,
    city: '',
    cityId: null,
    categoryId: '',
    acceptTerms: false
  });
  
  // Shared location state for both forms
  const [countries, setCountries] = useState([]);
  const [freelancerStates, setFreelancerStates] = useState([]);
  const [freelancerCities, setFreelancerCities] = useState([]);
  const [businessStates, setBusinessStates] = useState([]);
  const [businessCities, setBusinessCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingFreelancerStates, setLoadingFreelancerStates] = useState(false);
  const [loadingFreelancerCities, setLoadingFreelancerCities] = useState(false);
  const [loadingBusinessStates, setLoadingBusinessStates] = useState(false);
  const [loadingBusinessCities, setLoadingBusinessCities] = useState(false);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const response = await commonAPI.getCountries();
        const countriesData = response.data || [];
        setCountries(countriesData);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast.error('Failed to load countries');
        setCountries([]);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch states when freelancer country is selected
  useEffect(() => {
    if (!freelancerData.location.countryId) {
      setFreelancerStates([]);
      setFreelancerCities([]);
      return;
    }
    
    const fetchStates = async () => {
      try {
        setLoadingFreelancerStates(true);
        const response = await commonAPI.getStates(freelancerData.location.countryId);
        setFreelancerStates(response.data || []);
      } catch (error) {
        console.error('Error fetching states:', error);
        toast.error('Failed to load states');
        setFreelancerStates([]);
      } finally {
        setLoadingFreelancerStates(false);
      }
    };
    
    fetchStates();
  }, [freelancerData.location.countryId]);

  // Fetch cities when freelancer state is selected
  useEffect(() => {
    if (!freelancerData.location.stateId) {
      setFreelancerCities([]);
      return;
    }
    
    const fetchCities = async () => {
      try {
        setLoadingFreelancerCities(true);
        const response = await commonAPI.getCities(freelancerData.location.stateId);
        setFreelancerCities(response.data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast.error('Failed to load cities');
        setFreelancerCities([]);
      } finally {
        setLoadingFreelancerCities(false);
      }
    };
    
    fetchCities();
  }, [freelancerData.location.stateId]);

  // Fetch states when business country is selected
  useEffect(() => {
    if (!businessData.countryId) {
      setBusinessStates([]);
      setBusinessCities([]);
      return;
    }
    
    const fetchStates = async () => {
      try {
        setLoadingBusinessStates(true);
        const response = await commonAPI.getStates(businessData.countryId);
        setBusinessStates(response.data || []);
      } catch (error) {
        console.error('Error fetching states:', error);
        toast.error('Failed to load states');
        setBusinessStates([]);
      } finally {
        setLoadingBusinessStates(false);
      }
    };
    
    fetchStates();
  }, [businessData.countryId]);

  // Fetch cities when business state is selected
  useEffect(() => {
    if (!businessData.stateId) {
      setBusinessCities([]);
      return;
    }
    
    const fetchCities = async () => {
      try {
        setLoadingBusinessCities(true);
        const response = await commonAPI.getCities(businessData.stateId);
        setBusinessCities(response.data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast.error('Failed to load cities');
        setBusinessCities([]);
      } finally {
        setLoadingBusinessCities(false);
      }
    };
    
    fetchCities();
  }, [businessData.stateId]);

  const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
    { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
  ];

  const countryCodeOptions = [
    { value: '+1', label: '+1 (US/CA)', flag: '🇺🇸' },
    { value: '+44', label: '+44 (UK)', flag: '🇬🇧' },
    { value: '+91', label: '+91 (India)', flag: '🇮🇳' },
    { value: '+86', label: '+86 (China)', flag: '🇨🇳' },
    { value: '+49', label: '+49 (Germany)', flag: '🇩🇪' },
    { value: '+33', label: '+33 (France)', flag: '🇫🇷' },
    { value: '+81', label: '+81 (Japan)', flag: '🇯🇵' },
    { value: '+61', label: '+61 (Australia)', flag: '🇦🇺' },
    { value: '+55', label: '+55 (Brazil)', flag: '🇧🇷' },
    { value: '+7', label: '+7 (Russia)', flag: '🇷🇺' },
    { value: '+39', label: '+39 (Italy)', flag: '🇮🇹' },
    { value: '+34', label: '+34 (Spain)', flag: '🇪🇸' },
    { value: '+31', label: '+31 (Netherlands)', flag: '🇳🇱' },
    { value: '+46', label: '+46 (Sweden)', flag: '🇸🇪' },
    { value: '+47', label: '+47 (Norway)', flag: '🇳🇴' },
    { value: '+45', label: '+45 (Denmark)', flag: '🇩🇰' },
    { value: '+41', label: '+41 (Switzerland)', flag: '🇨🇭' },
    { value: '+43', label: '+43 (Austria)', flag: '🇦🇹' },
    { value: '+32', label: '+32 (Belgium)', flag: '🇧🇪' },
    { value: '+351', label: '+351 (Portugal)', flag: '🇵🇹' }
  ];

  // Fetch business categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await authAPI.getBusinessCategories();
        setBusinessCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching business categories:', error);
        toast.error('Failed to load business categories');
        setBusinessCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFreelancerInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFreelancerData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else if (name === 'fullName') {
      const fullName = value;
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFreelancerData(prev => ({
        ...prev,
        fullName,
        firstName,
        lastName,
        [name]: value
      }));
    } else {
      setFreelancerData(prev => {
        const updated = {
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        };
        
        // Real-time password match validation
        if (name === 'password' || name === 'confirmPassword') {
          if (updated.password && updated.confirmPassword) {
            if (updated.password !== updated.confirmPassword) {
              setPasswordMatchError('Passwords do not match');
            } else {
              setPasswordMatchError('');
            }
          }
        }
        
        return updated;
      });
    }
  };

  const handleBusinessInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBusinessData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Real-time password match validation
      if (name === 'password' || name === 'confirmPassword') {
        if (updated.password && updated.confirmPassword) {
          if (updated.password !== updated.confirmPassword) {
            setPasswordMatchError('Passwords do not match');
          } else {
            setPasswordMatchError('');
          }
        }
      }
      
      return updated;
    });
  };

  // Location handling functions
  const handleFreelancerCountryChange = (e) => {
    const selectedCountryId = Number(e.target.value);
    const selectedCountry = countries.find(c => c.id === selectedCountryId);
    
    setFreelancerData(prev => ({
      ...prev,
      location: {
        country: selectedCountry?.name || '',
        countryId: selectedCountryId || null,
        state: '',
        stateId: null,
        city: '',
        cityId: null
      }
    }));
  };

  const handleFreelancerStateChange = (e) => {
    const selectedStateId = Number(e.target.value);
    const selectedState = freelancerStates.find(s => s.id === selectedStateId);
    
    setFreelancerData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        state: selectedState?.name || '',
        stateId: selectedStateId || null,
        city: '',
        cityId: null
      }
    }));
  };

  const handleFreelancerCityChange = (e) => {
    const selectedCityId = Number(e.target.value);
    const selectedCity = freelancerCities.find(c => c.id === selectedCityId);
    
    setFreelancerData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        city: selectedCity?.name || '',
        cityId: selectedCityId || null
      }
    }));
  };

  const handleBusinessCountryChange = (e) => {
    const selectedCountryId = Number(e.target.value);
    const selectedCountry = countries.find(c => c.id === selectedCountryId);
    
    setBusinessData(prev => ({
      ...prev,
      country: selectedCountry?.name || '',
      countryId: selectedCountryId || null,
      state: '',
      stateId: null,
      city: '',
      cityId: null
    }));
  };

  const handleBusinessStateChange = (e) => {
    const selectedStateId = Number(e.target.value);
    const selectedState = businessStates.find(s => s.id === selectedStateId);
    
    setBusinessData(prev => ({
      ...prev,
      state: selectedState?.name || '',
      stateId: selectedStateId || null,
      city: '',
      cityId: null
    }));
  };

  const handleBusinessCityChange = (e) => {
    const selectedCityId = Number(e.target.value);
    const selectedCity = businessCities.find(c => c.id === selectedCityId);
    
    setBusinessData(prev => ({
      ...prev,
      city: selectedCity?.name || '',
      cityId: selectedCityId || null
    }));
  };

  const validateFreelancerForm = () => {
    if (!freelancerData.fullName || !freelancerData.email || !freelancerData.password || !freelancerData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    if (freelancerData.password !== freelancerData.confirmPassword) {
      toast.error('Passwords do not match');
      setPasswordMatchError('Passwords do not match');
      return false;
    } else {
      setPasswordMatchError('');
    }
    
    if (freelancerData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    
    // Validate country code format for freelancer
    if (freelancerData.countryCode && !freelancerData.countryCode.startsWith('+')) {
      toast.error('Country code must start with + (e.g., +91 for India)');
      return false;
    }
    
    if (!freelancerData.gender) {
      toast.error('Please select your gender');
      return false;
    }
    
    if (!freelancerData.location.country || !freelancerData.location.state || !freelancerData.location.city) {
      toast.error('Please provide complete location information');
      return false;
    }
    
    if (!freelancerData.acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return false;
    }
    
    return true;
  };

  const validateBusinessForm = () => {
    if (!businessData.name || !businessData.email || !businessData.password || !businessData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    if (businessData.password !== businessData.confirmPassword) {
      toast.error('Passwords do not match');
      setPasswordMatchError('Passwords do not match');
      return false;
    } else {
      setPasswordMatchError('');
    }
    
    if (businessData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    
    // Validate website URL format if provided
    if (businessData.website) {
      try {
        const url = new URL(businessData.website);
        if (!url.protocol.startsWith('http')) {
          toast.error('Website URL must start with http:// or https://');
          return false;
        }
      } catch (e) {
        toast.error('Please enter a valid website URL (e.g., https://example.com)');
        return false;
      }
    }
    
    if (!businessData.country || !businessData.state || !businessData.city) {
      toast.error('Please provide complete location information');
      return false;
    }
    
    if (!businessData.categoryId) {
      toast.error('Please select a business category');
      return false;
    }
    
    if (!businessData.acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return false;
    }
    
    if (businessData.countryCode && !businessData.countryCode.startsWith('+')) {
      toast.error('Country code must start with + (e.g., +91 for India)');
      return false;
    }
    
    return true;
  };

  // Region helper for business availability (simple mapping)
  const getRegionFromCountry = (countryName) => {
    return countryName?.toLowerCase() === 'india' ? 'INDIA' : 'GLOBAL';
  };

  const handleFreelancerRegister = async (e) => {
    e.preventDefault();
    
    if (!validateFreelancerForm()) return;
    
    setLoading(true);
    
    try {
      const registrationData = {
        firstName: freelancerData.firstName,
        lastName: freelancerData.lastName || null,
        fullName: freelancerData.fullName,
        email: freelancerData.email,
        password: freelancerData.password,
        phone: freelancerData.phone || null,
        countryCode: freelancerData.countryCode || null,
        bio: freelancerData.bio || null,
        profilePictureUrl: freelancerData.profilePictureUrl || null,
        dateOfBirth: freelancerData.dateOfBirth || null,
        gender: freelancerData.gender,
        address: freelancerData.address || null,
        idProofUrl: freelancerData.idProofUrl || null,
        isStudent: freelancerData.isStudent,
        studentIdProofUrl: freelancerData.studentIdProofUrl || null,
        country: freelancerData.location.country,
        state: freelancerData.location.state,
        city: freelancerData.location.city,
        referralCodeUsed: freelancerData.referralCodeUsed || null,
        acceptTerms: freelancerData.acceptTerms
      };
      
      const result = await register(registrationData, 'freelancer');
      
      if (!result) {
        // Error is already handled by AuthContext.register()
        // No need to show additional error message
      }
    } catch (error) {
      // Only show network errors or errors not handled by AuthContext
      if (!error.response) {
        if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
          toast.error('Unable to connect to server. Please check your internet connection and try again.');
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      }
      // AuthContext already handles API errors
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessRegister = async (e) => {
    e.preventDefault();
    
    if (!validateBusinessForm()) return;
    
    setLoading(true);
    
    try {
      // 1) Check slot availability before proceeding
      setCheckingAvailability(true);
      const region = getRegionFromCountry(businessData.country);
      const selectedCategory = businessCategories.find(c => Number(c.id) === Number(businessData.categoryId));
      const categoryName = selectedCategory?.categoryName;

      const availabilityRes = await businessAPI.checkAvailability({
        region,
        country: businessData.country,
        state: businessData.state,
        city: businessData.city,
        categoryName,
      });

      setCheckingAvailability(false);
      const { available, remaining } = availabilityRes.data || {};
      if (!available) {
        // Auto-join waitlist
        try {
          await businessAPI.joinWaitlist({
            name: businessData.name,
            email: businessData.email,
            region,
            country: businessData.country,
            state: businessData.state,
            city: businessData.city,
            categoryName,
            notes: '',
          });
          toast.info('No slots available right now. You have been added to the waitlist. We\'ll notify you when slots become available.');
        } catch (waitlistError) {
          toast.error('Failed to join waitlist. Please try again later.');
        }
        setLoading(false);
        return;
      }

      const registrationData = {
        name: businessData.name,
        email: businessData.email,
        password: businessData.password,
        phone: businessData.phone || null,
        countryCode: businessData.countryCode || null,
        address: businessData.address || null,
        state: businessData.state,
        country: businessData.country,
        city: businessData.city,
        bio: businessData.bio || null,
        logoUrl: businessData.logoUrl || null,
        website: businessData.website || null,
        categoryId: parseInt(businessData.categoryId),
        acceptTerms: businessData.acceptTerms
      };
      
      const result = await register(registrationData, 'business');
      
      if (!result) {
        // Error is already handled by AuthContext.register()
        // No need to show additional error message
      }
    } catch (error) {
      setCheckingAvailability(false);
      // Only show network errors or errors not handled by AuthContext
      if (!error.response) {
        if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
          toast.error('Unable to connect to server. Please check your internet connection and try again.');
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
      // AuthContext already handles other API errors
    } finally {
      setLoading(false);
      setCheckingAvailability(false);
    }
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-400 to-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-2">
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            {/* Glass Card */}
            <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-3 md:p-4">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center mb-4"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl mb-3 shadow-2xl"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FiZap className="w-6 h-6 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-1">
                  Join Our Platform
                </h1>
                <p className="text-blue-100/80 text-sm">
                  Choose your account type to get started
                </p>
              </motion.div>

              {/* Tab Navigation */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-4"
              >
                <button
                  onClick={() => setActiveTab('freelancer')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'freelancer'
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FiUser className="w-5 h-5 mr-3" />
                  Freelancer
                </button>
                <button
                  onClick={() => setActiveTab('business')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'business'
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FiBriefcase className="w-5 h-5 mr-3" />
                  Business
                </button>
              </motion.div>

              {/* Form Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'freelancer' ? (
                  <motion.form
                    key="freelancer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleFreelancerRegister}
                    className="space-y-3"
                  >
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-white/90">
                          Full Name *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiUser className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="fullName"
                            value={freelancerData.fullName}
                            onChange={handleFreelancerInputChange}
                            className="w-full pl-12 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-white/90">
                          Email Address *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiMail className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={freelancerData.email}
                            onChange={handleFreelancerInputChange}
                            className="w-full pl-12 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-white/90">
                          Password *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiLock className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={freelancerData.password}
                            onChange={handleFreelancerInputChange}
                            className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm ${
                              passwordMatchError ? 'border-red-400/50' : 'border-white/20'
                            }`}
                            placeholder="••••••••"
                            required
                            minLength={6}
                          />
                          {passwordMatchError && freelancerData.password && freelancerData.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">{passwordMatchError}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors bg-white/90 hover:bg-white rounded-r-2xl backdrop-blur-sm"
                          >
                            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-white/90">
                          Confirm Password *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiLock className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={freelancerData.confirmPassword}
                            onChange={handleFreelancerInputChange}
                            className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm ${
                              passwordMatchError ? 'border-red-400/50' : 'border-white/20'
                            }`}
                            placeholder="••••••••"
                            required
                          />
                          {passwordMatchError && freelancerData.password && freelancerData.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">{passwordMatchError}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors bg-white/90 hover:bg-white rounded-r-2xl backdrop-blur-sm"
                          >
                            {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Gender Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={freelancerData.gender}
                        onChange={handleFreelancerInputChange}
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-200 backdrop-blur-sm"
                        required
                      >
                        <option value="" className="bg-slate-800 text-white">Select Gender</option>
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-1 lg:col-span-2">
                        <label className="block text-sm font-semibold text-white/90">
                          Phone Number
                        </label>
                        <div className="flex space-x-3 w-full">
                          <div className="w-32">
                            <select
                              name="countryCode"
                              value={freelancerData.countryCode}
                              onChange={handleFreelancerInputChange}
                              className="w-full px-3 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15 text-white transition-all duration-200 backdrop-blur-sm"
                            >
                              {countryCodeOptions.map((option) => (
                                <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                                  {option.flag} {option.value}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <FiPhone className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={freelancerData.phone}
                              onChange={handleFreelancerInputChange}
                              className="w-full pl-12 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                              placeholder="(555) 123-4567"
                            />
                          </div>
                        </div>
                      </div>
                      
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={freelancerData.bio}
                        onChange={handleFreelancerInputChange}
                        rows={2}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                        placeholder="Tell us about yourself and your skills..."
                      />
                    </div>

                    {/* Location Information */}
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-white">Location Information *</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-white/90">
                            Country *
                          </label>
                          <select
                            value={freelancerData.location.countryId || ''}
                            onChange={handleFreelancerCountryChange}
                            disabled={loadingCountries}
                            className="w-full pl-4 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-200 backdrop-blur-sm"
                            required
                          >
                            <option value="" className="bg-slate-800 text-white">
                              {loadingCountries ? 'Loading countries...' : 'Select Country'}
                            </option>
                            {countries.map(country => (
                              <option key={country.id} value={country.id} className="bg-slate-800 text-white">{country.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-white/90">
                            State *
                          </label>
                          <select
                            value={freelancerData.location.stateId || ''}
                            onChange={handleFreelancerStateChange}
                            disabled={!freelancerData.location.countryId || loadingFreelancerStates || freelancerStates.length === 0}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-200 backdrop-blur-sm"
                            required
                          >
                            <option value="" className="bg-slate-800 text-white">
                              {!freelancerData.location.countryId ? 'Select country first' : loadingFreelancerStates ? 'Loading states...' : freelancerStates.length === 0 ? 'No states found' : 'Select State'}
                            </option>
                            {freelancerStates.map(state => (
                              <option key={state.id} value={state.id} className="bg-slate-800 text-white">{state.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-white/90">
                            City *
                          </label>
                          <select
                            value={freelancerData.location.cityId || ''}
                            onChange={handleFreelancerCityChange}
                            disabled={!freelancerData.location.stateId || loadingFreelancerCities || freelancerCities.length === 0}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-200 backdrop-blur-sm"
                            required
                          >
                            <option value="" className="bg-slate-800 text-white">
                              {!freelancerData.location.stateId ? 'Select state first' : loadingFreelancerCities ? 'Loading cities...' : freelancerCities.length === 0 ? 'No cities found' : 'Select City'}
                            </option>
                            {freelancerCities.map(city => (
                              <option key={city.id} value={city.id} className="bg-slate-800 text-white">{city.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Referral Code */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90">
                        Referral Code (Optional)
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiGift className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          name="referralCodeUsed"
                          value={freelancerData.referralCodeUsed}
                          onChange={handleFreelancerInputChange}
                          className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                          placeholder="Enter referral code if you have one"
                        />
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center">
                      <input
                        id="terms-freelancer"
                        name="acceptTerms"
                        type="checkbox"
                        checked={freelancerData.acceptTerms}
                        onChange={handleFreelancerInputChange}
                        className="h-4 w-4 text-blue-400 rounded border-white/30 focus:ring-blue-400 transition-colors bg-white/10"
                        required
                      />
                      <label htmlFor="terms-freelancer" className="ml-3 block text-sm text-white/80">
                        I agree to the{' '}
                        <a href="#" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl hover:shadow-blue-500/25"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      ) : (
                        <FiUser className="mr-3 w-5 h-5" />
                      )}
                      {loading ? 'Creating Account...' : 'Create Freelancer Account'}
                      {!loading && <FiArrowRight className="ml-2 w-4 h-4" />}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="business"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleBusinessRegister}
                    className="space-y-3"
                  >
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-white/90">
                          Business Name *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiHome className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={businessData.name}
                            onChange={handleBusinessInputChange}
                            className="w-full pl-12 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                            placeholder="Your Business Name"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-white/90">
                          Email Address *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiMail className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={businessData.email}
                            onChange={handleBusinessInputChange}
                            className="w-full pl-12 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                            placeholder="business@example.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-white/90">
                          Password *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiLock className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={businessData.password}
                            onChange={handleBusinessInputChange}
                            className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm ${
                              passwordMatchError ? 'border-red-400/50' : 'border-white/20'
                            }`}
                            placeholder="••••••••"
                            required
                            minLength={8}
                          />
                          {passwordMatchError && businessData.password && businessData.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">{passwordMatchError}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors bg-white/90 hover:bg-white rounded-r-2xl backdrop-blur-sm"
                          >
                            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-white/90">
                          Confirm Password *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiLock className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={businessData.confirmPassword}
                            onChange={handleBusinessInputChange}
                            className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm ${
                              passwordMatchError ? 'border-red-400/50' : 'border-white/20'
                            }`}
                            placeholder="••••••••"
                            required
                          />
                          {passwordMatchError && businessData.password && businessData.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">{passwordMatchError}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-700 hover:text-gray-900 transition-colors bg-white/90 hover:bg-white rounded-r-2xl backdrop-blur-sm"
                          >
                            {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Business Category */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90">
                        Business Category *
                      </label>
                      <select
                        name="categoryId"
                        value={businessData.categoryId}
                        onChange={handleBusinessInputChange}
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={categoriesLoading}
                        required
                      >
                        <option value="" className="bg-slate-800 text-white">
                          {categoriesLoading ? 'Loading categories...' : 'Select Business Category'}
                        </option>
                        {businessCategories.map((category) => (
                          <option key={category.id} value={category.id} className="bg-slate-800 text-white">
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-1 lg:col-span-2">
                        <label className="block text-sm font-semibold text-white/90">
                          Phone Number
                        </label>
                        <div className="flex space-x-3 w-full">
                          <div className="w-32">
                            <select
                              name="countryCode"
                              value={businessData.countryCode}
                              onChange={handleBusinessInputChange}
                              className="w-full px-3 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15 text-white transition-all duration-200 backdrop-blur-sm"
                            >
                              {countryCodeOptions.map((option) => (
                                <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                                  {option.flag} {option.value}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <FiPhone className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={businessData.phone}
                              onChange={handleBusinessInputChange}
                              className="w-full pl-12 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                              placeholder="(555) 123-4567"
                            />
                          </div>
                        </div>
                      </div>
                      
                    </div>

                    {/* Business Bio */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90">
                        Business Bio
                      </label>
                      <textarea
                        name="bio"
                        value={businessData.bio}
                        onChange={handleBusinessInputChange}
                        rows={2}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                        placeholder="Tell us about your business..."
                      />
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90">
                        Website URL
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiGlobe className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="url"
                          name="website"
                          value={businessData.website}
                          onChange={handleBusinessInputChange}
                          className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                          placeholder="https://yourbusiness.com"
                        />
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-white">Location Information *</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-white/90">
                            Country *
                          </label>
                          <select
                            name="country"
                            value={businessData.countryId || ''}
                            onChange={handleBusinessCountryChange}
                            disabled={loadingCountries}
                            className="w-full pl-4 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-200 backdrop-blur-sm"
                            required
                          >
                            <option value="" className="bg-slate-800 text-white">
                              {loadingCountries ? 'Loading countries...' : 'Select Country'}
                            </option>
                            {countries.map(country => (
                              <option key={country.id} value={country.id} className="bg-slate-800 text-white">{country.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-white/90">
                            State *
                          </label>
                          <select
                            name="state"
                            value={businessData.stateId || ''}
                            onChange={handleBusinessStateChange}
                            disabled={!businessData.countryId || loadingBusinessStates || businessStates.length === 0}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-200 backdrop-blur-sm"
                            required
                          >
                            <option value="" className="bg-slate-800 text-white">
                              {!businessData.countryId ? 'Select country first' : loadingBusinessStates ? 'Loading states...' : businessStates.length === 0 ? 'No states found' : 'Select State'}
                            </option>
                            {businessStates.map(state => (
                              <option key={state.id} value={state.id} className="bg-slate-800 text-white">{state.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-white/90">
                            City *
                          </label>
                          <select
                            name="city"
                            value={businessData.cityId || ''}
                            onChange={handleBusinessCityChange}
                            disabled={!businessData.stateId || loadingBusinessCities || businessCities.length === 0}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-200 backdrop-blur-sm"
                            required
                          >
                            <option value="" className="bg-slate-800 text-white">
                              {!businessData.stateId ? 'Select state first' : loadingBusinessCities ? 'Loading cities...' : businessCities.length === 0 ? 'No cities found' : 'Select City'}
                            </option>
                            {businessCities.map(city => (
                              <option key={city.id} value={city.id} className="bg-slate-800 text-white">{city.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center">
                      <input
                        id="acceptTerms"
                        name="acceptTerms"
                        type="checkbox"
                        checked={businessData.acceptTerms}
                        onChange={handleBusinessInputChange}
                        className="h-4 w-4 text-blue-400 rounded border-white/30 focus:ring-blue-400 transition-colors bg-white/10"
                        required
                      />
                      <label htmlFor="acceptTerms" className="ml-3 block text-sm text-white/80">
                        I agree to the{' '}
                        <a href="#" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || checkingAvailability}
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl hover:shadow-blue-500/25"
                    >
                      {(loading || checkingAvailability) ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      ) : (
                        <FiBriefcase className="mr-3 w-5 h-5" />
                      )}
                      {checkingAvailability ? 'Checking Availability...' : loading ? 'Creating Account...' : 'Create Business Account'}
                      {!loading && !checkingAvailability && <FiArrowRight className="ml-2 w-4 h-4" />}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
              
              {/* Footer */}
        <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-white/70">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="font-semibold text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </motion.div>
            </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;