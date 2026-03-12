'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Transaction, BudgetPeriod, CATEGORY_LABELS } from '@/types';
import { getTransactions, getBudgetPlans } from '@/lib/storage';
import {
  filterByPeriod,
  computeStats,
  getCategoryBreakdown,
  getTimeSeries,
  getBudgetProgress,
} from '@/lib/stats';

import StatCard from '@/components/StatCard';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import BudgetBarChart from '@/components/charts/BudgetBarChart';

export default function DashboardPage() {
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [mounted, setMounted] = useState(false);

  const allTransactions = mounted ? getTransactions() : [];
  const budgetPlans = mounted ? getBudgetPlans() : [];

  const filtered = filterByPeriod(allTransactions, period);
  const stats = computeStats(filtered);
  const categoryBreakdown = getCategoryBreakdown(filtered);
  const timeSeries = getTimeSeries(filtered, period);
  const budgetProgress = getBudgetProgress(budgetPlans, allTransactions);

  const recent = allTransactions.slice(0, 5);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = useCallback((val: number) => {
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

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
        <h1>Dashboard</h1>
        <p>Overview of your financial activity</p>
      </div>

      {/* Period Toggle */}
      <div className="period-toggle">
        {(['daily', 'monthly', 'yearly'] as BudgetPeriod[]).map((p) => (
          <button
            key={p}
            className={p === period ? 'active' : ''}
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Income"
          value={formatCurrency(stats.totalIncome)}
          subtitle={`${filtered.filter(t => t.type === 'income').length} transactions`}
          icon={<TrendingUp size={20} />}
          color="green"
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          subtitle={`${filtered.filter(t => t.type === 'expense').length} transactions`}
          icon={<TrendingDown size={20} />}
          color="red"
        />
        <StatCard
          label="Net Balance"
          value={formatCurrency(stats.balance)}
          subtitle={stats.balance >= 0 ? 'You\'re on track!' : 'Over budget'}
          icon={<DollarSign size={20} />}
          color="blue"
        />
        <StatCard
          label="Savings Rate"
          value={`${stats.savingsRate}%`}
          subtitle={stats.savingsRate >= 20 ? 'Great savings!' : 'Try to save more'}
          icon={<PiggyBank size={20} />}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <IncomeExpenseChart data={timeSeries} />
        <CategoryPieChart data={categoryBreakdown} />
      </div>

      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <BudgetBarChart data={budgetProgress} />
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <div className="transaction-list">
          {recent.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet. Add your first one!</p>
            </div>
          ) : (
            recent.map((t) => (
              <div key={t.id} className="transaction-item" style={{ animation: 'slideInRight 300ms ease forwards' }}>
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
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
