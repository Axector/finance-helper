import { Transaction, BudgetPlan } from '@/types';

const TRANSACTIONS_KEY = 'finance_helper_transactions';
const BUDGETS_KEY = 'finance_helper_budgets';
const SEEDED_KEY = 'finance_helper_seeded';

export function getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    // seedIfNeeded();
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
    // seedIfNeeded();
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

function seedIfNeeded(): void {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(SEEDED_KEY)) return;

    const now = new Date();
    const transactions: Transaction[] = [];

    // Generate 3 months of mock data
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

        // Monthly salary
        transactions.push({
            id: generateId() + monthOffset + 'sal',
            type: 'income',
            amount: 5200,
            category: 'salary',
            description: 'Monthly salary',
            date: new Date(month.getFullYear(), month.getMonth(), 1).toISOString(),
        });

        // Freelance income (some months)
        if (monthOffset % 2 === 0) {
            transactions.push({
                id: generateId() + monthOffset + 'free',
                type: 'income',
                amount: 1500,
                category: 'freelance',
                description: 'Freelance project',
                date: new Date(month.getFullYear(), month.getMonth(), 10).toISOString(),
            });
        }

        // Various expenses throughout month
        const expenses: Array<{ cat: Transaction['category']; desc: string; amount: number; day: number }> = [
            { cat: 'food', desc: 'Grocery shopping', amount: 320, day: 3 },
            { cat: 'food', desc: 'Restaurant dinner', amount: 85, day: 12 },
            { cat: 'food', desc: 'Coffee & snacks', amount: 45, day: 18 },
            { cat: 'transport', desc: 'Monthly transit pass', amount: 120, day: 1 },
            { cat: 'transport', desc: 'Uber rides', amount: 65, day: 15 },
            { cat: 'bills', desc: 'Electricity bill', amount: 95, day: 5 },
            { cat: 'bills', desc: 'Internet subscription', amount: 60, day: 5 },
            { cat: 'bills', desc: 'Phone bill', amount: 45, day: 7 },
            { cat: 'entertainment', desc: 'Streaming services', amount: 35, day: 1 },
            { cat: 'entertainment', desc: 'Movie tickets', amount: 30, day: 20 },
            { cat: 'shopping', desc: 'Clothing', amount: 150, day: 8 },
            { cat: 'health', desc: 'Gym membership', amount: 50, day: 1 },
            { cat: 'health', desc: 'Pharmacy', amount: 35, day: 14 },
            { cat: 'education', desc: 'Online course', amount: 29, day: 6 },
        ];

        expenses.forEach((exp, i) => {
            transactions.push({
                id: generateId() + monthOffset + 'e' + i,
                type: 'expense',
                amount: exp.amount + Math.round(Math.random() * 20 - 10),
                category: exp.cat,
                description: exp.desc,
                date: new Date(month.getFullYear(), month.getMonth(), exp.day).toISOString(),
            });
        });
    }

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const budgetPlans: BudgetPlan[] = [
        { id: generateId() + 'b1', name: 'Food Budget', category: 'food', limit: 500, period: 'monthly' },
        { id: generateId() + 'b2', name: 'Transport Budget', category: 'transport', limit: 200, period: 'monthly' },
        { id: generateId() + 'b3', name: 'Entertainment', category: 'entertainment', limit: 100, period: 'monthly' },
        { id: generateId() + 'b4', name: 'Shopping Limit', category: 'shopping', limit: 200, period: 'monthly' },
        { id: generateId() + 'b5', name: 'Daily Food', category: 'food', limit: 25, period: 'daily' },
    ];

    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgetPlans));
    localStorage.setItem(SEEDED_KEY, 'true');
}
