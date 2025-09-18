-- Create database tables and insert sample data
-- Converting from SQLite to PostgreSQL syntax

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Insert users data
INSERT INTO users (id, name, email, password_hash, created_at) VALUES
(1,'Alice Johnson','alice@budget.test','$2b$12$Z2beCaAOjtTQUsytopvXi.pDOF7O35cjO.MpvapeC7Hi1Hvhd7X.S','2025-09-13 11:27:08'),
(2,'Bob Smith','bob@budget.test','$2b$12$1u16XW7AgFtDIJ/7GPlJS.S4HLJ584sNWEytwu3RQR3iNKY2scJ6O','2025-09-13 11:27:08'),
(3,'Carol Davis','carol@budget.test','$2b$12$YMcZ1RWaFIWwfoR04ClVje9ttbwJnVypUv71gS8zitlTRqOWd..Ly','2025-09-13 11:27:08'),
(4,'Alice Johnson','alice@example.com','$2b$12$.6XQti9efSgBSkRll5oVleax40usw/uS90YWVFx4bXCU2dFiMIZUS','2025-09-15 05:16:38'),
(5,'Bob Smith','bob@example.com','$2b$12$tzR.8uWARINIQVjPCYNSPem2ftwznnC0jkiEFmeI/ZFT4KDF/hEd2','2025-09-15 05:16:38'),
(6,'Carol Davis','carol@example.com','$2b$12$nt9yGsle4mnPe5VKv0tOZeW9f/5oUZ0ji72FV2PtaBIn0hiLskbae','2025-09-15 05:16:38'),
(7,'Test User','test@example.com','$2b$12$tUUZ.gCa.DzPelSSAGPSnOJCVwhAwcXj1EGwIh.K2mFv5fLWXFsFm','2025-09-15 08:11:16'),
(8,'Likash Gunisetti','gunisettilikash@gmail.com','$2b$12$o75GypQfYyGfL87TIR8pke.xFIPk6jBWtV.KHQqLxwgTTC5UuB3EW','2025-09-15 08:12:18'),
(9,'Satish Vanga  ','satishv700@gmail.com','$2b$12$158ouQxyvsH.qfgxOcny2uBgqKwRHzXta8v1CATkUfBNKt.WziJCS','2025-09-15 10:26:51'),
(10,'vamshikrishna pothani','vamshipatel836@gmail.com','$2b$12$4RK6ZdXvp4blRsbWD54ihezhfj1fritfAfYO4hL/qEA.WthWuePG6','2025-09-16 04:55:27'),
(11,'vanga','vanga@123.com','$2b$12$sPnrABcLXDL817whKQN54ee.EUupaVVGRA9.0CP5mNJsXFyunrRx.','2025-09-16 05:24:33')
ON CONFLICT (id) DO NOTHING;

