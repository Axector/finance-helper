/* eslint-disable @typescript-eslint/no-explicit-any */

export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'bills'
  | 'health'
  | 'education'
  | 'travel'
  | 'other';

export type IncomeCategory =
  | 'salary'
  | 'freelance'
  | 'investments'
  | 'other';

export type Category = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  otherCategory: string;
  description: string;
  date: string; // ISO date string
  accountId: string;
}

export type BudgetPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface BudgetPlan {
  id: string;
  category: Category;
  otherCategory: string;
  limit: number;
  period: BudgetPeriod;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
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

export interface User {
  email: string,
  budgetPlans?: any,
  transactions?: any,
}

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  investments: 'Investments',
  other: 'Other',
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Food & Dining',
  transport: 'Transport',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  health: 'Health',
  education: 'Education',
  travel: 'Travel',
  other: 'Other',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  ...INCOME_CATEGORY_LABELS,
  ...EXPENSE_CATEGORY_LABELS,
}

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

export type AccountData = {
  id: string,
  name: string,
  total: number,
  openDate: string,
};

export type FilteredAccountData = AccountData & {
  selected: boolean,
};

export type TransferData = {
  id: string,
}
