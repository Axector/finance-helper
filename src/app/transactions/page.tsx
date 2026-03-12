/* eslint-disable react-hooks/set-state-in-effect */

'use client';

import { useEffect, useState, useMemo } from 'react';
import {
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Trash2,
    Search,
} from 'lucide-react';
import {
    Transaction,
    TransactionType,
    Category,
    CATEGORY_LABELS,
    EXPENSE_CATEGORY_LABELS,
    INCOME_CATEGORY_LABELS,
} from '@/types';
import {
    getTransactions,
    addTransaction,
    deleteTransaction,
} from '@/lib/storage';
import TransactionForm from '@/components/TransactionForm';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
    const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTransactions(getTransactions());
    }, []);

    const filtered = useMemo(() => {
        return transactions.filter((t) => {
            if (typeFilter !== 'all' && t.type !== typeFilter) return false;
            if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
            if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [transactions, typeFilter, categoryFilter, searchQuery]);

    const handleAdd = (transaction: Transaction) => {
        const updated = addTransaction(transaction);
        setTransactions(updated);
        setShowForm(false);
    };

    const handleDelete = (id: string) => {
        const updated = deleteTransaction(id);
        setTransactions(updated);
    };

    const totalFiltered = useMemo(() => {
        const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [filtered]);

    const getCategoryFilterLabels = () => {
        switch (typeFilter) {
            case 'expense':
                return EXPENSE_CATEGORY_LABELS;
            case 'income':
                return INCOME_CATEGORY_LABELS;
            default:
                return CATEGORY_LABELS;
        }
    }

    if (!mounted) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div className="page-header">
                <h1>Transactions</h1>
                <p>Manage your income and expenses</p>
            </div>

            {/* Summary strip */}
            <div
                style={{
                    display: 'flex',
                    gap: 'var(--space-lg)',
                    marginBottom: 'var(--space-lg)',
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Income:</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                        +${totalFiltered.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Expenses:</span>
                    <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                        -${totalFiltered.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Net:</span>
                    <span style={{ color: totalFiltered.net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                        ${totalFiltered.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'all' | TransactionType)}
                >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as 'all' | Category)}
                >
                    <option value="all">All Categories</option>
                    {Object.entries(getCategoryFilterLabels()).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search
                        size={16}
                        style={{
                            position: 'absolute',
                            left: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                            pointerEvents: 'none',
                        }}
                    />
                    <input
                        className="search-input"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
            </div>

            {/* Transaction list */}
            <div className="transaction-list">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <p>No transactions found</p>
                    </div>
                ) : (
                    filtered.map((t, i) => (
                        <div
                            key={t.id}
                            className="transaction-item"
                            style={{ animation: `slideInRight ${200 + i * 30}ms ease forwards` }}
                        >
                            <div className={`transaction-icon ${t.type}`}>
                                {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                            </div>
                            <div className="transaction-details">
                                <div className="transaction-desc">{t.description}</div>
                                <div className="transaction-meta">
                                    <span>{CATEGORY_LABELS[t.category]}</span>
                                    <span>•</span>
                                    <span>{new Date(t.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className={`transaction-amount ${t.type}`}>
                                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <button
                                className="transaction-delete"
                                onClick={() => handleDelete(t.id)}
                                title="Delete transaction"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* FAB */}
            <button className="fab" onClick={() => setShowForm(true)} title="Add transaction">
                <Plus size={24} />
            </button>

            {/* Modal */}
            {showForm && (
                <TransactionForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />
            )}
        </>
    );
}
