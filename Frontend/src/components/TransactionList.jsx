import React, { useState } from 'react';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status) => {
    return status === 'Failed' ? 'var(--error-600)' : 'var(--success-600)';
  };

  return (
    <div className="w-full">
      {/* Items per page and pagination controls (top) */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{color: 'var(--text-secondary)'}}>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="theme-input px-3 py-1 text-sm rounded border"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm" style={{color: 'var(--text-secondary)'}}>entries</span>
        </div>
        
        {/* Top pagination */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: currentPage === 1 ? 'var(--gray-100)' : 'var(--primary-100)',
              color: currentPage === 1 ? 'var(--gray-500)' : 'var(--primary-600)',
              border: '1px solid var(--border-light)'
            }}
          >
            Prev
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-200 text-black-important
              }`}
              style={{
                backgroundColor: currentPage === page ? 'var(--primary-600)' : 'var(--bg-primary)',
                color: 'black',
                border: '1px solid var(--border-light)'
              }}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: currentPage === totalPages ? 'var(--gray-100)' : 'var(--primary-100)',
              color: currentPage === totalPages ? 'var(--gray-500)' : 'var(--primary-600)',
              border: '1px solid var(--border-light)'
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="theme-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="theme-table-header">
                <th className="px-6 py-4 text-left">
                  Transaction ID
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    Amount
                    <span className="text-xs">↕</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <span className="text-xs">↕</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Details</th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center gap-1">
                    Customer
                    <span className="text-xs">↕</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <span className="text-xs">↕</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center" style={{color: 'var(--text-secondary)'}}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                currentTransactions.map((transaction, index) => (
                  <tr key={index} className="theme-table-row border-t" style={{borderColor: 'var(--border-light)'}}>
                    <td className="px-6 py-4 font-mono text-sm" style={{color: 'var(--text-primary)'}}>
                      {transaction.transactionId}
                    </td>
                    <td className="px-6 py-4 font-semibold" style={{color: 'var(--text-primary)'}}>
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4" style={{color: 'var(--text-secondary)'}}>
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4" style={{color: 'var(--text-primary)'}}>
                      <div className="text-sm">
                        <div>Booking: {transaction.details.booking}</div>
                        <div>Reference No. - {transaction.details.referenceNo}</div>
                        <div>Company - {transaction.details.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4" style={{color: 'var(--text-primary)'}}>
                      {transaction.customer}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-sm font-medium"
                        style={{color: getStatusColor(transaction.status)}}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{color: 'var(--text-secondary)'}}>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="theme-input px-3 py-1 text-sm rounded border"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm" style={{color: 'var(--text-secondary)'}}>entries</span>
        </div>
        
        {/* Bottom pagination controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: currentPage === 1 ? 'var(--gray-100)' : 'var(--primary-100)',
              color: currentPage === 1 ? 'var(--gray-500)' : 'var(--primary-600)',
              border: '1px solid var(--border-light)'
            }}
          >
            Prev
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-200 text-black-important
            `}
              style={{
                backgroundColor: currentPage === page ? 'var(--primary-600)' : 'var(--bg-primary)',
                color: 'black',
                border: '1px solid var(--border-light)'
              }}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: currentPage === totalPages ? 'var(--gray-100)' : 'var(--primary-100)',
              color: currentPage === totalPages ? 'var(--gray-500)' : 'var(--primary-600)',
              border: '1px solid var(--border-light)'
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
