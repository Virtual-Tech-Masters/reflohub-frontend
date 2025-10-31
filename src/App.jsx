import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmailVerification from './pages/auth/EmailVerification';
import EmailVerificationRequired from './pages/auth/EmailVerificationRequired';
import VerifyEmail from './pages/auth/VerifyEmail';

// Admin Dashboard
import AdminDashboard from './pages/admin/Dashboard';
import AdminBusinesses from './pages/admin/Businesses';
import AdminBusinessDetails from './pages/admin/BusinessDetails';
import AdminFreelancers from './pages/admin/Freelancers';
import AdminFreelancerDetails from './pages/admin/FreelancerDetails';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';

// Business Dashboard
import BusinessDashboard from './pages/business/Dashboard';
import BusinessChat from './pages/business/Chat';
import BusinessProfile from './pages/business/Profile';
import Billing from './pages/business/Billing';
import Freelancer from './pages/business/Freelancers.jsx';
import Payout from './pages/business/Payout.jsx';
import Help from './pages/business/Help.jsx';
import BusinessLeadDetails from './pages/business/LeadDetails.jsx';
import BusinessFreelancerDetails from './pages/business/FreelancerDetails.jsx';
import LeadManagement from './pages/business/LeadManagement.jsx';
import Subscription from './pages/business/Subscription.jsx';
import BillingSuccess from './pages/business/BillingSuccess.jsx';

// Freelancer Dashboard
import FreelancerDashboard from './pages/freelancer/Dashboard';
import FreelancerProjects from './pages/freelancer/Projects';
import FreelancerPendingCommissions from './pages/freelancer/PendingCommissions.jsx'; 
import Lead from './pages/freelancer/Lead.jsx';
import FreelancerEarnings from './pages/freelancer/Earnings';
import LeadDetails from './pages/freelancer/LeadDetails.jsx';
import FreelancerProfile from './pages/freelancer/Profile';
import FreelancerChat from './pages/freelancer/Chat.jsx';
import Businesses from './pages/freelancer/Businesses.jsx';
import Training from './pages/freelancer/Training.jsx';
import BusinessDetails from './pages/freelancer/BusinessDetails.jsx';
import FreelancerSubscription from './pages/freelancer/Subscription.jsx';
import FreelancerBillingSuccess from './pages/freelancer/BillingSuccess.jsx';
import FreelancerBilling from './pages/freelancer/Billing.jsx';
// Employee Dashboard
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeTasks from './pages/employee/Tasks';
import EmployeeAnnouncements from './pages/employee/Announcements';
import EmployeeChat from './pages/employee/Chat';
import EmployeeReports from './pages/employee/Reports';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import PageLoader from './components/loaders/PageLoader';

