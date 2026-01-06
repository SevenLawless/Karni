const transactionModel = require('../models/transactionModel');

async function getAllTransactions(req, res) {
  try {
    const filters = {
      category: req.query.category,
      payer: req.query.payer,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search
    };
    
    const transactions = await transactionModel.getAllTransactions(filters);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

async function getTransactionById(req, res) {
  try {
    const transaction = await transactionModel.getTransactionById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
}

async function createTransaction(req, res) {
  try {
    const { date, amount, description, category, payer, transaction_type, person, notes } = req.body;
    
    // Validation
    if (!date || !amount || !description || !category || !payer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    
    if (!['zaki', 'reda', 'both'].includes(payer)) {
      return res.status(400).json({ error: 'Invalid payer' });
    }
    
    // Validate transaction_type
    if (!transaction_type || !['personal', 'shared', 'income'].includes(transaction_type)) {
      return res.status(400).json({ error: 'Invalid transaction_type. Must be "personal", "shared", or "income"' });
    }
    
    // If personal or income transaction, person field is required
    if (transaction_type === 'personal' || transaction_type === 'income') {
      if (!person || !['zaki', 'reda'].includes(person)) {
        return res.status(400).json({ error: 'Person field is required for personal and income transactions and must be "zaki" or "reda"' });
      }
    } else {
      // For shared transactions, person should be null
      if (person !== null && person !== undefined) {
        return res.status(400).json({ error: 'Person field should not be set for shared transactions' });
      }
    }
    
    const transactionId = await transactionModel.createTransaction({
      date,
      amount: parseFloat(amount),
      description,
      category,
      payer,
      transaction_type,
      person: (transaction_type === 'personal' || transaction_type === 'income') ? person : null,
      notes
    });
    
    // Update balances
    const transaction = await transactionModel.getTransactionById(transactionId);
    await transactionModel.updateBalancesForTransaction(transaction, true);
    
    const newTransaction = await transactionModel.getTransactionById(transactionId);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create transaction',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function updateTransaction(req, res) {
  try {
    const { date, amount, description, category, payer, transaction_type, person, notes } = req.body;
    const { id } = req.params;
    
    // Validation
    if (!date || !amount || !description || !category || !payer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    
    if (!['zaki', 'reda', 'both'].includes(payer)) {
      return res.status(400).json({ error: 'Invalid payer' });
    }
    
    // Validate transaction_type
    if (!transaction_type || !['personal', 'shared', 'income'].includes(transaction_type)) {
      return res.status(400).json({ error: 'Invalid transaction_type. Must be "personal", "shared", or "income"' });
    }
    
    // If personal or income transaction, person field is required
    if (transaction_type === 'personal' || transaction_type === 'income') {
      if (!person || !['zaki', 'reda'].includes(person)) {
        return res.status(400).json({ error: 'Person field is required for personal and income transactions and must be "zaki" or "reda"' });
      }
    } else {
      // For shared transactions, person should be null
      if (person !== null && person !== undefined) {
        return res.status(400).json({ error: 'Person field should not be set for shared transactions' });
      }
    }
    
    const existingTransaction = await transactionModel.getTransactionById(id);
    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await transactionModel.updateTransaction(id, {
      date,
      amount: parseFloat(amount),
      description,
      category,
      payer,
      transaction_type,
      person: (transaction_type === 'personal' || transaction_type === 'income') ? person : null,
      notes
    });
    
    // Recalculate all balances
    await transactionModel.recalculateBalances();
    
    const updatedTransaction = await transactionModel.getTransactionById(id);
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    
    const transaction = await transactionModel.getTransactionById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await transactionModel.deleteTransaction(id);
    
    // Recalculate all balances
    await transactionModel.recalculateBalances();
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
}

async function getBalances(req, res) {
  try {
    const balances = await transactionModel.getBalances();
    res.json(balances);
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
}

async function getMonthlySummary(req, res) {
  try {
    const summary = await transactionModel.getMonthlySummary();
    res.json(summary);
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ error: 'Failed to fetch monthly summary' });
  }
}

async function exportCSV(req, res) {
  try {
    const transactions = await transactionModel.getAllTransactionsForExport();
    
    // Convert to CSV
    const headers = ['ID', 'Date', 'Amount', 'Description', 'Category', 'Payer', 'Transaction Type', 'Person', 'Notes', 'Created At', 'Updated At'];
    const csvRows = [headers.join(',')];
    
    transactions.forEach(transaction => {
      const row = [
        transaction.id,
        transaction.date,
        transaction.amount,
        `"${(transaction.description || '').replace(/"/g, '""')}"`,
        transaction.category,
        transaction.payer,
        transaction.transaction_type || 'shared',
        transaction.person || '',
        `"${(transaction.notes || '').replace(/"/g, '""')}"`,
        transaction.created_at,
        transaction.updated_at
      ];
      csvRows.push(row.join(','));
    });
    
    const csv = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBalances,
  getMonthlySummary,
  exportCSV
};

