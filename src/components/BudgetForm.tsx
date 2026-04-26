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
import { CURRENCY } from '@/lib/common';

interface Props {
  data: BudgetPlan | null,
  onSubmit: (plan: BudgetPlan, isUpdate: boolean) => void;
  onClose: () => void;
}

export default function BudgetForm({ data, onSubmit, onClose }: Props) {
  const [category, setCategory] = useState<Category>(data?.category || 'food');
  const [otherCategory, setOtherCategory] = useState(data?.otherCategory || '');
  const [limit, setLimit] = useState(`${data?.limit}` || '');
  const [period, setPeriod] = useState<BudgetPeriod>(data?.period || 'monthly');

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!limit) return;

    const plan: BudgetPlan = {
      id: data?.id || generateId(),
      category,
      otherCategory,
      limit: +limit,
      period,
    };
    onSubmit(plan, !!data);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {!!data
            ? 'Update Budget Plan'
            : 'Create Budget Plan'
          }
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Category);
                setOtherCategory('');
              }}
            >
              {EXPENSE_CATEGORIES.map((cat) => (
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
            <label>Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Spending Limit ({CURRENCY})</label>
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
              {!!data
                ? 'Update Plan'
                : 'Create Plan'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
