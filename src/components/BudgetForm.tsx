'use client';

import { useState } from 'react';
import {
    BudgetPlan,
    BudgetPeriod,
    Category,
    CATEGORY_LABELS,
    EXPENSE_CATEGORIES,
} from '@/types';
import { generateId } from '@/lib/storage';

interface Props {
    onSubmit: (plan: BudgetPlan) => void;
    onClose: () => void;
}

export default function BudgetForm({ onSubmit, onClose }: Props) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<Category>('food');
    const [limit, setLimit] = useState('');
    const [period, setPeriod] = useState<BudgetPeriod>('monthly');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !limit) return;

        const plan: BudgetPlan = {
            id: generateId(),
            name,
            category,
            limit: parseFloat(limit),
            period,
        };
        onSubmit(plan);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Create Budget Plan</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Plan Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Monthly Food Budget"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as Category)}
                            >
                                {EXPENSE_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {CATEGORY_LABELS[cat]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Period</label>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
                            >
                                <option value="daily">Daily</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Spending Limit ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
