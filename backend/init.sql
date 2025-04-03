-- Create tables
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pin VARCHAR(4) NOT NULL,
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('star', 'pulsa', 'maestro', 'mastercard', 'plus', 'visa'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  account_id VARCHAR(10) NOT NULL REFERENCES accounts(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('withdraw', 'deposit')),
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO accounts (id, name, balance, pin, card_type)
VALUES 
  ('1000', 'Liz Mancilla', 0, '1234', 'star'),
  ('2000', 'Penny Dollars', 0, '1234', 'pulsa'),
  ('3000', 'Rich McWallet', 0, '1234', 'maestro'),
  ('4000', 'Mini Card', 0, '1234', 'mastercard'),
  ('5000', 'Ima Customer', 0, '1234', 'plus'),
  ('6000', 'Penny Wise', 0, '1234', 'visa')