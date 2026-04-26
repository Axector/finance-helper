import { Transaction, BudgetPlan, User, AccountData } from '@/types';
import DataBaseController from './firebase';
import { compareHashPassword, hashPassword } from './bcrypt';
import { getCurrentDate } from './common';
import Logger from '@/lib/logger';

const TRANSACTIONS_KEY = 'finance_helper_transactions';
const BUDGETS_KEY = 'finance_helper_budgets';
const ACCOUNTS_KEY = 'finance_helper_accounts';
const USER_KEY = 'finance_helper_user';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/* Transactions */

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(TRANSACTIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getTransaction(id: string): Transaction | null {
  if (!id) return null;

  const transaction = getTransactions().find((t) => t.id === id);
  return transaction ?? null;
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function addTransactions(newTransactions: Transaction[]): Transaction[] {
  const transactions = getTransactions();
  transactions.unshift(...newTransactions);
  saveTransactions(transactions);

  updateAccountsTotalsByTransactions(newTransactions.map((t) => ({ transaction: t })));

  return transactions;
}

export function addTransaction(transaction: Transaction): Transaction[] {
  const transactions = addTransactions([transaction]);
  return transactions;
}

export function udpateTransaction(transaction: Transaction): Transaction[] {
  const transactions = getTransactions();
  const currentIndex = transactions.findIndex((t) => transaction.id === t.id);
  if (!transactions[currentIndex]) return transactions;

  updateAccountTotalByTransaction(transaction, transactions[currentIndex]);

  transactions[currentIndex] = transaction;
  saveTransactions(transactions);

  return transactions;
}

export function deleteTransaction(id: string): Transaction[] {
  const transaction = getTransaction(id);
  if (!transaction) return getTransactions();
  updateAccountTotalByTransaction({ ...transaction, amount: 0 }, transaction);

  const transactions = getTransactions().filter((t) => t.id !== id);
  saveTransactions(transactions);
  return transactions;
}

/* Budget Plans */

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

export function updateBudgetPlan(plan: BudgetPlan): BudgetPlan[] {
  const plans = getBudgetPlans();
  const newPlans = plans.map((p) => {
    return p.id === plan.id ? plan : p;
  });
  saveBudgetPlans(newPlans);
  return newPlans;
}

export function deleteBudgetPlan(id: string): BudgetPlan[] {
  const plans = getBudgetPlans().filter((p) => p.id !== id);
  saveBudgetPlans(plans);
  return plans;
}

/* User */

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

    return await loginUser(email, password);
  } catch (e) {
    Logger.warn('XXX createUser', e);
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
    Logger.log('XXX getUser', user);
    if (!user) return null;

    const { password: hashedPassword, ...otherUserData } = user;
    const correctPassword = await compareHashPassword(password, hashedPassword);
    if (!correctPassword) return null;

    return otherUserData;
  } catch (e) {
    Logger.warn('XXX getUser', e);
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<boolean> {
  const user = await getUser(email, password);
  if (!user) return false;
  Logger.log('XXX loginUser', user);

  const { budgetPlans = null } = user;
  if (budgetPlans) {
    saveBudgetPlans(JSON.parse(budgetPlans), true);
  }

  const { transactions = null } = user;
  if (transactions) {
    saveTransactions(JSON.parse(transactions));
  }

  const { accounts = null } = user;
  if (accounts) {
    saveAccounts(JSON.parse(accounts), true);
  }

  saveUser(email);
  return true;
}

export async function logoutUser() {
  saveUser('');
  saveTransactions([]);
  saveBudgetPlans([], true);
  saveAccounts([], true);
}

export async function updateUserData(email: string): Promise<boolean> {
  try {
    if (!email) return false;

    const user = await DataBaseController.read(email);
    if (!user) return false;

    const { email: userEmail, password: userPassword } = user;
    const budgetPlans = JSON.stringify(getBudgetPlans());
    const transactions = JSON.stringify(getTransactions());
    const accounts = JSON.stringify(getAccounts());
    const newUserData = {
      email: userEmail,
      password: userPassword,
      budgetPlans,
      transactions,
      accounts,
    };

    await DataBaseController.update(newUserData, email);

    return true;
  } catch (e) {
    Logger.warn('XXX updateUserData', e);
    return false;
  }
}

/* Accounts */

export const getAccounts = (): AccountData[] => {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem(ACCOUNTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export const getAccount = (id: string): AccountData | null => {
  if (!id) return null;

  const account = getAccounts().find((a) => a.id === id);
  return account ?? null;
}

export const saveAccounts = (accounts: AccountData[], isInitial: boolean = false): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

  if (isInitial) return;
  updateUserData(getUserData());
}

export const addAccount = (account: AccountData): AccountData[] => {
  const accounts = getAccounts();
  accounts.push(account);
  saveAccounts(accounts);
  return accounts;
}

export const updateAccount = (account: AccountData): AccountData[] => {
  const accounts = getAccounts();
  const currentIndex = accounts.findIndex((a) => account.id === a.id);
  if (!accounts[currentIndex]) return accounts;

  accounts[currentIndex] = account;
  saveAccounts(accounts);
  return accounts;
}

export const updateAccounts = (newAccounts: AccountData[]): AccountData[] => {
  const accounts = getAccounts();
  const resAccounts = accounts.map((a) => {
    const account = newAccounts.find((newA) => newA.id === a.id);
    return account ?? a;
  })

  saveAccounts(resAccounts);
  return resAccounts;
}

export const updateAccountTotal = (id: string, diff: number): AccountData[] => {
  if (!id) return getAccounts();

  const account = getAccount(id);
  if (!account) return getAccounts();

  return updateAccount({ ...account, total: account.total + diff });
}

export const updateAccountsTotals = (updates: { id: string, diff: number }[]): AccountData[] => {
  const accounts = getAccounts();
  const resAccounts = accounts.map((a) => {
    const account = updates.find((newA) => newA.id === a.id);
    return { ...a, total: a.total + (account?.diff ?? 0) };
  })

  saveAccounts(resAccounts);
  return resAccounts;
}

export const updateAccountTotalByTransaction = (transaction: Transaction, oldTransaction?: Transaction): AccountData[] => {
  const { accountId, amount, type } = transaction;
  const { accountId: oldAccountId, amount: oldAmount = 0, type: oldType } = oldTransaction || {};

  const diff = type === 'expense' ? -amount : amount;
  const oldDiff = oldType === 'expense' ? -oldAmount : oldAmount;

  if (oldAccountId && accountId !== oldAccountId) {
    return updateAccountsTotals([
      { id: accountId, diff },
      { id: oldAccountId, diff: -oldDiff },
    ]);
  } else {
    const newDiff = diff - oldDiff;
    return updateAccountTotal(accountId, newDiff);
  }
}

export const updateAccountsTotalsByTransactions = (updates: { transaction: Transaction, oldTransaction?: Transaction }[]): AccountData[] => {
  const resUpdates = updates.map(({ transaction, oldTransaction }) => {
    const { accountId, amount, type } = transaction;
    const { accountId: oldAccountId, amount: oldAmount = 0, type: oldType } = oldTransaction ?? {};

    const diff = type === 'expense' ? -amount : amount;
    const oldDiff = oldType === 'expense' ? -oldAmount : oldAmount;

    if (oldAccountId && accountId !== oldAccountId) {
      return [
        { id: accountId, diff },
        { id: oldAccountId, diff: -oldDiff },
      ];
    }

    const newDiff = diff - oldDiff;
    return [{ id: accountId, diff: newDiff }];
  }).flat();

  return updateAccountsTotals(resUpdates);
}

export const makeAccountTransfer = (id: string, otherId: string, amount: number): AccountData[] => {
  const account = getAccount(id);
  const otherAccount = getAccount(otherId);
  if (!account || !otherAccount) return getAccounts();

  const transaction: Transaction = {
    id: generateId(),
    type: 'expense',
    amount,
    category: 'other',
    otherCategory: 'Internal',
    description: `Transfer from "${account.name}" to "${otherAccount.name}"`,
    date: getCurrentDate(),
    accountId: id,
  };
  const otherTransaction: Transaction = {
    id: generateId(),
    type: 'income',
    amount,
    category: 'other',
    otherCategory: 'Internal',
    description: `Transfer from "${account.name}" to "${otherAccount.name}"`,
    date: getCurrentDate(),
    accountId: otherId,
  };

  addTransactions([transaction, otherTransaction]);

  return getAccounts();
}

export const deleteAccount = (id: string): AccountData[] => {
  const accounts = getAccounts().filter((a) => a.id !== id);
  saveAccounts(accounts);
  return accounts;
}