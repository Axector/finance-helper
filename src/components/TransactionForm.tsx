'use client';

import { useState } from 'react';
import {
  Transaction,
  TransactionType,
  Category,
  CATEGORY_LABELS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '@/types';
import { generateId, getAccounts } from '@/lib/storage';
import { CURRENCY, getCurrentDateTime } from '@/lib/common';

interface Props {
  onSubmit: (transaction: Transaction, isUpdate?: boolean) => void;
  onClose: () => void;
  data?: {
    id?: string,
    type?: TransactionType,
    amount?: string,
    category?: Category,
    otherCategory?: string,
    description?: string,
    date?: string,
    accountId?: string,
  };
}

export default function TransactionForm({ onSubmit, onClose, data }: Props) {
  const [type, setType] = useState<TransactionType>(data?.type ?? 'expense');
  const [amount, setAmount] = useState(data?.amount ?? '');
  const [category, setCategory] = useState<Category>(data?.category ?? 'food');
  const [otherCategory, setOtherCategory] = useState(data?.otherCategory ?? '');
  const [description, setDescription] = useState(data?.description ?? '');
  const [date, setDate] = useState(data?.date ?? getCurrentDateTime());
  const accounts = getAccounts();
  const [accountId, setAccountId] = useState(data?.accountId || accounts[0].id);

  const isUpdate = !!data?.amount;
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const transaction: Transaction = {
      id: data?.id ?? generateId(),
      type,
      amount: parseFloat(amount),
      category,
      otherCategory,
      description,
      date: getCurrentDateTime(date),
      accountId,
    };
    onSubmit(transaction, isUpdate);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((account, i) => (
                <option key={i} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type toggle */}
          <div className="form-group">
            <label>Type</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                type="button"
                onClick={() => { setType('income'); setCategory('salary'); }}
                className="btn"
                style={{
                  flex: 1,
                  background: type === 'income' ? 'var(--accent-green-soft)' : 'var(--bg-card)',
                  color: type === 'income' ? 'var(--accent-green)' : 'var(--text-secondary)',
                  border: `1px solid ${type === 'income' ? 'var(--accent-green)' : 'var(--border-color)'}`,
                  justifyContent: 'center',
                }}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => { setType('expense'); setCategory('food'); }}
                className="btn"
                style={{
                  flex: 1,
                  background: type === 'expense' ? 'var(--accent-red-soft)' : 'var(--bg-card)',
                  color: type === 'expense' ? 'var(--accent-red)' : 'var(--text-secondary)',
                  border: `1px solid ${type === 'expense' ? 'var(--accent-red)' : 'var(--border-color)'}`,
                  justifyContent: 'center',
                }}
              >
                Expense
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount ({CURRENCY})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Category);
                setOtherCategory('');
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {category === 'other' && (
            <div className="form-group">
              <label>Other Category</label>
              <input
                type="text"
                value={otherCategory}
                onChange={(e) => setOtherCategory(e.target.value)}
                placeholder="Specify other category"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this transaction for?"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isUpdate ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