function App() {
  const [loading, setLoading] = useState(true);

  // LIFTED STATE FOR BUSINESS LEADS
  const initialLeads = [
    {
      id: 1,
      name: 'TechCorp Inc.',
      value: 12500,
      status: 'new',
      paymentStatus: 'pending',
      priority: 'high',
      source: 'Website',
      freelancer: {
        id: 1,
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        phone: '+1-555-0101',
        totalPaid: 5000
      },
      services: ['Web Development', 'UI/UX Design'],
      meetingTime: '2023-06-15T14:30:00',
      location: {
        country: 'USA',
        province: 'California',
        state: 'CA',
        city: 'San Francisco'
      },
      notes: 'Interested in revamping their e-commerce platform.',
      rejectionReason: '',
      feedback: '',
      createdAt: '2023-06-10'
    },
    {
      id: 2,
      name: 'GreenSolutions LLC',
      value: 8500,
      status: 'contacted',
      paymentStatus: 'pending',
      priority: 'medium',
      source: 'Referral',
      freelancer: {
        id: 2,
        name: 'Jamie Smith',
        email: 'jamie.smith@example.com',
        phone: '+1-555-0102',
        totalPaid: 3000
      },
      services: ['SEO Optimization', 'Content Marketing'],
      meetingTime: '2023-06-18T10:00:00',
      location: {
        country: 'USA',
        province: 'Remote',
        state: '',
        city: 'Remote'
      },
      notes: 'Looking to improve organic search traffic.',
      rejectionReason: '',
      feedback: '',
      createdAt: '2023-06-05'
    },
    {
      id: 3,
      name: 'Wilson & Associates',
      value: 20000,
      status: 'qualified',
      paymentStatus: 'done',
      priority: 'high',
      source: 'Conference',
      freelancer: {
        id: 3,
        name: 'Taylor Brown',
        email: 'taylor.brown@example.com',
        phone: '+1-555-0103',
        totalPaid: 8000
      },
      services: ['Custom Software', 'Database Integration'],
      meetingTime: '2023-06-20T13:15:00',
      location: {
        country: 'USA',
        province: 'New York',
        state: 'NY',
        city: 'New York'
      },
      notes: 'Needs case management system for law firm.',
      rejectionReason: '',
      feedback: 'Excellent initial consultation, detailed requirements gathered.',
      createdAt: '2023-05-28'
    },
    {
      id: 4,
      name: 'UrbanEats',
      value: 6500,
      status: 'rejected',
      paymentStatus: 'pending',
      priority: 'low',
      source: 'Social Media',
      freelancer: {
        id: 4,
        name: 'Jordan Lee',
        email: 'jordan.lee@example.com',
        phone: '+1-555-0104',
        totalPaid: 2000
      },
      services: ['Mobile App Development'],
      meetingTime: null,
      location: {
        country: 'USA',
        province: 'Illinois',
        state: 'IL',
        city: 'Chicago'
      },
      notes: 'Wanted food delivery app.',
      rejectionReason: 'Went with competitor due to pricing.',
      feedback: '',
      createdAt: '2023-05-20'
    }
  ];
  const [leads, setLeads] = useState(initialLeads);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <HelmetProvider>
      <ThemeProvider>
        <AnimatePresence mode="wait">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/email-verification-required" element={<EmailVerificationRequired />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
          
          <Route path="/admin/dashboard" element={<AdminAuthProvider><AdminLayout /></AdminAuthProvider>}>
            <Route index element={<AdminDashboard />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="businesses/:id" element={<AdminBusinessDetails />} />
            <Route path="freelancers" element={<AdminFreelancers />} />
            <Route path="freelancers/:id" element={<AdminFreelancerDetails />} />
          </Route>

          {/* Business Routes */}
          <Route path="/business" element={<DashboardLayout userType="business" />}>
            <Route index element={<BusinessDashboard />} />
            <Route path="dashboard" element={<Navigate to="/business" replace />} />
            <Route path="freelancers" element={<Freelancer />} />
            <Route path="freelancers/:id" element={<BusinessFreelancerDetails />} />
            <Route path="chat" element={<BusinessChat />} />
            <Route path="profile" element={<BusinessProfile />} />
            <Route path="billing" element={<Billing />} />
            <Route path="leads" element={<LeadManagement />} />
            <Route path="leads/:leadId" element={<BusinessLeadDetails />} />
            <Route path="payout" element={<Payout />} />
            <Route path="help" element={<Help />} />
            <Route path="subscription" element={<Subscription />} />
          </Route>

          {/* Standalone Billing Success Route */}
          <Route path="/business/billing/success" element={<BillingSuccess />} />
          
          {/* Standalone Freelancer Subscription Route */}
          <Route path="/freelancer/subscription" element={<FreelancerSubscription />} />
          
          {/* Standalone Freelancer Billing Success Route */}
          <Route path="/freelancer/billing/success" element={<FreelancerBillingSuccess />} />

          {/* Freelancer Routes */}
          <Route path="/freelancer" element={<DashboardLayout userType="freelancer" />}>
            <Route index element={<FreelancerDashboard />} />
            <Route path="businesses" element={<Businesses />} />
            <Route path="leads" element={<Lead />} />
            <Route path="lead-details/:id" element={<LeadDetails />} />
            <Route path="business-details/:id" element={<BusinessDetails />} />
            <Route path="pending-commissions" element={<FreelancerPendingCommissions />} />
            <Route path="earnings" element={<FreelancerEarnings />} />
            <Route path="billing" element={<FreelancerBilling />} />
            <Route path="training" element={<Training />} />
            <Route path="chat" element={<FreelancerChat />} />
            <Route path="profile" element={<FreelancerProfile />} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee" element={<DashboardLayout userType="employee" />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="tasks" element={<EmployeeTasks />} />
            <Route path="announcements" element={<EmployeeAnnouncements />} />
            <Route path="chat" element={<EmployeeChat />} />
            <Route path="reports" element={<EmployeeReports />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
      <Toaster 
        position="bottom-center" 
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#1f2937',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }} 
      />
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;