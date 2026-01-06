import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import FilterBar from './FilterBar';
import './TransactionList.css';

function TransactionList({ transactions: initialTransactions, onEdit, onDelete, onRefresh }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    payer: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadFilteredTransactions();
  }, [filters]);

  const loadFilteredTransactions = async () => {
    try {
      const response = await transactionAPI.getAll(filters);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionAPI.delete(id);
      onDelete();
      loadFilteredTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await transactionAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="transaction-list-container">
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onExportCSV={handleExportCSV}
      />

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions found.</p>
          {Object.values(filters).some(f => f) && (
            <p className="empty-hint">Try adjusting your filters.</p>
          )}
        </div>
      ) : (
        <div className="transaction-list">
          <div className="transaction-table-header">
            <div className="col-date">Date</div>
            <div className="col-description">Description</div>
            <div className="col-category">Category</div>
            <div className="col-type">Type</div>
            <div className="col-amount">Amount</div>
            <div className="col-payer">Paid By</div>
            <div className="col-actions">Actions</div>
          </div>

          {transactions.map(transaction => {
            const transactionType = transaction.transaction_type || 'shared';
            return (
              <div key={transaction.id} className="transaction-row">
                <div className="col-date">{formatDate(transaction.date)}</div>
                <div className="col-description">
                  <div className="description-text">{transaction.description}</div>
                  {transaction.notes && (
                    <div className="notes-text" title={transaction.notes}>
                      {transaction.notes}
                    </div>
                  )}
                </div>
                <div className="col-category">
                  <span className="category-badge">{transaction.category}</span>
                </div>
                <div className="col-type">
                  <span className={`type-badge ${transactionType}`}>
                    {transactionType === 'personal' ? 'Personal' : 'Shared'}
                  </span>
                  {transactionType === 'personal' && transaction.person && (
                    <div className="person-label">({transaction.person === 'zaki' ? 'Zaki' : 'Reda'})</div>
                  )}
                </div>
                <div className="col-amount">{formatCurrency(transaction.amount)}</div>
                <div className="col-payer">
                  <span className={`payer-badge ${transaction.payer}`}>
                    {transaction.payer === 'zaki' ? 'Zaki' : transaction.payer === 'reda' ? 'Reda' : 'Both'}
                  </span>
                </div>
                <div className="col-actions">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="btn-action btn-edit"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="btn-action btn-delete"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="transaction-summary">
        <p>
          Showing <strong>{transactions.length}</strong> transaction{transactions.length !== 1 ? 's' : ''}
        </p>
        {transactions.length > 0 && (
          <p>
            Total: <strong>{formatCurrency(transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0))}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

export default TransactionList;

