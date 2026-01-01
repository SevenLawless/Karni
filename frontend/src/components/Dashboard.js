import React from 'react';
import './Dashboard.css';

function Dashboard({ balances, transactions }) {
  const zakiBalance = balances.find(b => b.name === 'zaki')?.balance || 0;
  const redaBalance = balances.find(b => b.name === 'reda')?.balance || 0;

  // Calculate totals
  const totalExpenses = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = transactions
    .filter(t => t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getBalanceMessage = () => {
    if (zakiBalance > 0) {
      return `Zaki is owed ${formatCurrency(zakiBalance)}`;
    } else if (zakiBalance < 0) {
      return `Zaki owes ${formatCurrency(Math.abs(zakiBalance))}`;
    } else {
      return 'Balanced - no one owes anything';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Current Balance (Zaki)</h2>
        <div className={`balance-display ${zakiBalance > 0 ? 'positive' : zakiBalance < 0 ? 'negative' : 'zero'}`}>
          {formatCurrency(zakiBalance)}
        </div>
        <p className="balance-message">{getBalanceMessage()}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <div className="stat-value">{formatCurrency(totalExpenses)}</div>
          <p className="stat-label">All time</p>
        </div>

        <div className="stat-card">
          <h3>This Month</h3>
          <div className="stat-value">{formatCurrency(thisMonthExpenses)}</div>
          <p className="stat-label">Current month expenses</p>
        </div>

        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="stat-value">{transactions.length}</div>
          <p className="stat-label">Recorded transactions</p>
        </div>
      </div>

      <div className="balance-breakdown">
        <h3>Balance Breakdown</h3>
        <div className="breakdown-item">
          <span className="breakdown-label">Zaki's balance:</span>
          <span className={`breakdown-value ${zakiBalance >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(zakiBalance)}
          </span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">Reda's balance:</span>
          <span className={`breakdown-value ${redaBalance >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(redaBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

