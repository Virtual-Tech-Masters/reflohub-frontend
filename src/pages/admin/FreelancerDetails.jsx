import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiX, FiDownload, FiUser, FiClock, FiCheckCircle, FiXCircle, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageTitle from '../../components/common/PageTitle';
import { adminAPI } from '../../utils/adminAPI';

const FreelancerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docUrls, setDocUrls] = useState({});
  const [docContentTypes, setDocContentTypes] = useState({});
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchFreelancer();
    fetchDocuments();
  }, [id]);

  const fetchFreelancer = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getFreelancer(id);
      setFreelancer(response.data);
    } catch (err) {
      console.error('Error fetching freelancer:', err);
      toast.error('Failed to load freelancer details');
      navigate('/admin/dashboard/freelancers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const docTypes = ['profilePicture', 'idProof', 'selfie', 'studentId'];
      const docPromises = docTypes.map(async (docType) => {
        try {
          const response = await adminAPI.fetchMedia(id, docType);
          // Get content type from response headers or infer from file extension
          const contentType = response.headers['content-type'] || getContentTypeFromDocType(docType);
          
          // Ensure blob has correct type - always create new blob with explicit type
          const blob = new Blob([response.data], { type: contentType });
          const url = URL.createObjectURL(blob);
          return { docType, url, contentType };
        } catch (error) {
          return { docType, url: null };
        }
      });

      const results = await Promise.all(docPromises);
      const urlMap = {};
      const contentTypeMap = {};
      results.forEach(({ docType, url, contentType }) => {
        if (url) {
          urlMap[docType] = url;
          if (contentType) contentTypeMap[docType] = contentType;
        }
      });
      setDocUrls(urlMap);
      setDocContentTypes(contentTypeMap);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleVerify = async (isVerified) => {
    try {
      await adminAPI.verifyFreelancer(id, {
        isVerified,
        verificationNotes: verificationNotes || undefined
      });
      toast.success(isVerified ? 'Freelancer verified successfully' : 'Freelancer rejected');
      navigate('/admin/dashboard/freelancers');
    } catch (error) {
      console.error('Error verifying freelancer:', error);
      toast.error('Failed to verify freelancer');
    }
  };

  const getContentTypeFromDocType = (docType) => {
    // idProof and studentId are usually PDFs, others are images
    if (docType === 'idProof' || docType === 'studentId' || docType === 'businessDoc') {
      return 'application/pdf';
    }
    return 'image/jpeg'; // Default to JPEG for images
  };

  const getDocLabel = (docType) => {
    const labels = {
      profilePicture: 'Profile Picture',
      idProof: 'ID Proof',
      selfie: 'Selfie',
      studentId: 'Student ID'
    };
    return labels[docType] || docType;
  };

  const getStatusBadge = () => {
    if (!freelancer?.isVerified) {
      return (
        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
          <FiClock className="inline mr-1" /> Pending Verification
        </span>
      );
    }
    if (freelancer?.isActive) {
      return (
        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <FiCheckCircle className="inline mr-1" /> Verified & Active
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
        <FiXCircle className="inline mr-1" /> Inactive
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading freelancer details...</span>
      </div>
    );
  }

  if (!freelancer) {
    return null;
  }

  return (
    <div>
      <PageTitle
        title="Freelancer Details"
        subtitle={freelancer.fullName || 'Freelancer Information'}
        actions={
          <button
            onClick={() => navigate('/admin/dashboard/freelancers')}
            className="btn-secondary flex items-center"
          >
            <FiArrowLeft className="mr-2" />
            Back to Freelancers
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Freelancer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiUser className="mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="text-gray-900 dark:text-white font-medium">{freelancer.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-white font-medium flex items-center">
                  <FiMail className="mr-1" size={14} />
                  {freelancer.email || 'N/A'}
                </p>
              </div>
              {freelancer.phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-white font-medium flex items-center">
                    <FiPhone className="mr-1" size={14} />
                    {freelancer.phone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Registration Date</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {freelancer.createdAt ? new Date(freelancer.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                {getStatusBadge()}
              </div>
            </div>
          </motion.div>

          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h3>
            {loadingDocs ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading documents...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {['profilePicture', 'idProof', 'selfie', 'studentId'].map(docType => (
                  <div key={docType} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getDocLabel(docType)}
                      </span>
                      {docUrls[docType] && (
                        <button
                          onClick={async () => {
                            try {
                              const response = await adminAPI.fetchMedia(id, docType);
                              const contentType = response.headers['content-type'] || getContentTypeFromDocType(docType);
                              const blob = new Blob([response.data], { type: contentType });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `${getDocLabel(docType)}_${id}.${contentType.includes('pdf') ? 'pdf' : 'jpg'}`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            } catch (error) {
                              console.error('Download failed:', error);
                              toast.error('Failed to download document');
                            }
                          }}
                          className="text-primary-600 hover:text-primary-800"
                          title="Download"
                        >
                          <FiDownload size={16} />
                        </button>
                      )}
                    </div>
                    {docUrls[docType] ? (
                      <div className="mt-2">
                        {docType === 'idProof' || docType === 'studentId' ? (
                          docContentTypes[docType]?.includes('pdf') ? (
                            <div className="w-full h-96 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                              <embed
                                src={`${docUrls[docType]}#toolbar=0&navpanes=0&scrollbar=0`}
                                type="application/pdf"
                                className="w-full h-full"
                              />
                            </div>
                          ) : (
                            <img
                              src={docUrls[docType]}
                              alt={getDocLabel(docType)}
                              className="w-full h-48 object-cover rounded border border-gray-200 dark:border-gray-700"
                            />
                          )
                        ) : (
                          <img
                            src={docUrls[docType]}
                            alt={getDocLabel(docType)}
                            className="w-full h-48 object-cover rounded border border-gray-200 dark:border-gray-700"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Not uploaded</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Verification Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Notes:
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder="Add notes for verification..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleVerify(false)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
              >
                <FiX className="mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleVerify(true)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
              >
                <FiCheck className="mr-2" />
                Approve
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDetails;

