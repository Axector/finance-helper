/* eslint-disable react-hooks/set-state-in-effect */

'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BudgetPlan, Category, CATEGORY_LABELS } from '@/types';
import {
  getBudgetPlans,
  getTransactions,
  addBudgetPlan,
  deleteBudgetPlan,
  updateBudgetPlan,
} from '@/lib/storage';
import { getBudgetProgress } from '@/lib/stats';
import BudgetForm from '@/components/BudgetForm';

export default function BudgetPage() {
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [fromData, setFromData] = useState<BudgetPlan | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPlans(getBudgetPlans());
  }, []);

  const transactions = mounted ? getTransactions() : [];
  const progress = getBudgetProgress(plans, transactions);

  const handleUpdate = (plan: BudgetPlan) => {
    const updated = updateBudgetPlan(plan);
    setPlans(updated);
  };

  const handleAdd = (plan: BudgetPlan, isUpdate: boolean) => {
    if (isUpdate) {
      return handleUpdate(plan);
    }

    const updated = addBudgetPlan(plan);
    setPlans(updated);
  };

  const handleDelete = (id: string) => {
    const updated = deleteBudgetPlan(id);
    setPlans(updated);
  };

  const getBudgetPlanCategory = (item: { plan: { category: Category, otherCategory: string } }): string => {
    const {
      plan: {
        category,
        otherCategory,
      },
    } = item;

    return otherCategory || CATEGORY_LABELS[category];
  }

  const getProgressColor = (pct: number) => {
    if (pct < 60) return 'green';
    if (pct < 85) return 'yellow';
    return 'red';
  };

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
        <h1>Budget Plans</h1>
        <p>Set spending limits and track your progress</p>
      </div>

      {/* Summary */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
          flexWrap: 'wrap',
        }}
      >
        <div className="card" style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
          <div className="stat-label">Active Plans</div>
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>
            {plans.length}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
          <div className="stat-label">On Track</div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
            {progress.filter((p) => p.percentage < 85).length}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
          <div className="stat-label">Over Budget</div>
          <div className="stat-value" style={{ color: 'var(--accent-red)' }}>
            {progress.filter((p) => p.percentage >= 100).length}
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      {progress.length === 0 ? (
        <div className="empty-state">
          <p>No budget plans yet. Create one to start tracking your spending!</p>
        </div>
      ) : (
        <div className="budget-grid">
          {progress.map((item, i) => (
            <div
              key={item.plan.id}
              className="budget-card-wrapper"
              style={{ animation: `slideInRight ${200 + i * 50}ms ease forwards` }}
            >
              <button
                className="card budget-card"
                onClick={() => {
                  setShowForm(true);
                  setFromData(item.plan);
                }}
              >
                <div className="budget-card-header">
                  <div>
                    <h3>{getBudgetPlanCategory(item)}</h3>
                  </div>
                  <span className="budget-period-badge">{item.plan.period}</span>
                </div>

                <div className="budget-progress-bar">
                  <div
                    className={`budget-progress-fill ${getProgressColor(item.percentage)}`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>

                <div className="budget-stats">
                  <span>
                    Spent: <strong>${item.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                  </span>
                  <span>
                    Limit: <strong>${item.plan.limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                  </span>
                  <span
                    style={{
                      color:
                        item.percentage >= 100
                          ? 'var(--accent-red)'
                          : item.percentage >= 85
                            ? 'var(--accent-amber)'
                            : 'var(--accent-green)',
                      fontWeight: 600,
                    }}
                  >
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </button>

              <button
                className="budget-delete"
                onClick={() => handleDelete(item.plan.id)}
                title="Delete plan"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setShowForm(true)} title="Add budget plan">
        <Plus size={24} />
      </button>

      {/* Modal */}
      {showForm && (
        <BudgetForm data={fromData} onSubmit={handleAdd} onClose={() => setShowForm(false)} />
      )}
    </>
  );
}
