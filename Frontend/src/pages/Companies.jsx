import React, { useState } from 'react';
import { showSuccess, showError } from '../utils/toast';
import CompanyList from '../components/CompanyList';

const Companies = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Sample data based on the images
  const companies = [
    {
      id: 1,
      name: 'Vihan Enterprises',
      creationDate: '01/09/2025',
      username: 'vihanent',
      bookings: 20,
      status: 'active'
    },
    {
      id: 2,
      name: 'Delhi Enterprises',
      creationDate: '08/08/2025',
      username: 'delhienterprise',
      bookings: 100,
      status: 'inactive'
    },
    {
      id: 3,
      name: 'K Services',
      creationDate: '20/06/2025',
      username: 'kservices',
      bookings: 90,
      status: 'active'
    },
    {
      id: 4,
      name: 'Devan Chand & Co.',
      creationDate: '02/05/2025',
      username: 'dcco',
      bookings: 10,
      status: 'active'
    },
    {
      id: 5,
      name: 'DK & KK',
      creationDate: '09/02/2025',
      username: 'dkkk',
      bookings: 20,
      status: 'active'
    },
    {
      id: 6,
      name: 'Snitch Inc.',
      creationDate: '02/02/2025',
      username: 'snitchinc',
      bookings: 80,
      status: 'active'
    },
    {
      id: 7,
      name: 'Ulah & Co.',
      creationDate: '29/01/2025',
      username: 'ulahco',
      bookings: 200,
      status: 'inactive'
    },
    {
      id: 8,
      name: 'DKL Enterprises',
      creationDate: '11/01/2025',
      username: 'dklent',
      bookings: 190,
      status: 'active'
    }
  ];


  const handleEdit = (company) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleStatusChange = (company) => {
    setSelectedCompany(company);
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (selectedCompany) {
      const newStatus = selectedCompany.status === 'active' ? 'inactive' : 'active';
      showSuccess(`Company "${selectedCompany.name}" status changed to ${newStatus}`);
      setShowStatusModal(false);
      setSelectedCompany(null);
    }
  };

  const handleEditSubmit = (formData) => {
    showSuccess(`Company "${formData.name}" updated successfully`);
    setShowEditModal(false);
    setSelectedCompany(null);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold" style={{color: 'var(--text-primary)'}}>
          Companies
        </h2>
        <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
          Manage your company information
        </p>
      </div>

      {/* Company List */}
      <CompanyList
        companies={companies}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
      />

      {/* Edit Company Modal */}
      {showEditModal && selectedCompany && (
        <EditCompanyModal
          company={selectedCompany}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCompany(null);
          }}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusModal && selectedCompany && (
        <StatusChangeModal
          company={selectedCompany}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedCompany(null);
          }}
          onConfirm={confirmStatusChange}
        />
      )}
    </div>
  );
};

// Edit Company Modal Component
const EditCompanyModal = ({ company, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: company.name,
    phone: '1234567890',
    email: 'snitchco@gmail.com',
    gender: 'Male',
    username: company.username
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="theme-modal-overlay fixed inset-0 flex items-center justify-center z-50">
      <div className="theme-modal max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b" style={{borderColor: 'var(--border-light)'}}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>
              {company.name} - Edit Company Admin
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-primary)'}}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="theme-input w-full rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-primary)'}}>
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="theme-input w-full rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-primary)'}}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="theme-input w-full rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-primary)'}}>
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="theme-input w-full rounded-md px-3 py-2"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{color: 'var(--text-primary)'}}>
                User Name *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="theme-input w-full rounded-md px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="theme-button-secondary px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="theme-button-primary px-4 py-2 rounded-md"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Status Change Confirmation Modal
const StatusChangeModal = ({ company, onClose, onConfirm }) => {
  const newStatus = company.status === 'active' ? 'inactive' : 'active';
  
  return (
    <div className="theme-modal-overlay fixed inset-0 flex items-center justify-center z-50">
      <div className="theme-modal max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b" style={{borderColor: 'var(--border-light)'}}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>Confirm Status Change</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <p className="text-center mb-2" style={{color: 'var(--text-primary)'}}>
            Are you sure you want to make the "{company.name}" company {newStatus}?
          </p>
          
          <p className="text-center text-sm mb-6" style={{color: 'var(--text-secondary)'}}>
            Note: All the staff added under this company will also get {newStatus}.
          </p>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="theme-button-secondary px-6 py-2 rounded-md"
            >
              No
            </button>
            <button
              onClick={onConfirm}
              className="theme-button-primary px-6 py-2 rounded-md"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Companies;
