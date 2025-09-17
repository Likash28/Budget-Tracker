# Budget Tracker - Supabase Database Schema

## Overview
This document contains the complete database schema for the Budget Tracker application. Use this to create tables in your Supabase project.

## Database Tables

### 1. Users Table
**Table Name:** `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL PRIMARY KEY` | NOT NULL, AUTO_INCREMENT | Unique user identifier |
| `name` | `VARCHAR(100)` | NOT NULL | User's full name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | User's email address |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Hashed password |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Account creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `email`

**SQL:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### 2. Transactions Table
**Table Name:** `transactions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL PRIMARY KEY` | NOT NULL, AUTO_INCREMENT | Unique transaction identifier |
| `user_id` | `INTEGER` | NOT NULL, FOREIGN KEY | Reference to users.id |
| `amount` | `DECIMAL(10,2)` | NOT NULL | Transaction amount |
| `description` | `VARCHAR(255)` | NOT NULL | Transaction description |
| `category` | `VARCHAR(100)` | NOT NULL | Transaction category |
| `type` | `VARCHAR(20)` | NOT NULL | 'income' or 'expense' |
| `date` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Transaction date |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Record creation timestamp |

**Foreign Keys:**
- `user_id` → `users.id`

**Indexes:**
- Primary key on `id`
- Index on `user_id`

**SQL:**
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
```

### 3. Budgets Table
**Table Name:** `budgets`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL PRIMARY KEY` | NOT NULL, AUTO_INCREMENT | Unique budget identifier |
| `user_id` | `INTEGER` | NOT NULL, FOREIGN KEY | Reference to users.id |
| `category` | `VARCHAR(100)` | NOT NULL | Budget category |
| `limit` | `DECIMAL(10,2)` | NOT NULL | Budget limit amount |
| `month` | `VARCHAR(7)` | NOT NULL | Budget month (YYYY-MM format) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Record creation timestamp |

**Foreign Keys:**
- `user_id` → `users.id`

**Indexes:**
- Primary key on `id`
- Index on `user_id`

**SQL:**
```sql
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    category VARCHAR(100) NOT NULL,
    limit DECIMAL(10,2) NOT NULL,
    month VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
```

### 4. Groups Table
**Table Name:** `groups`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL PRIMARY KEY` | NOT NULL, AUTO_INCREMENT | Unique group identifier |
| `name` | `VARCHAR(100)` | NOT NULL | Group name |
| `description` | `TEXT` | NULL | Group description |
| `created_by` | `INTEGER` | NOT NULL, FOREIGN KEY | Reference to users.id |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Group creation timestamp |

**Foreign Keys:**
- `created_by` → `users.id`

**Indexes:**
- Primary key on `id`
- Index on `created_by`

**SQL:**
```sql
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_groups_created_by ON groups(created_by);
```

### 5. Group Members Table
**Table Name:** `group_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL PRIMARY KEY` | NOT NULL, AUTO_INCREMENT | Unique membership identifier |
| `group_id` | `INTEGER` | NOT NULL, FOREIGN KEY | Reference to groups.id |
| `user_id` | `INTEGER` | NOT NULL, FOREIGN KEY | Reference to users.id |
| `joined_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Join timestamp |

**Foreign Keys:**
- `group_id` → `groups.id`
- `user_id` → `users.id`

**Indexes:**
- Primary key on `id`
- Index on `group_id`
- Index on `user_id`
- Unique constraint on `(group_id, user_id)`

**SQL:**
```sql
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
```

### 6. Group Expenses Table
**Table Name:** `group_expenses`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL PRIMARY KEY` | NOT NULL, AUTO_INCREMENT | Unique expense identifier |
| `group_id` | `INTEGER` | NOT NULL, FOREIGN KEY | Reference to groups.id |
| `paid_by_user_id` | `INTEGER` | NOT NULL, FOREIGN KEY | Reference to users.id |
| `amount` | `DECIMAL(10,2)` | NOT NULL | Expense amount |
| `description` | `VARCHAR(255)` | NOT NULL | Expense description |
| `category` | `VARCHAR(100)` | NOT NULL | Expense category |
| `date` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Expense date |
| `splits` | `JSONB` | NOT NULL | Split information as JSON |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Record creation timestamp |

**Foreign Keys:**
- `group_id` → `groups.id`
- `paid_by_user_id` → `users.id`

**Indexes:**
- Primary key on `id`
- Index on `group_id`
- Index on `paid_by_user_id`

**SQL:**
```sql
CREATE TABLE group_expenses (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    paid_by_user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    splits JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_group_expenses_group_id ON group_expenses(group_id);
CREATE INDEX idx_group_expenses_paid_by_user_id ON group_expenses(paid_by_user_id);
```

### 7. Settlements Table
**Table Name:** `settlements`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL PRIMARY KEY` | NOT NULL, AUTO_INCREMENT | Unique settlement identifier |
| `group_id` | `INTEGER` | NOT NULL, FOREIGN KEY | Reference to groups.id |
| `from_user_id` | `INTEGER` | NOT NULL, FOREIGN KEY | Reference to users.id |
| `to_user_id` | `INTEGER` | NOT NULL, FOREIGN KEY | Reference to users.id |
| `amount` | `DECIMAL(10,2)` | NOT NULL | Settlement amount |
| `description` | `VARCHAR(255)` | NULL | Settlement description |
| `settled_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW() | Settlement timestamp |

**Foreign Keys:**
- `group_id` → `groups.id`
- `from_user_id` → `users.id`
- `to_user_id` → `users.id`

**Indexes:**
- Primary key on `id`
- Index on `group_id`
- Index on `from_user_id`
- Index on `to_user_id`

**SQL:**
```sql
CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    to_user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    settled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_settlements_group_id ON settlements(group_id);
CREATE INDEX idx_settlements_from_user_id ON settlements(from_user_id);
CREATE INDEX idx_settlements_to_user_id ON settlements(to_user_id);
```

## Complete SQL Script

Here's the complete SQL script to create all tables in Supabase:

```sql
-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Create transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Create budgets table
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    category VARCHAR(100) NOT NULL,
    limit DECIMAL(10,2) NOT NULL,
    month VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);

-- Create groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_groups_created_by ON groups(created_by);

-- Create group_members table
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

-- Create group_expenses table
CREATE TABLE group_expenses (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    paid_by_user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    splits JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_group_expenses_group_id ON group_expenses(group_id);
CREATE INDEX idx_group_expenses_paid_by_user_id ON group_expenses(paid_by_user_id);

-- Create settlements table
CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    to_user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    settled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_settlements_group_id ON settlements(group_id);
CREATE INDEX idx_settlements_from_user_id ON settlements(from_user_id);
CREATE INDEX idx_settlements_to_user_id ON settlements(to_user_id);
```

## How to Use This Schema

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the complete SQL script above**
4. **Run the script to create all tables**
5. **Verify tables are created in the Table Editor**

## Sample Data Structure

### JSON Structure for `splits` column in `group_expenses`:
```json
[
    {"user_id": 1, "weight": 1.0},
    {"user_id": 2, "weight": 1.0},
    {"user_id": 3, "weight": 2.0}
]
```

This schema maintains all the relationships and constraints from your original SQLite database and is optimized for PostgreSQL/Supabase.
