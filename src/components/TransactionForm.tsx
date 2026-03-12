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
import { generateId } from '@/lib/storage';
import { getCurrentDateTime } from '@/lib/stats';

interface Props {
    onSubmit: (transaction: Transaction) => void;
    onClose: () => void;
}

export default function TransactionForm({ onSubmit, onClose }: Props) {
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Category>('food');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(getCurrentDateTime());

    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;

        const transaction: Transaction = {
            id: generateId(),
            type,
            amount: parseFloat(amount),
            category,
            description,
            date: new Date(date).toISOString(),
        };
        onSubmit(transaction);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Add Transaction</h2>
                <form onSubmit={handleSubmit}>
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
                            <label>Amount ($)</label>
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
                            onChange={(e) => setCategory(e.target.value as Category)}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {CATEGORY_LABELS[cat]}
                                </option>
                            ))}
                        </select>
                    </div>

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
                            Add Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
