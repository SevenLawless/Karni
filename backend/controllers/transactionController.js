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
    const { date, amount, description, category, payer, notes } = req.body;
    
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
    
    const transactionId = await transactionModel.createTransaction({
      date,
      amount: parseFloat(amount),
      description,
      category,
      payer,
      notes
    });
    
    // Update balances
    const transaction = await transactionModel.getTransactionById(transactionId);
    await transactionModel.updateBalancesForTransaction(transaction, true);
    
    const newTransaction = await transactionModel.getTransactionById(transactionId);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
}

async function updateTransaction(req, res) {
  try {
    const { date, amount, description, category, payer, notes } = req.body;
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
    const headers = ['ID', 'Date', 'Amount', 'Description', 'Category', 'Payer', 'Notes', 'Created At', 'Updated At'];
    const csvRows = [headers.join(',')];
    
    transactions.forEach(transaction => {
      const row = [
        transaction.id,
        transaction.date,
        transaction.amount,
        `"${(transaction.description || '').replace(/"/g, '""')}"`,
        transaction.category,
        transaction.payer,
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

