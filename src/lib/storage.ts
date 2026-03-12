import { Transaction, BudgetPlan } from '@/types';

const TRANSACTIONS_KEY = 'finance_helper_transactions';
const BUDGETS_KEY = 'finance_helper_budgets';

export function getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function saveTransactions(transactions: Transaction[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function addTransaction(transaction: Transaction): Transaction[] {
    const transactions = getTransactions();
    transactions.unshift(transaction);
    saveTransactions(transactions);
    return transactions;
}

export function deleteTransaction(id: string): Transaction[] {
    const transactions = getTransactions().filter((t) => t.id !== id);
    saveTransactions(transactions);
    return transactions;
}

export function getBudgetPlans(): BudgetPlan[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(BUDGETS_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function saveBudgetPlans(plans: BudgetPlan[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(plans));
}

export function addBudgetPlan(plan: BudgetPlan): BudgetPlan[] {
    const plans = getBudgetPlans();
    plans.push(plan);
    saveBudgetPlans(plans);
    return plans;
}

export function deleteBudgetPlan(id: string): BudgetPlan[] {
    const plans = getBudgetPlans().filter((p) => p.id !== id);
    saveBudgetPlans(plans);
    return plans;
}

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