-- Insert transactions data (first 50 records to avoid length issues)
INSERT INTO transactions (id, user_id, amount, description, category, type, date, created_at) VALUES
(1,1,587.52,'Freelance income','Bonus','income','2025-09-20 16:57:08.770021','2025-09-13 11:27:08'),
(2,1,929.94,'Salary income','Freelance','income','2025-09-03 16:57:08.770021','2025-09-13 11:27:08'),
(3,1,2355.14,'Salary income','Investment','income','2025-09-22 16:57:08.770021','2025-09-13 11:27:08'),
(4,1,1088.67,'Investment income','Salary','income','2025-09-26 16:57:08.770021','2025-09-13 11:27:08'),
(5,1,108.74,'Expense for shopping','Transportation','expense','2025-09-16 16:57:08.770021','2025-09-13 11:27:08'),
(6,1,121.85,'Expense for food','Entertainment','expense','2025-09-28 16:57:08.770021','2025-09-13 11:27:08'),
(7,1,159.87,'Expense for transportation','Transportation','expense','2025-09-22 16:57:08.770021','2025-09-13 11:27:08'),
(8,1,170.07,'Expense for transportation','Healthcare','expense','2025-09-16 16:57:08.770021','2025-09-13 11:27:08'),
(9,1,148.64,'Expense for shopping','Healthcare','expense','2025-09-13 16:57:08.770021','2025-09-13 11:27:08'),
(10,1,23.36,'Expense for transportation','Healthcare','expense','2025-09-25 16:57:08.770021','2025-09-13 11:27:08'),
(11,1,79.32,'Expense for transportation','Shopping','expense','2025-09-27 16:57:08.770021','2025-09-13 11:27:08'),
(12,1,144.31,'Expense for bills','Entertainment','expense','2025-09-23 16:57:08.770021','2025-09-13 11:27:08'),
(13,1,166.31,'Expense for food','Shopping','expense','2025-09-17 16:57:08.770021','2025-09-13 11:27:08'),
(14,1,94.15,'Expense for food','Healthcare','expense','2025-09-28 16:57:08.770021','2025-09-13 11:27:08'),
(15,1,71.73,'Expense for food','Healthcare','expense','2025-09-05 16:57:08.770021','2025-09-13 11:27:08'),
(16,1,2458.15,'Bonus income','Salary','income','2025-08-11 16:57:08.770211','2025-09-13 11:27:08'),
(17,1,1435.84,'Salary income','Investment','income','2025-08-21 16:57:08.770211','2025-09-13 11:27:08'),
(18,1,2554.78,'Salary income','Bonus','income','2025-08-04 16:57:08.770211','2025-09-13 11:27:08'),
(19,1,609.30,'Investment income','Salary','income','2025-08-14 16:57:08.770211','2025-09-13 11:27:08'),
(20,1,81.73,'Expense for bills','Shopping','expense','2025-08-03 16:57:08.770211','2025-09-13 11:27:08'),
(21,1,171.27,'Expense for bills','Shopping','expense','2025-08-13 16:57:08.770211','2025-09-13 11:27:08'),
(22,1,190.20,'Expense for healthcare','Shopping','expense','2025-08-16 16:57:08.770211','2025-09-13 11:27:08'),
(23,1,115.52,'Expense for transportation','Bills','expense','2025-08-05 16:57:08.770211','2025-09-13 11:27:08'),
(24,1,172.26,'Expense for food','Bills','expense','2025-08-23 16:57:08.770211','2025-09-13 11:27:08'),
(25,1,190.87,'Expense for healthcare','Food','expense','2025-08-11 16:57:08.770211','2025-09-13 11:27:08'),
(26,1,143.74,'Expense for bills','Shopping','expense','2025-08-16 16:57:08.770211','2025-09-13 11:27:08'),
(27,1,118.74,'Expense for entertainment','Healthcare','expense','2025-08-17 16:57:08.770211','2025-09-13 11:27:08'),
(28,1,14.98,'Expense for entertainment','Bills','expense','2025-08-04 16:57:08.770211','2025-09-13 11:27:08'),
(29,1,15.96,'Expense for bills','Healthcare','expense','2025-08-26 16:57:08.770211','2025-09-13 11:27:08'),
(30,1,193.09,'Expense for entertainment','Food','expense','2025-08-30 16:57:08.770211','2025-09-13 11:27:08'),
(31,1,28.33,'Expense for transportation','Transportation','expense','2025-08-24 16:57:08.770211','2025-09-13 11:27:08'),
(32,1,158.87,'Expense for transportation','Bills','expense','2025-08-17 16:57:08.770211','2025-09-13 11:27:08'),
(33,1,197.45,'Expense for transportation','Entertainment','expense','2025-08-16 16:57:08.770211','2025-09-13 11:27:08'),
(34,1,96.01,'Expense for healthcare','Bills','expense','2025-08-18 16:57:08.770211','2025-09-13 11:27:08'),
(35,1,1712.26,'Investment income','Investment','income','2025-07-09 16:57:08.770418','2025-09-13 11:27:08'),
(36,1,1380.20,'Freelance income','Freelance','income','2025-07-05 16:57:08.770418','2025-09-13 11:27:08'),
(37,1,2196.41,'Investment income','Freelance','income','2025-07-21 16:57:08.770418','2025-09-13 11:27:08'),
(38,1,2782.09,'Investment income','Investment','income','2025-07-26 16:57:08.770418','2025-09-13 11:27:08'),
(39,1,182.12,'Expense for healthcare','Food','expense','2025-07-14 16:57:08.770418','2025-09-13 11:27:08'),
(40,1,16.57,'Expense for shopping','Food','expense','2025-07-18 16:57:08.770418','2025-09-13 11:27:08'),
(41,1,139.83,'Expense for shopping','Entertainment','expense','2025-07-21 16:57:08.770418','2025-09-13 11:27:08'),
(42,1,113.40,'Expense for transportation','Food','expense','2025-07-29 16:57:08.770418','2025-09-13 11:27:08'),
(43,1,155.24,'Expense for entertainment','Bills','expense','2025-07-24 16:57:08.770418','2025-09-13 11:27:08'),
(44,1,136.97,'Expense for healthcare','Entertainment','expense','2025-07-16 16:57:08.770418','2025-09-13 11:27:08'),
(45,1,63.46,'Expense for transportation','Shopping','expense','2025-07-31 16:57:08.770418','2025-09-13 11:27:08'),
(46,1,44.38,'Expense for transportation','Bills','expense','2025-07-26 16:57:08.770418','2025-09-13 11:27:08'),
(47,1,143.77,'Expense for transportation','Shopping','expense','2025-07-23 16:57:08.770418','2025-09-13 11:27:08'),
(48,1,22.38,'Expense for transportation','Shopping','expense','2025-07-17 16:57:08.770418','2025-09-13 11:27:08'),
(49,1,99.91,'Expense for entertainment','Food','expense','2025-07-17 16:57:08.770418','2025-09-13 11:27:08'),
(50,1,197.19,'Expense for bills','Food','expense','2025-07-22 16:57:08.770418','2025-09-13 11:27:08')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences to continue from the highest ID
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));
