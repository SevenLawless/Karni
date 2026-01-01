# Expense Tracker Web App

A simple web application for tracking shared apartment expenses between two users. The app automatically splits costs 50/50 and calculates who owes whom.

## Features

- **Dashboard**: View current balances and quick statistics
- **Transaction Management**: Add, edit, and delete transactions with full validation
- **Automatic Balance Calculation**: Costs are automatically split 50/50
- **Search & Filter**: Filter transactions by category, payer, date range, and search by description
- **Monthly Summary**: View expenses broken down by month and category
- **CSV Export**: Export all transactions for external review
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Beautiful dark theme by default

## Tech Stack

- **Frontend**: React 18
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Styling**: CSS with CSS Variables for theming

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (MySQL Workbench ready as per your setup)
- npm or yarn

## Quick Start (Windows)

**Easiest way to start the app:**

1. Double-click `start-app.bat` in the project root
2. The script will:
   - Check and install dependencies if needed
   - Start the backend server (port 5000)
   - Start the frontend server (port 3000)
   - Open your browser automatically

The app will be available at `http://localhost:3000`

**Note:** Make sure MySQL is running and configured in `backend/.env` before starting.

## Manual Setup Instructions

### 1. Database Setup

Make sure MySQL is running and create a database (or the app will create it automatically).

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory (copy from `.env.example`):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expense_tracker
PORT=5000
```

4. Start the backend server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend will automatically create the database and tables on first run.

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000` (or another port if 3000 is busy).

## Usage

1. **Add a Transaction**: 
   - Click "Add Transaction" tab
   - Fill in the form (date, amount, description, category, payer, notes)
   - Submit - balances are automatically updated

2. **View Dashboard**: 
   - See current balances and who owes whom
   - View total expenses and monthly statistics

3. **Manage Transactions**: 
   - View all transactions in the "Transactions" tab
   - Use filters to find specific transactions
   - Edit or delete transactions as needed

4. **Monthly Summary**: 
   - View expenses grouped by month and category
   - See totals for each month

5. **Export Data**: 
   - Click "Export CSV" button in the Transactions tab
   - Download all transactions for external review

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection and initialization
│   ├── controllers/
│   │   └── transactionController.js  # API request handlers
│   ├── models/
│   │   └── transactionModel.js       # Database queries
│   ├── routes/
│   │   └── transactions.js           # API routes
│   ├── server.js                     # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── TransactionForm.js
│   │   │   ├── TransactionList.js
│   │   │   ├── MonthlySummary.js
│   │   │   └── FilterBar.js
│   │   ├── services/
│   │   │   └── api.js               # API service layer
│   │   ├── styles/
│   │   │   └── App.css              # Global styles
│   │   ├── App.js                   # Main app component
│   │   └── index.js                 # React entry point
│   └── package.json
└── README.md
```

## API Endpoints

- `GET /api/transactions` - Get all transactions (with optional filters)
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction
- `GET /api/transactions/balances` - Get current balances
- `GET /api/transactions/summary/monthly` - Get monthly summary
- `GET /api/transactions/export/csv` - Export transactions as CSV

## Balance Calculation Logic

- When a transaction is created, the amount is split 50/50
- If "user" pays: user balance increases by amount/2, friend balance decreases by amount/2
- If "friend" pays: friend balance increases by amount/2, user balance decreases by amount/2
- Positive balance = they are owed money
- Negative balance = they owe money
- When transactions are updated or deleted, all balances are recalculated from scratch

## Notes

- The app is designed for two users: "user" and "friend"
- All costs are automatically split 50/50
- Data is persisted in MySQL database
- The app uses dark mode by default
- Fully responsive for mobile devices

