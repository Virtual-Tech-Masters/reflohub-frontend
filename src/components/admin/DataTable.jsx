import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronDown, 
  FiChevronUp,
  FiSearch,
  FiFilter,
  FiDownload,
  FiMoreVertical
} from 'react-icons/fi';

const DataTable = ({
  data = [],
  columns = [],
  onRowClick,
  onBulkAction,
  searchable = true,
  sortable = true,
  selectable = true,
  pagination = true,
  pageSize = 10,
  className = '',
  loading = false,
  emptyMessage = 'No data available'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm && searchable) {
      filtered = data.filter(item =>
        columns.some(column => {
          const value = column.accessor ? item[column.accessor] : '';
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortField && sortable) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, columns, searchable, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredAndSortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, pageSize, pagination]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredAndSortedData.length);

  // Handle sorting
  const handleSort = (field) => {
    if (!sortable) return;
    
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleSelectRow = (rowId) => {
    setSelectedRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map(item => item.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedRows.length === 0) {
      return;
    }
    onBulkAction?.(action, selectedRows);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header with search and actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {searchable && (
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {selectable && selectedRows.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedRows.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction('verify')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <FiFilter className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => sortable && handleSort(column.accessor)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {sortable && sortField === column.accessor && (
                      sortDirection === 'asc' ? 
                        <FiChevronUp className="w-4 h-4" /> : 
                        <FiChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <motion.tr
                  key={row.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                      {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startItem} to {endItem} of {filteredAndSortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
