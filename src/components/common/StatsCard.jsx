import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => {
  const isPositiveTrend = trend === 'up';
  const trendColorClass = isPositiveTrend ? 'text-success-500' : 'text-error-500';
  const trendIcon = isPositiveTrend ? '↑' : '↓';
  
  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="glass-card overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/20`}
            style={{background: `var(--tw-colors-${color}-100)`}}
          >
            {icon}
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
            {trend && (
              <p className={`text-xs font-medium flex items-center ${trendColorClass}`}>
                {trendIcon} {trendValue}
                <span className="text-gray-500 dark:text-gray-400 ml-1">from previous period</span>
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div 
        className={`h-1 bg-${color}-500`}
        style={{background: `var(--tw-colors-${color}-500)`}}
      ></div>
    </motion.div>
  );
};

export default StatsCard;