import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import './MonthlySummary.css';

function MonthlySummary() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getMonthlySummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error loading monthly summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Group summary by month
  const groupedByMonth = summary.reduce((acc, item) => {
    if (!acc[item.month]) {
      acc[item.month] = [];
    }
    acc[item.month].push(item);
    return acc;
  }, {});

  const months = Object.keys(groupedByMonth).sort().reverse();

  if (loading) {
    return (
      <div className="monthly-summary-container">
        <div className="loading">Loading summary...</div>
      </div>
    );
  }

  if (summary.length === 0) {
    return (
      <div className="monthly-summary-container">
        <div className="empty-state">
          <p>No transactions found for monthly summary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monthly-summary-container">
      <div className="summary-header">
        <h2>Monthly Summary</h2>
        <p>Breakdown of expenses by month and category</p>
      </div>

      <div className="summary-list">
        {months.map(month => {
          const monthData = groupedByMonth[month];
          const monthTotal = monthData.reduce((sum, item) => sum + parseFloat(item.total), 0);
          const monthCount = monthData.reduce((sum, item) => sum + item.count, 0);

          return (
            <div key={month} className="month-card">
              <div className="month-header">
                <h3>{formatMonth(month)}</h3>
                <div className="month-totals">
                  <span className="total-amount">{formatCurrency(monthTotal)}</span>
                  <span className="total-count">{monthCount} transaction{monthCount !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="category-breakdown">
                {monthData.map((item, index) => (
                  <div key={index} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                      <span className="category-count">{item.count} transaction{item.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="category-amount">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="summary-footer">
        <div className="grand-total">
          <span className="grand-total-label">Grand Total:</span>
          <span className="grand-total-amount">
            {formatCurrency(summary.reduce((sum, item) => sum + parseFloat(item.total), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MonthlySummary;

