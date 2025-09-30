import React, { useState } from 'react';

const CompanyList = ({ companies, onEdit, onStatusChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Calculate pagination
  const totalPages = Math.ceil(companies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = companies.slice(startIndex, endIndex);

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
    return status === 'active' ? 'var(--success-600)' : 'var(--gray-600)';
  };

  const getStatusBackground = (status) => {
    return status === 'active' ? 'var(--success-100)' : 'var(--gray-100)';
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
              className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-200 ${
                currentPage === page ? 'text-white' : ''
              }`}
              style={{
                backgroundColor: currentPage === page ? 'var(--primary-600)' : 'var(--bg-primary)',
                color: currentPage === page ? 'white' : 'var(--text-primary)',
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

      {/* Companies Table */}
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
                    Company Name
                    <span className="text-xs">↕</span>
                  </div>
                </th>
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
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center gap-1">
                    Username
                    <span className="text-xs">↕</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('bookings')}
                >
                  <div className="flex items-center gap-1">
                    Bookings
                    <span className="text-xs">↕</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCompanies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center" style={{color: 'var(--text-secondary)'}}>
                    No companies found
                  </td>
                </tr>
              ) : (
                currentCompanies.map((company) => (
                  <tr key={company.id} className="theme-table-row border-t" style={{borderColor: 'var(--border-light)'}}>
                    <td className="px-6 py-4 font-semibold" style={{color: 'var(--text-primary)'}}>
                      {company.name}
                    </td>
                    <td className="px-6 py-4" style={{color: 'var(--text-secondary)'}}>
                      {company.creationDate}
                    </td>
                    <td className="px-6 py-4" style={{color: 'var(--text-secondary)'}}>
                      {company.username}
                    </td>
                    <td className="px-6 py-4" style={{color: 'var(--text-primary)'}}>
                      {company.bookings}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEdit(company)}
                          className="text-gray-400 hover:text-gray-600"
                          title="View Profile"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onStatusChange(company)}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            company.status === 'active'
                              ? 'theme-status-active'
                              : 'theme-status-inactive'
                          }`}
                        >
                          {company.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => onEdit(company)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Edit Company"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
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
              className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-200 ${
                currentPage === page ? 'text-white' : ''
              }`}
              style={{
                backgroundColor: currentPage === page ? 'var(--primary-600)' : 'var(--bg-primary)',
                color: currentPage === page ? 'white' : 'var(--text-primary)',
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

export default CompanyList;
