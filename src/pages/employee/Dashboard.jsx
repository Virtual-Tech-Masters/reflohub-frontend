import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckSquare, FiClock, FiAlertCircle, FiCheck, FiFileText, FiBell } from 'react-icons/fi';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import PageTitle from '../../components/common/PageTitle';
import StatsCard from '../../components/common/StatsCard';
import { tasks, announcements, employeeChartData } from '../../utils/dummyData';
import { useAuth } from '../../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EmployeeDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      toast.success('Dashboard data loaded successfully!');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter tasks for current employee
  const employeeTasks = tasks.filter(task => 
    task.employeeId === currentUser?.id || task.employeeId === 'u4' || task.employeeId === 'u7'
  );
  
  // Stats calculation
  const totalTasks = employeeTasks.length;
  const pendingTasks = employeeTasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = employeeTasks.filter(task => task.status === 'in_progress').length;
  const completedTasks = employeeTasks.filter(task => task.status === 'done').length;
  
  // Priorities calculation
  const highPriorityTasks = employeeTasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = employeeTasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = employeeTasks.filter(task => task.priority === 'low').length;
  
  // Chart options
  const taskStatusOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Task Status',
      },
    },
  };
  
  const performanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  return (
    <div>
      <PageTitle
        title="Employee Dashboard"
        subtitle="Monitor your tasks and announcements"
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatsCard
            title="Total Tasks"
            value={totalTasks}
            icon={<FiCheckSquare size={20} className="text-primary-500" />}
            color="primary"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatsCard
            title="In Progress"
            value={inProgressTasks}
            icon={<FiClock size={20} className="text-warning-500" />}
            color="warning"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatsCard
            title="Pending"
            value={pendingTasks}
            icon={<FiAlertCircle size={20} className="text-error-500" />}
            color="error"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatsCard
            title="Completed"
            value={completedTasks}
            icon={<FiCheck size={20} className="text-success-500" />}
            color="success"
          />
        </motion.div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Task Status</h3>
          <div className="h-80">
            <Doughnut options={taskStatusOptions} data={employeeChartData.tasks} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
          <div className="h-80">
            <Line options={performanceOptions} data={employeeChartData.performance} />
          </div>
        </motion.div>
      </div>
      
      {/* Priority Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card mb-8"
      >
        <h3 className="text-lg font-semibold mb-4">Task Priorities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-error-50 dark:bg-error-900/10 p-4 rounded-lg border border-error-100 dark:border-error-900/20">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-error-100 dark:bg-error-900/20 flex items-center justify-center mr-2">
                <FiAlertCircle className="text-error-500" />
              </div>
              <h4 className="font-medium text-error-700 dark:text-error-300">High Priority</h4>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-error-700 dark:text-error-300">{highPriorityTasks}</div>
              <div className="text-sm text-error-600 dark:text-error-400">Tasks</div>
            </div>
          </div>
          
          <div className="bg-warning-50 dark:bg-warning-900/10 p-4 rounded-lg border border-warning-100 dark:border-warning-900/20">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center mr-2">
                <FiClock className="text-warning-500" />
              </div>
              <h4 className="font-medium text-warning-700 dark:text-warning-300">Medium Priority</h4>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-warning-700 dark:text-warning-300">{mediumPriorityTasks}</div>
              <div className="text-sm text-warning-600 dark:text-warning-400">Tasks</div>
            </div>
          </div>
          
          <div className="bg-success-50 dark:bg-success-900/10 p-4 rounded-lg border border-success-100 dark:border-success-900/20">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center mr-2">
                <FiCheck className="text-success-500" />
              </div>
              <h4 className="font-medium text-success-700 dark:text-success-300">Low Priority</h4>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-success-700 dark:text-success-300">{lowPriorityTasks}</div>
              <div className="text-sm text-success-600 dark:text-success-400">Tasks</div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Tasks</h3>
          <Link to="/employee/tasks" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Task
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {employeeTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {task.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.status === 'pending' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300' : 
                      task.status === 'in_progress' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300' : 
                      'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                    }`}>
                      {task.status === 'in_progress' ? 'In Progress' : task.status === 'done' ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.priority === 'high' ? 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300' : 
                      task.priority === 'medium' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300' : 
                      'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {task.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* Recent Announcements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Announcements</h3>
          <Link to="/employee/announcements" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            View All
          </Link>
        </div>
        
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
              className={`p-4 rounded-lg border border-l-4 ${
                announcement.importance === 'high' 
                  ? 'border-error-300 dark:border-error-700 border-l-error-500' 
                  : 'border-gray-200 dark:border-gray-700 border-l-gray-400 dark:border-l-gray-500'
              }`}
            >
              <div className="flex items-start">
                <div className={`mt-0.5 mr-3 ${
                  announcement.importance === 'high' ? 'text-error-500' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <FiBell size={18} />
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    {announcement.title}
                    {announcement.importance === 'high' && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300">
                        Important
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {announcement.content}
                  </p>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Posted on {announcement.postedAt}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeDashboard;