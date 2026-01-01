import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import MonthlySummary from './components/MonthlySummary';
import { transactionAPI } from './services/api';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, balancesRes] = await Promise.all([
        transactionAPI.getAll(),
        transactionAPI.getBalances()
      ]);
      setTransactions(transactionsRes.data);
      setBalances(balancesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    loadData();
    setEditingTransaction(null);
  };

  const handleTransactionUpdated = () => {
    loadData();
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setActiveTab('form');
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <nav className="nav-tabs">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={activeTab === 'form' ? 'active' : ''}
            onClick={() => {
              setActiveTab('form');
              setEditingTransaction(null);
            }}
          >
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </button>
          <button
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button
            className={activeTab === 'summary' ? 'active' : ''}
            onClick={() => setActiveTab('summary')}
          >
            Monthly Summary
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard balances={balances} transactions={transactions} />
        )}
        {activeTab === 'form' && (
          <TransactionForm
            transaction={editingTransaction}
            onSuccess={editingTransaction ? handleTransactionUpdated : handleTransactionAdded}
            onCancel={editingTransaction ? handleCancelEdit : null}
          />
        )}
        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={loadData}
            onRefresh={loadData}
          />
        )}
        {activeTab === 'summary' && (
          <MonthlySummary />
        )}
      </main>
    </div>
  );
}

export default App;

