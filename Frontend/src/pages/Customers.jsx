import React, { useState } from 'react';
import CustomerList from '../components/CustomerList';

const Customers = () => {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Raju',
      details: {
        gender: 'Male',
        phone: '+911234567890',
        email: 'raju@gmail.com'
      },
      creationDate: '20/06/2025',
      experience: 2,
      specialty: 'Web Development',
      status: 'Inactive'
    },
    {
      id: 2,
      name: 'Ghanshyam',
      details: {
        gender: 'Male',
        phone: '+911234567890',
        email: 'ghanshyam@gmail.com'
      },
      creationDate: '09/02/2025',
      experience: 3,
      specialty: 'Mobile Development',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Priya Sharma',
      details: {
        gender: 'Female',
        phone: '+919876543210',
        email: 'priya.sharma@gmail.com'
      },
      creationDate: '15/03/2025',
      experience: 4,
      specialty: 'UI/UX Design',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Amit Kumar',
      details: {
        gender: 'Male',
        phone: '+919876543211',
        email: 'amit.kumar@gmail.com'
      },
      creationDate: '08/04/2025',
      experience: 1,
      specialty: 'Data Science',
      status: 'Inactive'
    },
    {
      id: 5,
      name: 'Sneha Patel',
      details: {
        gender: 'Female',
        phone: '+919876543212',
        email: 'sneha.patel@gmail.com'
      },
      creationDate: '22/05/2025',
      experience: 5,
      specialty: 'DevOps',
      status: 'Active'
    },
    {
      id: 6,
      name: 'Rajesh Singh',
      details: {
        gender: 'Male',
        phone: '+919876543213',
        email: 'rajesh.singh@gmail.com'
      },
      creationDate: '12/01/2025',
      experience: 6,
      specialty: 'Cloud Architecture',
      status: 'Active'
    },
    {
      id: 7,
      name: 'Anita Verma',
      details: {
        gender: 'Female',
        phone: '+919876543214',
        email: 'anita.verma@gmail.com'
      },
      creationDate: '30/07/2025',
      experience: 2,
      specialty: 'Quality Assurance',
      status: 'Inactive'
    },
    {
      id: 8,
      name: 'Vikram Joshi',
      details: {
        gender: 'Male',
        phone: '+919876543215',
        email: 'vikram.joshi@gmail.com'
      },
      creationDate: '18/08/2025',
      experience: 7,
      specialty: 'Machine Learning',
      status: 'Active'
    },
    {
      id: 9,
      name: 'Meera Gupta',
      details: {
        gender: 'Female',
        phone: '+919876543216',
        email: 'meera.gupta@gmail.com'
      },
      creationDate: '05/09/2025',
      experience: 3,
      specialty: 'Cybersecurity',
      status: 'Active'
    },
    {
      id: 10,
      name: 'Suresh Reddy',
      details: {
        gender: 'Male',
        phone: '+919876543217',
        email: 'suresh.reddy@gmail.com'
      },
      creationDate: '14/10/2025',
      experience: 4,
      specialty: 'Blockchain',
      status: 'Inactive'
    },
    {
      id: 11,
      name: 'Kavita Nair',
      details: {
        gender: 'Female',
        phone: '+919876543218',
        email: 'kavita.nair@gmail.com'
      },
      creationDate: '27/11/2025',
      experience: 8,
      specialty: 'Project Management',
      status: 'Active'
    },
    {
      id: 12,
      name: 'Arjun Mehta',
      details: {
        gender: 'Male',
        phone: '+919876543219',
        email: 'arjun.mehta@gmail.com'
      },
      creationDate: '03/12/2025',
      experience: 2,
      specialty: 'Full Stack Development',
      status: 'Active'
    }
  ]);

  const handleEditCustomer = (customerData, index) => {
    // Edit functionality can be implemented here if needed
    console.log('Edit customer:', customerData, index);
  };

  const handleDeleteCustomer = (index) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold" style={{color: 'var(--text-primary)'}}>
          Customers
        </h2>
        <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
          Manage your customer information
        </p>
      </div>

      {/* Customer List */}
      <CustomerList
        customers={customers}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
      />
    </div>
  );
};

export default Customers;
