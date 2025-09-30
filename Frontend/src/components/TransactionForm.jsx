import React, { useState } from 'react';

const TransactionForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    description: initialData?.description || '',
    type: initialData?.type || 'income',
    category: initialData?.category || '',
    date: initialData?.date || new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form only if not editing
    if (!initialData) {
      setFormData({
        amount: '',
        description: '',
        type: 'income',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Dark teal panel similar to the image design */}
      <div 
        className="rounded-lg p-8 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--secondary-800) 0%, var(--secondary-700) 100%)',
          border: '1px solid var(--secondary-600)'
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Add Transaction
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full p-3 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--secondary-300)'
              }}
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--secondary-300)'
              }}
              required
            />
          </div>

          {/* Transaction Type */}
          <div>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--secondary-300)'
              }}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-3 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--secondary-300)'
              }}
            />
          </div>

          {/* Date */}
          <div>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--secondary-300)'
              }}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-full font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, var(--secondary-500) 0%, var(--secondary-400) 100%)',
              border: '1px solid var(--secondary-400)'
            }}
          >
            Add Transaction
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-white font-medium hover:underline transition-all duration-200"
            style={{ color: 'var(--secondary-200)' }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
