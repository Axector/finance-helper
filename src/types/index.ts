export type TransactionType = 'income' | 'expense';

export type Category =
  | 'salary'
  | 'freelance'
  | 'investments'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'bills'
  | 'health'
  | 'education'
  | 'travel'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO date string
}

export type BudgetPeriod = 'daily' | 'monthly' | 'yearly';

export interface BudgetPlan {
  id: string;
  name: string;
  category: Category;
  limit: number;
  period: BudgetPeriod;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
}

export interface TimeSeriesPoint {
  label: string;
  income: number;
  expenses: number;
}

export interface BudgetProgress {
  plan: BudgetPlan;
  spent: number;
  remaining: number;
  percentage: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  investments: 'Investments',
  food: 'Food & Dining',
  transport: 'Transport',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  health: 'Health',
  education: 'Education',
  travel: 'Travel',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  salary: '#10b981',
  freelance: '#3b82f6',
  investments: '#8b5cf6',
  food: '#f59e0b',
  transport: '#06b6d4',
  entertainment: '#ec4899',
  shopping: '#f97316',
  bills: '#ef4444',
  health: '#14b8a6',
  education: '#6366f1',
  travel: '#a855f7',
  other: '#6b7280',
};

export const INCOME_CATEGORIES: Category[] = ['salary', 'freelance', 'investments', 'other'];
export const EXPENSE_CATEGORIES: Category[] = [
  'food',
  'transport',
  'entertainment',
  'shopping',
  'bills',
  'health',
  'education',
  'travel',
  'other',
];
