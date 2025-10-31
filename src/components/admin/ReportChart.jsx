import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Line, 
  Bar, 
  Pie, 
  Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { FiDownload, FiRefreshCw, FiMaximize2 } from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ReportChart = ({
  data,
  type = 'line',
  title,
  subtitle,
  height = 300,
  showControls = true,
  onRefresh,
  onExport,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Default chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false, // We'll handle title in our component
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  // Chart type specific options
  const getChartOptions = () => {
    switch (type) {
      case 'pie':
      case 'doughnut':
        return {
          ...defaultOptions,
          scales: undefined,
        };
      case 'area':
        return {
          ...defaultOptions,
          plugins: {
            ...defaultOptions.plugins,
            filler: {
              propagate: false,
            },
          },
        };
      default:
        return defaultOptions;
    }
  };

  // Render chart based on type
  const renderChart = () => {
    const options = getChartOptions();

    switch (type) {
      case 'line':
        return <Line data={data} options={options} />;
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'area':
        // Use Line chart with fill for area charts
        return <Line data={data} options={options} />;
      case 'pie':
        return <Pie data={data} options={options} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} />;
      default:
        return <Line data={data} options={options} />;
    }
  };

  const chartContent = (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh data"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              )}
              
              {onExport && (
                <button
                  onClick={onExport}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Export chart"
                >
                  <FiDownload className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Toggle fullscreen"
              >
                <FiMaximize2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <div style={{ height: `${height}px` }}>
          {renderChart()}
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="h-full flex flex-col">
          {/* Fullscreen Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiMaximize2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Fullscreen Chart */}
          <div className="flex-1 p-4">
            <div style={{ height: 'calc(100vh - 120px)' }}>
              {renderChart()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {chartContent}
    </motion.div>
  );
};

// Predefined chart configurations for common report types
export const chartConfigs = {
  revenue: {
    type: 'line',
    title: 'Revenue Trend',
    subtitle: 'Monthly revenue over time',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    }
  },
  
  subscriptions: {
    type: 'bar',
    title: 'Subscriptions',
    subtitle: 'Active subscriptions by type',
    data: {
      labels: ['Business', 'Freelancer'],
      datasets: [{
        label: 'Active Subscriptions',
        data: [150, 300],
        backgroundColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
      }]
    }
  },
  
  leadsFunnel: {
    type: 'doughnut',
    title: 'Leads Funnel',
    subtitle: 'Lead status distribution',
    data: {
      labels: ['Submitted', 'Approved', 'Rejected', 'Converted'],
      datasets: [{
        data: [100, 60, 20, 15],
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)'
        ],
      }]
    }
  }
};

export default ReportChart;
