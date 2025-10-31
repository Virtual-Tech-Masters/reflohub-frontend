import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaFilter, FaTimes, FaTicketAlt } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import StatsCard from '../../components/common/StatsCard';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

// Mock data
const mockTickets = [
  {
    id: 1,
    ticketId: 'TCK12345',
    subject: 'Payout not received',
    description: 'My payout from April 15 is still pending.',
    priority: 'high',
    status: 'open',
    createdAt: '2025-04-20',
  },
  {
    id: 2,
    ticketId: 'TCK67890',
    subject: 'Billing issue',
    description: 'Unable to access billing dashboard.',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2025-03-10',
  },
  {
    id: 3,
    ticketId: 'TCK11223',
    subject: 'Account verification',
    description: 'Need help verifying my freelancer account.',
    priority: 'low',
    status: 'open',
    createdAt: '2025-02-05',
  },
];

const mockFAQs = [
  {
    question: 'How do I request a payout?',
    answer: 'Go to the Payout Dashboard, click "Request Payout," and enter the amount and payment method.',
  },
  {
    question: 'How do I manage my leads?',
    answer: 'Navigate to the Leads section from the sidebar to view, approve, reject, or convert leads submitted by freelancers.',
  },
  {
    question: 'How can I update my payment method?',
    answer: 'Visit the Payout Dashboard and click "Setup Payment Method" to add or update via Stripe.',
  },
];

const Help = () => {
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', priority: 'medium' });
  const [formError, setFormError] = useState('');
  const [openFAQ, setOpenFAQ] = useState(null);

  // Mock API fetch
  useEffect(() => {
    setTimeout(() => {
      try {
        setTickets(mockTickets);
        setLoading(false);
      } catch (err) {
        setError('Failed to load support tickets. Please try again.');
        setLoading(false);
      }
    }, 1000);

    // Handle Escape key for modals
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowTicketForm(false);
        setSelectedTicket(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Stats for cards
  const stats = [
    {
      title: 'Open Tickets',
      value: '5',
      icon: <FaTicketAlt className="text-warning-500" />,
      trend: 'up',
      trendValue: '2%',
      color: 'warning',
    },
    {
      title: 'Resolved Tickets',
      value: '20',
      icon: <FaTicketAlt className="text-success-500" />,
      trend: 'up',
      trendValue: '10%',
      color: 'success',
    },
    {
      title: 'Avg. Response Time',
      value: '24h',
      icon: <FaTicketAlt className="text-primary-500" />,
      trend: 'down',
      trendValue: '5%',
      color: 'primary',
    },
  ];

  // Filter tickets
  const filteredTickets = tickets.filter(
    (ticket) => filterStatus === 'all' || ticket.status === filterStatus
  );

  // Handle ticket form submission
  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.description) {
      setFormError('Please fill in all required fields.');
      return;
    }
    // Mock API call
    // axios.post('/api/support/tickets', ticketForm)
    toast.success('Ticket submitted successfully!');
    setTicketForm({ subject: '', description: '', priority: 'medium' });
    setShowTicketForm(false);
    setFormError('');
  };

  // Form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTicketForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Toggle FAQ
  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      open: { bg: 'bg-warning-100 dark:bg-warning-900/20', dot: 'bg-warning-500', text: 'text-warning-800' },
      resolved: { bg: 'bg-success-100 dark:bg-success-900/20', dot: 'bg-success-500', text: 'text-success-800' },
    };
    return styles[status] || styles.open;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-error-500 mb-4">Server Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Help & Support - RefloHub</title>
        <meta name="description" content="Get help and support for your business account" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Toaster position="top-right" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Help & Support</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendValue={stat.trendValue}
            color={stat.color}
          />
        ))}
          </div>

          {/* FAQs Section */}
          <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {mockFAQs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-4 text-left flex justify-between items-center text-gray-900 dark:text-white"
                aria-expanded={openFAQ === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-sm font-medium">{faq.question}</span>
                <FaQuestionCircle
                  className={`text-primary-500 transform transition-transform ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFAQ === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          </div>
          </div>

          {/* Contact Support */}
          <div className="mb-8">
        <button
          onClick={() => setShowTicketForm(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition flex items-center"
        >
          <FaTicketAlt className="mr-2" />
          Submit a Support Ticket
        </button>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex items-center">
          <FaFilter className="text-primary-500 mr-2" aria-hidden="true" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
          </div>

          {/* Ticket History Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Ticket ID</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Subject</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Priority</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-600 dark:text-gray-400">
                    Loading tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-600 dark:text-gray-400">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <motion.tr
                    key={ticket.id}
                    className="border-t dark:border-gray-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="p-4 text-gray-900 dark:text-white">{ticket.ticketId}</td>
                    <td className="p-4 text-gray-900 dark:text-white">{ticket.subject}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadge(ticket.status).bg} ${
                          getStatusBadge(ticket.status).text
                        } flex items-center`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${getStatusBadge(ticket.status).dot}`}
                          aria-hidden="true"
                        ></span>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-900 dark:text-white">{ticket.priority}</td>
                    <td className="p-4 text-gray-900 dark:text-white">{ticket.createdAt}</td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-primary-500 hover:text-primary-600 transition"
                        aria-label={`View details for ticket ${ticket.ticketId}`}
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
          </div>

          {/* Ticket Submission Modal */}
          <AnimatePresence>
        {showTicketForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="ticket-modal-title"
            aria-modal="true"
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 id="ticket-modal-title" className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Submit Support Ticket
                </h2>
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close modal"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <form onSubmit={handleTicketSubmit}>
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={ticketForm.subject}
                    onChange={handleFormChange}
                    className="mt-1 p-2 w-full rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                    aria-describedby="subject-error"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={ticketForm.description}
                    onChange={handleFormChange}
                    className="mt-1 p-2 w-full rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="4"
                    required
                    aria-describedby="description-error"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={ticketForm.priority}
                    onChange={handleFormChange}
                    className="mt-1 p-2 w-full rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Select priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                {formError && (
                  <p id="form-error" className="mb-4 text-sm text-error-500">
                    {formError}
                  </p>
                )}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowTicketForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
          </AnimatePresence>

          {/* Ticket Details Modal */}
          <AnimatePresence>
        {selectedTicket && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="ticket-details-modal-title"
            aria-modal="true"
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  id="ticket-details-modal-title"
                  className="text-2xl font-semibold text-gray-900 dark:text-white"
                >
                  Ticket Details
                </h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close modal"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ticket ID</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedTicket.ticketId}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subject</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedTicket.subject}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status</h3>
                  <span
                    className={`px-2 py-1 rounded-md text-sm font-medium ${getStatusBadge(selectedTicket.status).bg} ${
                      getStatusBadge(selectedTicket.status).text
                    } flex items-center`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${getStatusBadge(selectedTicket.status).dot}`}
                      aria-hidden="true"
                    ></span>
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Priority</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedTicket.priority}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedTicket.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Created At</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedTicket.createdAt}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Help;