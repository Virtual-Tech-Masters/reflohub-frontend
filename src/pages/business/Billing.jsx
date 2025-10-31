import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCreditCard, FiCalendar, FiDollarSign, FiCheckCircle, FiX, FiAlertTriangle,
  FiRefreshCw, FiDownload, FiSettings, FiShield, FiTrendingUp, FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import PageTitle from '../../components/common/PageTitle';
import { businessAPI } from '../../utils/api';
import { getErrorMessage, formatCurrency, formatDate } from '../../utils/helpers';

const Billing = () => {
  const [billingData, setBillingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState({ subscription: false, verifiedBadge: false });
  const [showCancelDialog, setShowCancelDialog] = useState({ subscription: false, verifiedBadge: false });

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await businessAPI.getBillingSummary();
      setBillingData(response.data || {});
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleCancelSubscription = async (atPeriodEnd = true) => {
    try {
      setCancelling(prev => ({ ...prev, subscription: true }));
      await businessAPI.cancelSubscription(atPeriodEnd);
      toast.success(atPeriodEnd ? 'Subscription will be cancelled at the end of the current period' : 'Subscription cancelled immediately');
      await loadBillingData(); // Refresh data
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setCancelling(prev => ({ ...prev, subscription: false }));
      setShowCancelDialog(prev => ({ ...prev, subscription: false }));
    }
  };

  const handleCancelVerifiedBadge = async (atPeriodEnd = true) => {
    try {
      setCancelling(prev => ({ ...prev, verifiedBadge: true }));
      await businessAPI.cancelVerifiedBadge(atPeriodEnd);
      toast.success(atPeriodEnd ? 'Verified badge will be cancelled at the end of the current period' : 'Verified badge cancelled immediately');
      await loadBillingData(); // Refresh data
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setCancelling(prev => ({ ...prev, verifiedBadge: false }));
      setShowCancelDialog(prev => ({ ...prev, verifiedBadge: false }));
    }
  };

  const confirmCancelSubscription = (atPeriodEnd = true) => {
    setShowCancelDialog(prev => ({ ...prev, subscription: true }));
  };

  const confirmCancelVerifiedBadge = (atPeriodEnd = true) => {
    setShowCancelDialog(prev => ({ ...prev, verifiedBadge: true }));
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    const errorMessage = getErrorMessage(error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to load billing data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
          <button
            onClick={loadBillingData}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const subscription = billingData?.subscription;
  const invoices = billingData?.invoices || [];
  const payments = billingData?.payments || [];

  return (
    <>
      <Helmet>
        <title>Billing - RefloHub</title>
        <meta name="description" content="Manage your subscription and billing information" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle
            title="Billing & Subscription"
            subtitle="Manage your subscription, payments, and billing information"
            actions={
              <button
                onClick={loadBillingData}
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
              >
                <FiRefreshCw /> Refresh
              </button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Subscription */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <FiCreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Subscription</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your active subscription details</p>
                    </div>
                  </div>
                  {subscription?.status === 'ACTIVE' && (
                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-3 py-1">
                      <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Active</span>
                    </div>
                  )}
                </div>

                {subscription ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiTrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {subscription.plan?.name || 'N/A'}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiDollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Cost</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {subscription.planVersion?.monthlyAmountCents ? formatCurrency(subscription.planVersion.monthlyAmountCents) : 'N/A'}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiCalendar className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Billing</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {subscription.nextCycleAt ? formatDate(subscription.nextCycleAt) : 'N/A'}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiShield className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified Badge</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {subscription.verifiedBadgeActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                      {subscription.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => confirmCancelSubscription(true)}
                            disabled={cancelling.subscription}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            {cancelling.subscription ? (
                              <FiRefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <FiX className="w-4 h-4" />
                            )}
                            Cancel Subscription
                          </button>

                          {subscription.verifiedBadgeActive && (
                            <button
                              onClick={() => confirmCancelVerifiedBadge(true)}
                              disabled={cancelling.verifiedBadge}
                              className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                              {cancelling.verifiedBadge ? (
                                <FiRefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiX className="w-4 h-4" />
                              )}
                              Cancel Verified Badge
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiAlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No active subscription found</p>
                  </div>
                )}
              </div>

              {/* Recent Invoices */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <FiDownload className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your latest billing statements</p>
                    </div>
                  </div>
                </div>

                {invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <FiCreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Invoice #{invoice.id || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {invoice.createdAt ? formatDate(invoice.createdAt) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {invoice.totalCents > 0 ? formatCurrency(invoice.totalCents) : 
                             invoice.subtotalCents > 0 ? formatCurrency(invoice.subtotalCents) : 
                             ''}
                          </p>
                          {invoice.discountCents > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                              -{formatCurrency(invoice.discountCents)} discount
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {invoice.billingReason || 'Subscription'}
                          </p>
                          <p className={`text-xs px-2 py-1 rounded-full ${
                            invoice.status === 'PAID' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : invoice.status === 'OPEN'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {invoice.status || 'Unknown'}
                          </p>
                        </div>
                        <a
                          href={`/business/billing/invoice/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"
                          title="View invoice details"
                        >
                          View
                        </a>
                      </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiCreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No invoices found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Payment History */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <FiClock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recent payment activity</p>
                  </div>
                </div>

                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.slice(0, 3).map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.description || 'Payment'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {payment.createdAt ? formatDate(payment.createdAt) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {payment.amountCents ? formatCurrency(payment.amountCents) : 'N/A'}
                          </p>
                          <p className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'SUCCEEDED' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {payment.status || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No payment history</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <FiSettings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your subscription</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={loadBillingData}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh Billing Data
                  </button>

                  {subscription?.status === 'ACTIVE' && (
                    <button
                      onClick={() => confirmCancelSubscription(false)}
                      disabled={cancelling.subscription}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {cancelling.subscription ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiX className="w-4 h-4" />
                      )}
                      Cancel Immediately
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialogs */}
        {showCancelDialog.subscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cancel Subscription</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to cancel your subscription? You will lose access to all premium features.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelDialog(prev => ({ ...prev, subscription: false }))}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={() => handleCancelSubscription(true)}
                  disabled={cancelling.subscription}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {cancelling.subscription ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiX className="w-4 h-4" />
                  )}
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        )}

        {showCancelDialog.verifiedBadge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <FiShield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cancel Verified Badge</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remove your verified status</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to cancel your verified badge? You will lose your verified status and associated benefits.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelDialog(prev => ({ ...prev, verifiedBadge: false }))}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Keep Badge
                </button>
                <button
                  onClick={() => handleCancelVerifiedBadge(true)}
                  disabled={cancelling.verifiedBadge}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {cancelling.verifiedBadge ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiX className="w-4 h-4" />
                  )}
                  Cancel Badge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Billing;
