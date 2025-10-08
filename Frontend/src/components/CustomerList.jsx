import React, { useState } from 'react';

const CustomerList = ({ customers, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Calculate pagination
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customers.slice(startIndex, endIndex);

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
    return status === 'Active' ? 'var(--success-600)' : 'var(--gray-600)';
  };

  const getStatusBackground = (status) => {
    return status === 'Active' ? 'var(--success-100)' : 'var(--gray-100)';
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
              className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-200 text-black-important`}
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

      {/* Customers Table */}
      <div className="theme-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="theme-table-header">
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name
                    <span className="text-xs">↕</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Details</th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('creationDate')}
                >
                  <div className="flex items-center gap-1">
                    Creation Date
                    <span className="text-xs">↕</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('experience')}
                >
                  <div className="flex items-center gap-1">
                    Years of Experience
                    <span className="text-xs">↕</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Specialty</th>
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
              {currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center" style={{color: 'var(--text-secondary)'}}>
                    No customers found
                  </td>
                </tr>
              ) : (
                currentCustomers.map((customer, index) => (
                  <tr key={index} className="theme-table-row border-t" style={{borderColor: 'var(--border-light)'}}>
                    <td className="px-6 py-4 font-semibold" style={{color: 'var(--text-primary)'}}>
                      {customer.name}
                    </td>
                    <td className="px-6 py-4" style={{color: 'var(--text-primary)'}}>
                      <div className="text-sm">
                        <div>Gender: {customer.details.gender}</div>
                        <div>Phone: {customer.details.phone}</div>
                        <div>Email: {customer.details.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4" style={{color: 'var(--text-secondary)'}}>
                      {customer.creationDate}
                    </td>
                    <td className="px-6 py-4" style={{color: 'var(--text-primary)'}}>
                      {customer.experience} years
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="text-sm underline cursor-pointer hover:no-underline transition-all"
                        style={{color: 'var(--primary-600)'}}
                      >
                        Specialty Description
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="px-4 py-2 text-sm font-medium rounded transition-colors duration-200 text-black-important"
                        style={{
                          backgroundColor: customer.status === 'Active' ? 'var(--success-600)' : 'var(--gray-600)',
                          color: 'black',
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        {customer.status}
                      </button>
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
              className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-200 text-black-important`}
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

export default CustomerList;
