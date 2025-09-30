import React, { useState } from 'react';
import TransactionList from '../components/TransactionList';

const Transactions = () => {
  const [transactions, setTransactions] = useState([
    {
      transactionId: '12e74ubf93ff',
      amount: 200,
      date: '01/09/2025',
      details: {
        booking: '101',
        referenceNo: '1234567890',
        company: 'DK & KK'
      },
      customer: 'Brij Nath Kumar',
      status: 'Captured'
    },
    {
      transactionId: 'dfne38477hh',
      amount: 300,
      date: '20/08/2025',
      details: {
        booking: '102',
        referenceNo: '1234567890',
        company: 'Snitch Co.'
      },
      customer: 'Kavita Devi',
      status: 'Captured'
    },
    {
      transactionId: 'ee3559ffbdj',
      amount: 1300,
      date: '09/06/2025',
      details: {
        booking: '103',
        referenceNo: '1234567890',
        company: 'K Servies'
      },
      customer: 'Garry Dsouza',
      status: 'Captured'
    },
    {
      transactionId: 'vnb57tjfcss4',
      amount: 900,
      date: '19/04/2025',
      details: {
        booking: '104',
        referenceNo: '1234567890',
        company: 'Tech Solutions'
      },
      customer: 'Gautam Gour',
      status: 'Failed'
    },
    {
      transactionId: 'tx23vb689jj',
      amount: 600,
      date: '11/04/2025',
      details: {
        booking: '105',
        referenceNo: '1234567890',
        company: 'Global Corp'
      },
      customer: 'John Dere',
      status: 'Captured'
    },
    {
      transactionId: 'abc123def456',
      amount: 450,
      date: '05/03/2025',
      details: {
        booking: '106',
        referenceNo: '1234567890',
        company: 'Innovate Ltd'
      },
      customer: 'Sarah Wilson',
      status: 'Captured'
    },
    {
      transactionId: 'xyz789uvw012',
      amount: 750,
      date: '28/02/2025',
      details: {
        booking: '107',
        referenceNo: '1234567890',
        company: 'Future Tech'
      },
      customer: 'Mike Johnson',
      status: 'Captured'
    },
    {
      transactionId: 'mno345pqr678',
      amount: 320,
      date: '15/02/2025',
      details: {
        booking: '108',
        referenceNo: '1234567890',
        company: 'Digital Solutions'
      },
      customer: 'Emily Davis',
      status: 'Failed'
    },
    {
      transactionId: 'ghi901jkl234',
      amount: 850,
      date: '03/02/2025',
      details: {
        booking: '109',
        referenceNo: '1234567890',
        company: 'Smart Systems'
      },
      customer: 'David Brown',
      status: 'Captured'
    },
    {
      transactionId: 'stu567vwx890',
      amount: 150,
      date: '25/01/2025',
      details: {
        booking: '110',
        referenceNo: '1234567890',
        company: 'NextGen Inc'
      },
      customer: 'Lisa Anderson',
      status: 'Captured'
    },
    {
      transactionId: 'qwe123rty456',
      amount: 680,
      date: '18/01/2025',
      details: {
        booking: '111',
        referenceNo: '1234567890',
        company: 'Cloud Services'
      },
      customer: 'Robert Taylor',
      status: 'Captured'
    },
    {
      transactionId: 'zxc789asd012',
      amount: 420,
      date: '10/01/2025',
      details: {
        booking: '112',
        referenceNo: '1234567890',
        company: 'Data Analytics'
      },
      customer: 'Jennifer Lee',
      status: 'Failed'
    }
  ]);

  const handleEditTransaction = (transactionData, index) => {
    // Edit functionality can be implemented here if needed
    console.log('Edit transaction:', transactionData, index);
  };

  const handleDeleteTransaction = (index) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold" style={{color: 'var(--text-primary)'}}>
          Transactions
        </h2>
        <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
          Manage your financial transactions
        </p>
      </div>


      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
};

export default Transactions;
