const { pool } = require('../config/database');

async function getAllTransactions(filters = {}) {
  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params = [];

  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters.payer) {
    query += ' AND payer = ?';
    params.push(filters.payer);
  }

  if (filters.startDate) {
    query += ' AND date >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ' AND date <= ?';
    params.push(filters.endDate);
  }

  if (filters.search) {
    query += ' AND description LIKE ?';
    params.push(`%${filters.search}%`);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  const [rows] = await pool.execute(query, params);
  return rows;
}

async function getTransactionById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function createTransaction(transaction) {
  const { date, amount, description, category, payer, transaction_type, person, notes } = transaction;
  const [result] = await pool.execute(
    `INSERT INTO transactions (date, amount, description, category, payer, transaction_type, person, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [date, amount, description, category, payer, transaction_type || 'shared', person || null, notes || null]
  );
  return result.insertId;
}

async function updateTransaction(id, transaction) {
  const { date, amount, description, category, payer, transaction_type, person, notes } = transaction;
  await pool.execute(
    `UPDATE transactions 
     SET date = ?, amount = ?, description = ?, category = ?, payer = ?, transaction_type = ?, person = ?, notes = ?
     WHERE id = ?`,
    [date, amount, description, category, payer, transaction_type || 'shared', person || null, notes || null, id]
  );
}

async function deleteTransaction(id) {
  await pool.execute('DELETE FROM transactions WHERE id = ?', [id]);
}

async function recalculateBalances() {
  // Get all transactions
  const transactions = await getAllTransactions();
  
  // Reset balances
  await pool.execute('UPDATE users SET balance = 0');
  
  // Recalculate balances
  for (const transaction of transactions) {
    const transactionType = transaction.transaction_type || 'shared';
    const amount = parseFloat(transaction.amount);
    
    if (transactionType === 'personal') {
      // Personal transaction: only affects the specified person's wallet
      const person = transaction.person;
      if (person === 'zaki' || person === 'reda') {
        // For personal transactions, only the person's wallet is affected
        // The amount decreases their wallet (expense)
        // Payer field is informational only - doesn't affect other person's balance
        await pool.execute(
          'UPDATE users SET balance = balance - ? WHERE name = ?',
          [amount, person]
        );
      }
    } else if (transactionType === 'income') {
      // Income transaction: only affects the specified person's wallet
      const person = transaction.person;
      if (person === 'zaki' || person === 'reda') {
        // For income transactions, only the person's wallet is affected
        // The amount increases their wallet (income)
        await pool.execute(
          'UPDATE users SET balance = balance + ? WHERE name = ?',
          [amount, person]
        );
      }
    } else {
      // Shared transaction: split 50/50
      const halfAmount = amount / 2;
      
      if (transaction.payer === 'zaki') {
        // Zaki paid, so Zaki is owed half, Reda owes half
        await pool.execute(
          'UPDATE users SET balance = balance + ? WHERE name = ?',
          [halfAmount, 'zaki']
        );
        await pool.execute(
          'UPDATE users SET balance = balance - ? WHERE name = ?',
          [halfAmount, 'reda']
        );
      } else if (transaction.payer === 'reda') {
        // Reda paid, so Reda is owed half, Zaki owes half
        await pool.execute(
          'UPDATE users SET balance = balance + ? WHERE name = ?',
          [halfAmount, 'reda']
        );
        await pool.execute(
          'UPDATE users SET balance = balance - ? WHERE name = ?',
          [halfAmount, 'zaki']
        );
      }
      // If payer is 'both', no balance change (both paid their share on the spot)
    }
  }
}

async function updateBalancesForTransaction(transaction, isNew = true) {
  if (!isNew) {
    // For updates, we need to recalculate from scratch
    await recalculateBalances();
    return;
  }

  const transactionType = transaction.transaction_type || 'shared';
  const amount = parseFloat(transaction.amount);

  if (transactionType === 'personal') {
    // Personal transaction: only affects the specified person's wallet
    const person = transaction.person;
    if (person === 'zaki' || person === 'reda') {
      // For personal transactions, only the person's wallet is affected
      // The amount decreases their wallet (expense)
      // Payer field is informational only - doesn't affect other person's balance
      await pool.execute(
        'UPDATE users SET balance = balance - ? WHERE name = ?',
        [amount, person]
      );
    }
  } else if (transactionType === 'income') {
    // Income transaction: only affects the specified person's wallet
    const person = transaction.person;
    if (person === 'zaki' || person === 'reda') {
      // For income transactions, only the person's wallet is affected
      // The amount increases their wallet (income)
      await pool.execute(
        'UPDATE users SET balance = balance + ? WHERE name = ?',
        [amount, person]
      );
    }
  } else {
    // Shared transaction: split 50/50
    const halfAmount = amount / 2;
    
    if (transaction.payer === 'zaki') {
      await pool.execute(
        'UPDATE users SET balance = balance + ? WHERE name = ?',
        [halfAmount, 'zaki']
      );
      await pool.execute(
        'UPDATE users SET balance = balance - ? WHERE name = ?',
        [halfAmount, 'reda']
      );
    } else if (transaction.payer === 'reda') {
      await pool.execute(
        'UPDATE users SET balance = balance + ? WHERE name = ?',
        [halfAmount, 'reda']
      );
      await pool.execute(
        'UPDATE users SET balance = balance - ? WHERE name = ?',
        [halfAmount, 'zaki']
      );
    }
    // If payer is 'both', no balance change needed (both paid their share on the spot)
  }
}

async function getBalances() {
  const [rows] = await pool.execute('SELECT * FROM users ORDER BY id');
  return rows;
}

async function getMonthlySummary() {
  const [rows] = await pool.execute(`
    SELECT 
      DATE_FORMAT(date, '%Y-%m') as month,
      category,
      SUM(amount) as total,
      COUNT(*) as count
    FROM transactions
    GROUP BY DATE_FORMAT(date, '%Y-%m'), category
    ORDER BY month DESC, category
  `);
  return rows;
}

async function getAllTransactionsForExport() {
  const [rows] = await pool.execute(`
    SELECT 
      id,
      date,
      amount,
      description,
      category,
      payer,
      transaction_type,
      person,
      notes,
      created_at,
      updated_at
    FROM transactions
    ORDER BY date DESC, created_at DESC
  `);
  return rows;
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  recalculateBalances,
  updateBalancesForTransaction,
  getBalances,
  getMonthlySummary,
  getAllTransactionsForExport
};

