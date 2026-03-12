import { Transaction, BudgetPlan, User } from '@/types';
import DataBaseController from './firebase';
import { compareHashPassword, hashPassword } from './bcrypt';

const TRANSACTIONS_KEY = 'finance_helper_transactions';
const BUDGETS_KEY = 'finance_helper_budgets';
const USER_KEY = 'finance_helper_user';
const LOGGER = console.log;

export function getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function saveTransactions(transactions: Transaction[], isInitial: boolean = false): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

    if (isInitial) return;
    updateUserData(getUserData());
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

export function saveBudgetPlans(plans: BudgetPlan[], isInitial: boolean = false): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(plans));

    if (isInitial) return;
    updateUserData(getUserData());
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

export function saveUser(email: string): boolean {
    if (typeof window === 'undefined') return false;

    localStorage.setItem(USER_KEY, email);
    return true;
}

export function getUserData(): string {
    if (typeof window === 'undefined') return '';

    return localStorage.getItem(USER_KEY) || '';
}

export function isUserLoggedIn(): boolean {
    return !!getUserData();
}

export async function createUser(email: string, password: string): Promise<boolean> {
    try {
        const userExists = await checkUser(email);
        if (userExists) return false;

        const hashedPassword = await hashPassword(password);
        await DataBaseController.update({ email, password: hashedPassword }, email);

        return true;
    } catch (e) {
        LOGGER('XXX createUser', e);
        return false;
    }
}

export async function checkUser(email: string): Promise<boolean> {
    const user = await DataBaseController.read(email);
    return !!user;
}

export async function getUser(email: string, password: string): Promise<User | null> {
    try {
        const user = await DataBaseController.read(email);
        LOGGER('XXX getUser', user);
        if (!user) return null;

        const { password: hashedPassword, ...otherUserData } = user;
        const correctPassword = await compareHashPassword(password, hashedPassword);
        if (!correctPassword) return null;

        return otherUserData;
    } catch (e) {
        LOGGER('XXX getUser', e);
        return null;
    }
}

export async function loginUser(email: string, password: string): Promise<boolean> {
    const user = await getUser(email, password);
    if (!user) return false;
    LOGGER('XXX loginUser', user);

    const { budgetPlans = null } = user;
    if (budgetPlans) {
        saveBudgetPlans(JSON.parse(budgetPlans), true);
    }

    const { transactions = null } = user;
    if (transactions) {
        saveTransactions(JSON.parse(transactions), true);
    }

    saveUser(email);
    return true;
}

export async function logoutUser() {
    saveUser('');
    saveTransactions([]);
    saveBudgetPlans([]);
}

export async function updateUserData(email: string): Promise<boolean> {
    try {
        if (!email) return false;

        const user = await DataBaseController.read(email);
        if (!user) return false;

        const { email: userEmail, password: userPassword } = user;
        const budgetPlans = JSON.stringify(getBudgetPlans());
        const transactions = JSON.stringify(getTransactions());
        const newUserData = {
            email: userEmail,
            password: userPassword,
            budgetPlans,
            transactions,
        };

        await DataBaseController.update(newUserData, email);

        return true;
    } catch (e) {
        LOGGER('XXX updateUserData', e);
        return false;
    }
}

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
