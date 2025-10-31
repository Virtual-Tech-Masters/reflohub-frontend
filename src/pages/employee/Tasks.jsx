import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiAlertCircle, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageTitle from '../../components/common/PageTitle';

// Dummy data for tasks
const dummyTasks = [
  {
    id: 1,
    title: 'Update user documentation',
    description: 'Complete the new user onboarding guide',
    priority: 'high',
    status: 'pending',
    assignedTo: 'John Doe',
    dueDate: '2023-06-15',
  },
  {
    id: 2,
    title: 'Fix dashboard responsive issues',
    description: 'Mobile view needs adjustments',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: 'Sarah Smith',
    dueDate: '2023-06-10',
  },
  {
    id: 3,
    title: 'Implement dark mode toggle',
    description: 'Add theme switcher to settings',
    priority: 'low',
    status: 'completed',
    assignedTo: 'Mike Johnson',
    dueDate: '2023-05-28',
  },
  {
    id: 4,
    title: 'Database optimization',
    description: 'Run performance tuning on production DB',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Emma Wilson',
    dueDate: '2023-06-20',
  },
  {
    id: 5,
    title: 'Prepare quarterly report',
    description: 'Compile metrics for Q2 performance',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'David Brown',
    dueDate: '2023-06-05',
  },
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setTasks(dummyTasks);
      setIsLoading(false);
      toast.success('Tasks loaded successfully!');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success('Task deleted successfully!');
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    toast.success('Task status updated!');
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    const newTaskWithId = {
      ...newTask,
      id: tasks.length + 1,
      status: 'pending',
    };
    setTasks([...tasks, newTaskWithId]);
    setNewTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
    });
    toast.success('New task added successfully!');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Task Management"
        subtitle="Manage and track all platform tasks"
      />
      
      {/* Task Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={cardVariants}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20 mr-4">
                <FiClock className="text-primary-500 text-xl" />
              </div>
              <div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</h3>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-warning-100 dark:bg-warning-900/20 mr-4">
                <FiAlertCircle className="text-warning-500 text-xl" />
              </div>
              <div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400">Pending</h3>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-100 dark:bg-secondary-900/20 mr-4">
                <FiClock className="text-secondary-500 text-xl" />
              </div>
              <div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400">In Progress</h3>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in-progress').length}</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-success-100 dark:bg-success-900/20 mr-4">
                <FiCheckCircle className="text-success-500 text-xl" />
              </div>
              <div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400">Completed</h3>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Task Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <h3 className="text-lg font-semibold">All Tasks</h3>
        <button
          onClick={() => setNewTaskModal(true)}
          className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <FiPlus className="mr-2" />
          Add New Task
        </button>
      </motion.div>
      
      {/* Tasks Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assigned To
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {task.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{task.assignedTo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${task.priority === 'high' ? 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300' : 
                        task.priority === 'medium' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300' : 
                          'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`text-sm rounded-md border-0 focus:ring-2 focus:ring-offset-2 ${
                        task.status === 'pending' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300' :
                        task.status === 'in-progress' ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-300' :
                        'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {task.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-500 hover:text-primary-700 mr-3">
                      <FiEdit2 />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-error-500 hover:text-error-700"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* Add New Task Modal */}
      {newTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
              <form onSubmit={handleAddTask}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
                  <input
                    type="text"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setNewTaskModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tasks;