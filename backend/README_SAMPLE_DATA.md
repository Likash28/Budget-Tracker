# Sample Data Seeder for Budget Tracker

This document explains how to use the sample data seeder to populate your database with test data for the complete flow.

## Prerequisites

1. Make sure your backend is set up and running
2. Ensure the database is created and migrations are applied
3. Python environment with all dependencies installed

## Running the Sample Data Seeder

### Option 1: Direct Python Execution

```bash
cd backend
python scripts/seed_sample_data.py
```

### Option 2: Using Python Module

```bash
cd backend
python -m scripts.seed_sample_data
```

## What the Seeder Creates

### 1. Sample Users
- **John Doe** (john.doe@example.com) - Main user with complete data
- **Jane Smith** (jane.smith@example.com) - Secondary user for groups
- **Mike Wilson** (mike.wilson@example.com) - Secondary user for groups

**Password for all users**: `Password123!`

### 2. Sample Transactions (for John Doe)
- **Income Transactions**: Salary, Freelance, Investment Returns, Bonus
- **Expense Transactions**: Food, Transport, Entertainment, Shopping, Health, Utilities
- **Total Income**: ₹102,500
- **Total Expenses**: ₹45,000
- **Net Savings**: ₹57,500

### 3. Sample Budgets (for John Doe)
- Food: ₹8,000
- Transport: ₹5,000
- Entertainment: ₹3,000
- Shopping: ₹10,000
- Health: ₹4,000
- Utilities: ₹3,000
- Education: ₹5,000
- Travel: ₹15,000
- Other: ₹2,000

### 4. Sample Groups
- **Family Expenses**: John + Jane
- **Office Lunch Group**: John + Mike
- **Vacation Planning**: John + Jane + Mike

### 5. Sample Group Expenses
- Family grocery shopping and utilities
- Office lunch and coffee expenses
- Vacation hotel and flight bookings

## Testing the Complete Flow

After running the seeder, you can test the complete application flow:

### 1. Login
- Use `john.doe@example.com` with password `Password123!`

### 2. Dashboard
- View monthly overview with income, expenses, and savings
- See recent transactions
- Check financial health metrics

### 3. Transactions
- View all transactions with filtering options
- Add new transactions
- Edit or delete existing transactions

### 4. Budgets
- View budget utilization for each category
- Set new budget limits
- Monitor spending against budgets

### 5. Groups
- View all groups John is a member of
- Add/remove group members
- Create group expenses
- View group balances and settlements

### 6. Reports
- Generate monthly summary reports
- View 6-month trend analysis
- Check category breakdowns
- Analyze financial insights

## API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/categories` - Get transaction categories

### Transactions
- `GET /api/transactions/` - Get transactions with filters
- `POST /api/transactions/` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Budgets
- `GET /api/budgets/` - Get all budgets
- `POST /api/budgets/` - Create/update budget
- `GET /api/budgets/usage/{month}` - Get budget usage

### Groups
- `GET /api/groups/` - Get user's groups
- `POST /api/groups/` - Create group
- `GET /api/groups/{id}/members` - Get group members
- `POST /api/groups/{id}/members` - Add group member
- `DELETE /api/groups/{id}/members/{user_id}` - Remove group member
- `POST /api/groups/{id}/expenses` - Create group expense
- `GET /api/groups/{id}/balances` - Get group balances
- `POST /api/groups/{id}/settlements` - Create settlement

### Reports
- `GET /api/reports/summary` - Get monthly summary
- `GET /api/reports/trend` - Get trend data

## Data Validation

The seeder includes validation to prevent duplicate data:
- Users are only created if they don't already exist
- Transactions are checked for duplicates before creation
- Budgets are created only for new category-month combinations
- Groups and members are validated before creation

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure the database is running
   - Check database configuration in `app/db.py`

2. **Import Errors**
   - Make sure you're running from the backend directory
   - Ensure all dependencies are installed

3. **Duplicate Data**
   - The seeder is idempotent - it can be run multiple times safely
   - Existing data will not be duplicated

### Resetting Data

To start fresh:
1. Drop and recreate the database
2. Run migrations
3. Run the seeder again

## Customization

You can modify the seeder script to:
- Add more sample users
- Create different transaction patterns
- Adjust budget amounts
- Add more groups and expenses

The script is located at `backend/scripts/seed_sample_data.py`.
