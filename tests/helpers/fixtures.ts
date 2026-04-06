// Shared test data fixtures used across integration tests.

export const ADMIN_CREDENTIALS = {
  email: 'admin@finance.dev',
  password: 'Admin@12345',
};

export const ANALYST_CREDENTIALS = {
  email: 'analyst@finance.dev',
  password: 'Analyst@12345',
};

export const VIEWER_CREDENTIALS = {
  email: 'viewer@finance.dev',
  password: 'Viewer@12345',
};

export const VALID_RECORD = {
  type: 'INCOME',
  amount: 1000.00,
  category: 'SALARY',
  date: '2024-01-15T00:00:00.000Z',
  description: 'Test salary record',
};

export const VALID_EXPENSE = {
  type: 'EXPENSE',
  amount: 250.50,
  category: 'FOOD',
  date: '2024-02-01T00:00:00.000Z',
  description: 'Groceries',
};

export const randomEmail = () =>
  `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
