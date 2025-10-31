import { motion } from 'framer-motion';

const PageTitle = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </motion.div>
      
      {actions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-4 md:mt-0 flex space-x-3"
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
};

export default PageTitle;