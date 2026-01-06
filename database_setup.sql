-- Expense Tracker Database Setup Script
-- Run this in MySQL Workbench

-- Create database
CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create transactions table with all columns including transaction_type and person
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  payer ENUM('zaki', 'reda', 'both') NOT NULL,
  transaction_type ENUM('personal', 'shared', 'income') NOT NULL DEFAULT 'shared',
  person VARCHAR(50) NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- If transactions table already exists but doesn't have transaction_type column, add it
-- Check and add transaction_type column if missing
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'expense_tracker' 
  AND TABLE_NAME = 'transactions' 
  AND COLUMN_NAME = 'transaction_type'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE transactions ADD COLUMN transaction_type ENUM(''personal'', ''shared'', ''income'') NOT NULL DEFAULT ''shared''',
  'SELECT ''Column transaction_type already exists'' AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure transaction_type column includes 'income' (modify if it exists but doesn't have income)
ALTER TABLE transactions 
MODIFY COLUMN transaction_type ENUM('personal', 'shared', 'income') NOT NULL DEFAULT 'shared';

-- Check and add person column if missing
SET @col_exists_person = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'expense_tracker' 
  AND TABLE_NAME = 'transactions' 
  AND COLUMN_NAME = 'person'
);

SET @sql_person = IF(@col_exists_person = 0,
  'ALTER TABLE transactions ADD COLUMN person VARCHAR(50) NULL',
  'SELECT ''Column person already exists'' AS message'
);
PREPARE stmt_person FROM @sql_person;
EXECUTE stmt_person;
DEALLOCATE PREPARE stmt_person;

-- Initialize users if they don't exist
INSERT IGNORE INTO users (id, name, balance) VALUES
(1, 'zaki', 0),
(2, 'reda', 0);

-- Update any existing transactions to have default transaction_type if NULL
UPDATE transactions 
SET transaction_type = 'shared' 
WHERE transaction_type IS NULL OR transaction_type = '';

-- Show confirmation
SELECT 'Database setup completed successfully!' AS status;
SELECT 'Users table:' AS info;
SELECT * FROM users;
SELECT 'Transactions table structure:' AS info;
DESCRIBE transactions;

