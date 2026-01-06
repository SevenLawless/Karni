import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import './TransactionForm.css';

const CATEGORIES = ['rent', 'utilities', 'groceries', 'dining', 'transport', 'entertainment', 'other'];

function TransactionForm({ transaction, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: 'other',
    payer: 'zaki',
    transaction_type: 'shared',
    person: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        amount: transaction.amount.toString(),
        description: transaction.description,
        category: transaction.category,
        payer: transaction.payer,
        transaction_type: transaction.transaction_type || 'shared',
        person: transaction.person || '',
        notes: transaction.notes || ''
      });
    }
  }, [transaction]);

  const validate = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.payer) {
      newErrors.payer = 'Payer is required';
    }

    if (!formData.transaction_type) {
      newErrors.transaction_type = 'Transaction type is required';
    }

    if ((formData.transaction_type === 'personal' || formData.transaction_type === 'income') && !formData.person) {
      newErrors.person = 'Person is required for personal and income transactions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      if (transaction) {
        await transactionAPI.update(transaction.id, formData);
      } else {
        await transactionAPI.create(formData);
      }
      onSuccess();
      // Reset form if not editing
      if (!transaction) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          description: '',
          category: 'other',
          payer: 'zaki',
          transaction_type: 'shared',
          person: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="transaction-form-container">
      <div className="transaction-form">
        <h2>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className={errors.amount ? 'error' : ''}
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Grocery shopping at Walmart"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="transaction_type">Transaction Type *</label>
            <select
              id="transaction_type"
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              className={errors.transaction_type ? 'error' : ''}
            >
              <option value="shared">Shared Transaction (50/50 split)</option>
              <option value="personal">Personal Transaction (expense)</option>
              <option value="income">Income (adds balance)</option>
            </select>
            {errors.transaction_type && <span className="error-message">{errors.transaction_type}</span>}
            <small className="form-hint">
              {formData.transaction_type === 'shared' 
                ? 'Shared transactions are split 50/50 between both people.'
                : formData.transaction_type === 'income'
                ? 'Income transactions add balance to one person\'s wallet.'
                : 'Personal transactions affect only one person\'s wallet.'}
            </small>
          </div>

          {(formData.transaction_type === 'personal' || formData.transaction_type === 'income') && (
            <div className="form-group">
              <label htmlFor="person">Person *</label>
              <select
                id="person"
                name="person"
                value={formData.person}
                onChange={handleChange}
                className={errors.person ? 'error' : ''}
              >
                <option value="">Select person</option>
                <option value="zaki">Zaki</option>
                <option value="reda">Reda</option>
              </select>
              {errors.person && <span className="error-message">{errors.person}</span>}
              <small className="form-hint">
                {formData.transaction_type === 'income' 
                  ? 'Select whose wallet receives this income.'
                  : 'Select whose wallet this transaction affects.'}
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="payer">Paid By *</label>
            <select
              id="payer"
              name="payer"
              value={formData.payer}
              onChange={handleChange}
              className={errors.payer ? 'error' : ''}
            >
              <option value="zaki">Zaki</option>
              <option value="reda">Reda</option>
              <option value="both">Both (50/50 on the spot)</option>
            </select>
            {errors.payer && <span className="error-message">{errors.payer}</span>}
            <small className="form-hint">
              {formData.transaction_type === 'shared' 
                ? 'Costs are automatically split 50/50. Select "Both" if you both paid your share on the spot.'
                : formData.transaction_type === 'income'
                ? 'Who received this income (for record keeping).'
                : 'Who paid for this transaction (for record keeping).'}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (External Funding, etc.)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional notes about this transaction..."
            />
          </div>

          <div className="form-actions">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (transaction ? 'Update Transaction' : 'Add Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;

