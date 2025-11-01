import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiEdit2, FiRefreshCw,
  FiUpload, FiEye, FiX, FiFileText, FiCamera, FiCreditCard, FiBook
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import PageTitle from '../../components/common/PageTitle';
import { freelancerAPI, mediaAPI } from '../../utils/api';
import { getErrorMessage, escapeHtml } from '../../utils/helpers';

const FreelancerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    isStudent: false
  });
  
  // Media upload state
  const [uploading, setUploading] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({
    profilePicture: null,
    idProof: null,
    selfie: null,
    studentId: null
  });
  const [existingMedia, setExistingMedia] = useState({
    profilePicture: null,
    idProof: null,
    selfie: null,
    studentId: null
  });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null, type: null });
  const [mediaLoading, setMediaLoading] = useState(true);

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
    loadExistingMedia();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await freelancerAPI.getProfile();
      const profileData = response.data;
      
      setProfile(profileData);
      setFormData({
        fullName: profileData.fullName || '',
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || '',
        gender: profileData.gender || '',
        isStudent: profileData.isStudent || false
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loadExistingMedia = async () => {
    try {
      setMediaLoading(true);
      const mediaTypes = ['profilePicture', 'idProof', 'selfie', 'studentId'];
      const mediaPromises = mediaTypes.map(async (type) => {
        try {
          const response = await mediaAPI.fetchMedia(type);
          if (response && response.data) {
            return { type, data: response.data };
          }
          return { type, data: null };
        } catch (error) {
          if (error.response?.status === 404 || error.response?.status === 400) {
            // No existing media found - this is normal for new users
            return { type, data: null };
          }
          // Non-critical error, return null
          return { type, data: null };
        }
      });

      const results = await Promise.all(mediaPromises);
      const mediaData = {};
      results.forEach(({ type, data }) => {
        mediaData[type] = data;
      });
      setExistingMedia(mediaData);
    } catch (error) {
      console.error('Failed to load existing media:', error);
      setExistingMedia({
        profilePicture: null,
        idProof: null,
        selfie: null,
        studentId: null
      });
    } finally {
      setMediaLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await freelancerAPI.updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
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
        loadExistingMedia();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(prev => ({ ...prev, [mediaType]: false }));
    }
  };

  const removeFile = (mediaType) => {
    setUploadedFiles(prev => ({ ...prev, [mediaType]: null }));
    toast.success('File removed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Freelancer Profile - RefloHub</title>
        <meta name="description" content="Complete your freelancer profile" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle
            title={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile?.fullName || 'Freelancer Profile'}
                  </span>
                </div>
              </div>
            }
            subtitle={profile?.fullName ? `Manage your ${profile.fullName} profile` : "Complete your freelancer profile"}
            actions={
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
                >
                  <FiEdit2 /> {isEditing ? 'Cancel' : 'Edit Profile'}
                </motion.button>
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-2xl hover:shadow-blue-500/25"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiSave />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                )}
              </div>
            }
          />

          {/* Profile Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-1">
              {/* Basic Information */}
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      placeholder="Email (from registration)"
                    />
                    <p className="text-xs text-gray-500 mt-1">This field cannot be changed after registration</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isStudent"
                      checked={formData.isStudent}
                      onChange={(e) => setFormData({ ...formData, isStudent: e.target.checked })}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isStudent" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      I am a student
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Active</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile?.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {profile?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Freelancer Documents</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Upload required documents</p>
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
              {/* Profile Picture Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Picture
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profilePicture')}
                    disabled={uploading.profilePicture}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className={`cursor-pointer ${uploading.profilePicture ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {uploading.profilePicture ? (
                        <FiRefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      ) : (
                        <FiCamera className="w-8 h-8 text-gray-400" />
                      )}
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {uploading.profilePicture ? 'Uploading...' : 'Upload Profile Picture'}
                      </p>
                    </div>
                  </label>
                </div>
                {/* Show existing file or newly uploaded file */}
                {(existingMedia.profilePicture || uploadedFiles.profilePicture) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <FiCamera className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {escapeHtml(existingMedia.profilePicture?.name || uploadedFiles.profilePicture?.name || 'Profile picture uploaded')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {existingMedia.profilePicture ? '(Existing)' : '(New)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const file = existingMedia.profilePicture || uploadedFiles.profilePicture;
                            if (file) {
                              setPreviewModal({ 
                                isOpen: true, 
                                file: {
                                  name: file.name || 'Profile Picture',
                                  url: file.url || file.path || file
                                }, 
                                type: 'Profile Picture' 
                              });
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Preview"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {uploadedFiles.profilePicture && (
                          <button
                            onClick={() => removeFile('profilePicture')}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <FiX className="w-4 h-4" />
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
                        <FiCreditCard className="w-8 h-8 text-gray-400" />
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
                        <FiCreditCard className="w-4 h-4 text-blue-500" />
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
                            const file = existingMedia.idProof || uploadedFiles.idProof;
                            if (file) {
                              setPreviewModal({ 
                                isOpen: true, 
                                file: {
                                  name: file.name || 'ID Proof',
                                  url: file.url || file.path || file
                                }, 
                                type: 'ID Proof' 
                              });
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Preview"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {uploadedFiles.idProof && (
                          <button
                            onClick={() => removeFile('idProof')}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <FiX className="w-4 h-4" />
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
                        <FiCamera className="w-8 h-8 text-gray-400" />
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
                        <FiCamera className="w-4 h-4 text-blue-500" />
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
                            const file = existingMedia.selfie || uploadedFiles.selfie;
                            if (file) {
                              setPreviewModal({ 
                                isOpen: true, 
                                file: {
                                  name: file.name || 'Selfie',
                                  url: file.url || file.path || file
                                }, 
                                type: 'Selfie' 
                              });
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Preview"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {uploadedFiles.selfie && (
                          <button
                            onClick={() => removeFile('selfie')}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Student ID (only if isStudent is true) */}
              {profile?.isStudent && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Student ID
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'studentId')}
                      disabled={uploading.studentId}
                      className="hidden"
                      id="studentid-upload"
                    />
                    <label
                      htmlFor="studentid-upload"
                      className={`cursor-pointer ${uploading.studentId ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {uploading.studentId ? (
                          <FiRefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        ) : (
                          <FiBook className="w-8 h-8 text-gray-400" />
                        )}
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {uploading.studentId ? 'Uploading...' : 'Upload Student ID'}
                        </p>
                      </div>
                    </label>
                  </div>
                  {/* Show existing file or newly uploaded file */}
                  {(existingMedia.studentId || uploadedFiles.studentId) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center gap-2">
                          <FiBook className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {existingMedia.studentId?.name || uploadedFiles.studentId?.name || 'Student ID uploaded'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {existingMedia.studentId ? '(Existing)' : '(New)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const file = existingMedia.studentId || uploadedFiles.studentId;
                              if (file) {
                                setPreviewModal({ 
                                  isOpen: true, 
                                  file: {
                                    name: file.name || 'Student ID',
                                    url: file.url || file.path || file
                                  }, 
                                  type: 'Student ID' 
                                });
                              }
                            }}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Preview"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          {uploadedFiles.studentId && (
                            <button
                              onClick={() => removeFile('studentId')}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                onClick={() => setPreviewModal({ isOpen: false, file: null, type: null })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-4">
              {previewModal.file ? (
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="mb-4">
                      <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {previewModal.file.name || 'File'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {previewModal.type}
                      </p>
                    </div>
                    
                    {previewModal.file.url && (
                      <div className="space-y-2">
                        <a
                          href={previewModal.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                          Open File
                        </a>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Click to open in new tab
                        </p>
                      </div>
                    )}
                    
                    {!previewModal.file.url && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        File URL not available
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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

export default FreelancerProfile;