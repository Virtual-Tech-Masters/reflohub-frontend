import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiUsers, FiDollarSign, FiMapPin, FiGlobe, FiPhone, FiMail, FiEdit2, FiSave, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiUpload, FiImage, FiFile, FiEye, FiX } from 'react-icons/fi';
import { FaRegBuilding, FaRegChartBar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import PageTitle from '../../components/common/PageTitle';
import { businessAPI, mediaAPI } from '../../utils/api';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Media upload state
  const [uploading, setUploading] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({
    logo: null,
    idProof: null,
    businessDoc: null,
    selfie: null
  });
  const [existingMedia, setExistingMedia] = useState({
    logo: null,
    idProof: null,
    businessDoc: null,
    selfie: null
  });
  const [docUrls, setDocUrls] = useState({});
  const [docContentTypes, setDocContentTypes] = useState({});
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null, type: null, url: null, contentType: null });
  const [mediaLoading, setMediaLoading] = useState(true);

  // Initialize profile with only fields that backend actually returns
  const initializeProfile = () => ({
    // Fields that backend returns from /business/me endpoint
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    isActive: false,
    isVerified: false,
    hasVerifiedBadge: false,
    emailVerified: false,
    locationId: '',
    providerCustomerId: ''
  });

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await businessAPI.getProfile();
      const profileData = response.data;
      
      // Use backend data directly (no transformation needed)
      const transformedProfile = {
        ...initializeProfile(),
        id: profileData.id || '',
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        isActive: profileData.isActive || false,
        isVerified: profileData.isVerified || false,
        hasVerifiedBadge: profileData.hasVerifiedBadge || false,
        emailVerified: profileData.emailVerified || false,
        locationId: profileData.locationId || '',
        providerCustomerId: profileData.providerCustomerId || ''
      };
      
      setProfile(transformedProfile);
      setEditedProfile(transformedProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError(error);
      // Initialize with empty profile if API fails
      const emptyProfile = initializeProfile();
      setProfile(emptyProfile);
      setEditedProfile(emptyProfile);
    } finally {
      setIsLoading(false);
    }
  };
    
  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      loadExistingMedia();
    }
  }, [profile?.id]);

  const getContentTypeFromDocType = (docType) => {
    // idProof and businessDoc are usually PDFs, others are images
    if (docType === 'idProof' || docType === 'businessDoc') {
      return 'application/pdf';
    }
    return 'image/jpeg';
  };

  const loadExistingMedia = async () => {
    if (!profile?.id) {
      // Profile ID not available yet
      return;
    }
    
    try {
      setMediaLoading(true);
      const mediaTypes = ['logo', 'idProof', 'businessDoc', 'selfie'];
      const mediaPromises = mediaTypes.map(async (type) => {
        try {
          // Use the correct endpoint: /media/fetch/:userId?mediaType=...
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const token = localStorage.getItem('token');
          const response = await axios.get(`${baseURL}/media/fetch/${profile.id}`, {
            params: { mediaType: type },
            responseType: 'blob',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          
          // Get content type from response headers or infer from file extension
          const contentType = response.headers['content-type'] || getContentTypeFromDocType(type);
          
          // Ensure blob has correct type
          const blob = new Blob([response.data], { type: contentType });
          const url = URL.createObjectURL(blob);
          
          return { type, url, contentType, hasFile: true };
        } catch (error) {
          // Silently handle "not found" errors - this is expected for new users
          if (error.response?.status === 404 || error.response?.status === 400) {
            // No existing file found (this is normal for new users)
            return { type, url: null, contentType: null, hasFile: false };
          }
          // Log other errors but don't break the UI
          console.warn(`Error fetching ${type}:`, error.message);
          return { type, url: null, contentType: null, hasFile: false };
        }
      });

      const results = await Promise.all(mediaPromises);
      const mediaData = {};
      const urlMap = {};
      const contentTypeMap = {};
      
      results.forEach(({ type, url, contentType, hasFile }) => {
        if (hasFile) {
          mediaData[type] = { uploaded: true };
          urlMap[type] = url;
          if (contentType) contentTypeMap[type] = contentType;
        } else {
          mediaData[type] = null;
        }
      });
      
      setExistingMedia(mediaData);
      setDocUrls(urlMap);
      setDocContentTypes(contentTypeMap);
    } catch (error) {
      console.error('Failed to load existing media:', error);
      // Set empty media state to prevent UI issues
      setExistingMedia({
        logo: null,
        idProof: null,
        businessDoc: null,
        selfie: null
      });
      setDocUrls({});
      setDocContentTypes({});
    } finally {
      setMediaLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSubmitting(true);
      
      // No validation - all fields are optional
      // Transform frontend data to match backend schema (only fields backend accepts)
      const updateData = {
        name: editedProfile.name,
        phone: editedProfile.phone,
        address: editedProfile.address
      };
      
      await businessAPI.updateProfile(updateData);
      
      setProfile(editedProfile);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (event, mediaType) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [mediaType]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);

      const response = await mediaAPI.uploadMedia(formData);

      if (response.data) {
        setUploadedFiles(prev => ({
          ...prev,
          [mediaType]: {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: response.data.url || response.data.path,
            uploadedAt: new Date().toISOString()
          }
        }));
        toast.success(`${file.name} uploaded successfully!`);
        // Refresh existing media to show the newly uploaded file
        loadExistingMedia();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [mediaType]: false }));
    }
  };

  const removeFile = (mediaType) => {
    setUploadedFiles(prev => ({ ...prev, [mediaType]: null }));
    toast.success('File removed');
  };


  // const getProfileCompletionPercentage = () => {
  //   // Only count fields that backend actually supports
  //   const allFields = ['phone', 'address'];
  //   const completedFields = allFields.filter(field => {
  //     return editedProfile[field] && editedProfile[field].toString().trim() !== '';
  //   }).length;
    
  //   return Math.round((completedFields / allFields.length) * 100);
  // };

  const isProfileComplete = () => {
    // No required fields - always complete
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">There was an error loading your profile.</p>
          <button
            onClick={() => {
              loadProfile();
              loadExistingMedia();
            }}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // const completionPercentage = getProfileCompletionPercentage();
  // const profileComplete = isProfileComplete();

  return (
    <>
      <Helmet>
        <title>Business Profile - RefloHub</title>
        <meta name="description" content="Complete your business profile for testing" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle
            title={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile?.name || 'Business Profile'}
                  </span>
                  {profile?.hasVerifiedBadge && (
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full shadow-lg">
                      <FiCheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            }
            subtitle={profile?.name ? `Manage your ${profile.name} profile` : "Complete your business profile"}
            actions={
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditMode(!editMode)}
                  className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
                >
                  <FiEdit2 /> {editMode ? 'Cancel' : 'Edit Profile'}
                </motion.button>
                {editMode && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-2xl hover:shadow-blue-500/25"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiSave />
                    )}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                )}
          </div>
        }
      />

      {/* Profile Completion Status */}
      {/* <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Completion</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {completionPercentage}% complete
            </p>
          </div>
          <div className="flex items-center gap-2">
            {profileComplete ? (
              <div className="flex items-center text-green-600">
                <FiCheckCircle className="mr-1" />
                <span className="text-sm font-medium">Complete</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <FiAlertCircle className="mr-1" />
                <span className="text-sm font-medium">Incomplete</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        {!profileComplete && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <FiAlertCircle className="text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Please complete your profile
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Fill in all fields to complete your business profile.
                </p>
              </div>
            </div>
          </div>
        )}
      </div> */}

      {/* Profile Form - Only Schema Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-1">
          {/* Basic Information */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Information</h3>
            
            <div className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  Business Name
                      {editedProfile.hasVerifiedBadge && (
                        <div className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full shadow-sm">
                          <FiCheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                </label>
                    <div className="relative">
                <input
                  type="text"
                  value={editedProfile.name || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        placeholder="Enter your business name"
                      />
                      {editedProfile.hasVerifiedBadge && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full shadow-lg">
                            <FiCheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editedProfile.email || ''}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  placeholder="Business email (from registration)"
                />
                <p className="text-xs text-gray-500 mt-1">This field cannot be changed after registration</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editedProfile.phone || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <textarea
                  value={editedProfile.address || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                  disabled={!editMode}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  placeholder="Enter your business address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Business Status - Read Only */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              These status fields are automatically managed by the system and cannot be manually updated.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Business Active</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${editedProfile.isActive
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {editedProfile.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      Business Verified
                      {editedProfile.isVerified && (
                        <div className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                          <FiCheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${editedProfile.isVerified
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                      {editedProfile.isVerified ? (
                        <>
                          <FiCheckCircle className="w-3 h-3" />
                          Verified Badge
                        </>
                      ) : (
                        'Pending'
                      )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Verified Badge</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${editedProfile.hasVerifiedBadge
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                      {editedProfile.hasVerifiedBadge ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Setup Fee Paid</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${editedProfile.isSetupFeePaid
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {editedProfile.isSetupFeePaid ? 'Paid' : 'Paid'}
                </span>
              </div>
            </div>
          </div>


          {/* Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Verified
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Phone Verified</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${editedProfile.phoneVerified
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {editedProfile.phoneVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Business Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${editedProfile.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {editedProfile.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {/* <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tokens Available</span>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {editedProfile.tokensAvailable}
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

          {/* Media Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FiUpload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Documents</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Upload required business documents</p>
                </div>
              </div>
              {mediaLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Loading documents...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Business Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    disabled={uploading.logo}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`cursor-pointer ${uploading.logo ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {uploading.logo ? (
                        <FiRefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      ) : (
                        <FiImage className="w-8 h-8 text-gray-400" />
                      )}
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {uploading.logo ? 'Uploading...' : 'Upload Logo'}
                      </p>
                    </div>
                  </label>
                </div>
                {/* Show existing file or newly uploaded file */}
                {(existingMedia.logo || uploadedFiles.logo) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <FiImage className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {existingMedia.logo?.name || uploadedFiles.logo?.name || 'Logo uploaded'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {existingMedia.logo ? '(Existing)' : '(New)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (docUrls.logo) {
                              setPreviewModal({ 
                                isOpen: true, 
                                file: { name: 'Logo' },
                                url: docUrls.logo,
                                contentType: docContentTypes.logo || 'image/jpeg',
                                type: 'Logo' 
                              });
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Preview"
                          disabled={!docUrls.logo}
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {uploadedFiles.logo && (
                          <button
                            onClick={() => removeFile('logo')}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <FiAlertCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ID Proof Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ID Proof
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'idProof')}
                    disabled={uploading.idProof}
                    className="hidden"
                    id="idproof-upload"
                  />
                  <label
                    htmlFor="idproof-upload"
                    className={`cursor-pointer ${uploading.idProof ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {uploading.idProof ? (
                        <FiRefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      ) : (
                        <FiFile className="w-8 h-8 text-gray-400" />
                      )}
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {uploading.idProof ? 'Uploading...' : 'Upload ID Proof'}
                      </p>
                    </div>
                  </label>
                </div>
                {/* Show existing file or newly uploaded file */}
                {(existingMedia.idProof || uploadedFiles.idProof) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <FiFile className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {existingMedia.idProof?.name || uploadedFiles.idProof?.name || 'ID Proof uploaded'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {existingMedia.idProof ? '(Existing)' : '(New)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (docUrls.idProof) {
                              setPreviewModal({ 
                                isOpen: true, 
                                file: { name: 'ID Proof' },
                                url: docUrls.idProof,
                                contentType: docContentTypes.idProof || 'application/pdf',
                                type: 'ID Proof' 
                              });
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Preview"
                          disabled={!docUrls.idProof}
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {uploadedFiles.idProof && (
                          <button
                            onClick={() => removeFile('idProof')}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <FiAlertCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Document Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Business Document
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'businessDoc')}
                    disabled={uploading.businessDoc}
                    className="hidden"
                    id="businessdoc-upload"
                  />
                  <label
                    htmlFor="businessdoc-upload"
                    className={`cursor-pointer ${uploading.businessDoc ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {uploading.businessDoc ? (
                        <FiRefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      ) : (
                        <FiFile className="w-8 h-8 text-gray-400" />
                      )}
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {uploading.businessDoc ? 'Uploading...' : 'Upload Business Doc'}
                      </p>
                    </div>
                  </label>
                </div>
                {/* Show existing file or newly uploaded file */}
                {(existingMedia.businessDoc || uploadedFiles.businessDoc) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <FiFile className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {existingMedia.businessDoc?.name || uploadedFiles.businessDoc?.name || 'Business Document uploaded'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {existingMedia.businessDoc ? '(Existing)' : '(New)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (docUrls.businessDoc) {
                              setPreviewModal({ 
                                isOpen: true, 
                                file: { name: 'Business Document' },
                                url: docUrls.businessDoc,
                                contentType: docContentTypes.businessDoc || 'application/pdf',
                                type: 'Business Document' 
                              });
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Preview"
                          disabled={!docUrls.businessDoc}
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {uploadedFiles.businessDoc && (
                          <button
                            onClick={() => removeFile('businessDoc')}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <FiAlertCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selfie Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selfie
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'selfie')}
                    disabled={uploading.selfie}
                    className="hidden"
                    id="selfie-upload"
                  />
                  <label
                    htmlFor="selfie-upload"
                    className={`cursor-pointer ${uploading.selfie ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {uploading.selfie ? (
                        <FiRefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      ) : (
                        <FiImage className="w-8 h-8 text-gray-400" />
                      )}
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {uploading.selfie ? 'Uploading...' : 'Upload Selfie'}
                      </p>
                    </div>
                  </label>
                </div>
                {/* Show existing file or newly uploaded file */}
                {(existingMedia.selfie || uploadedFiles.selfie) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <FiImage className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {existingMedia.selfie?.name || uploadedFiles.selfie?.name || 'Selfie uploaded'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {existingMedia.selfie ? '(Existing)' : '(New)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (docUrls.selfie) {
                              setPreviewModal({ 
                                isOpen: true, 
                                file: { name: 'Selfie' },
                                url: docUrls.selfie,
                                contentType: docContentTypes.selfie || 'image/jpeg',
                                type: 'Selfie' 
                              });
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Preview"
                          disabled={!docUrls.selfie}
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {uploadedFiles.selfie && (
                          <button
                            onClick={() => removeFile('selfie')}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <FiAlertCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preview {previewModal.type}
              </h3>
              <button
                onClick={() => {
                  // Cleanup blob URLs when closing
                  if (previewModal.url) {
                    URL.revokeObjectURL(previewModal.url);
                  }
                  setPreviewModal({ isOpen: false, file: null, type: null, url: null, contentType: null });
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-4 max-h-[80vh] overflow-auto">
              {previewModal.url ? (
                <div className="flex justify-center items-center">
                  {previewModal.contentType?.includes('pdf') ? (
                    <div className="w-full h-[70vh] border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                      <embed
                        src={`${previewModal.url}#toolbar=0&navpanes=0&scrollbar=0`}
                        type="application/pdf"
                        className="w-full h-full"
                      />
                    </div>
                  ) : previewModal.contentType?.includes('image') ? (
                    <img
                      src={previewModal.url}
                      alt={previewModal.file?.name || previewModal.type}
                      className="max-w-full max-h-[70vh] object-contain rounded border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FiFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {previewModal.file?.name || previewModal.type}
                      </p>
                      <a
                        href={previewModal.url}
                        download
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No file data available for preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;