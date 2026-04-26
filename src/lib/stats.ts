import {
  Transaction,
  BudgetPlan,
  DashboardStats,
  CategoryBreakdown,
  TimeSeriesPoint,
  BudgetProgress,
  BudgetPeriod,
  CATEGORY_COLORS,
  Category,
  AccountData,
  FilteredAccountData,
} from '@/types';

const YEARS_TO_SHOW = 4;

export function filterByAccounts(transactions: Transaction[], filteredAccounts: FilteredAccountData[]): Transaction[] {
  return transactions.filter((t) => !!filteredAccounts.find((a) => t.accountId === a.id));
}

export function filterByPeriod(transactions: Transaction[], period: BudgetPeriod): Transaction[] {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return transactions.filter((t) => {
    const d = new Date(t.date);
    switch (period) {
      case 'hourly':
        return d >= startOfDay;
      case 'daily':
      case 'weekly':
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case 'monthly':
        return d.getFullYear() === now.getFullYear();
      case 'yearly':
        return d.getFullYear() > now.getFullYear() - YEARS_TO_SHOW;
    }
  });
}

export function computeStats(transactions: Transaction[], accounts: AccountData[]): DashboardStats {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = accounts.reduce((acc, curr) => acc + +curr.total, 0);

  return {
    totalIncome,
    totalExpenses,
    balance,
  };
}

export function getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenses = transactions.filter((t) => {
    return t.type === 'expense';
  });
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);

  const map = new Map<Category, number>();
  expenses.forEach((t) => {
    map.set(t.category, (map.get(t.category) || 0) + t.amount);
  });

  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
      color: CATEGORY_COLORS[category],
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getTimeSeries(transactions: Transaction[], period: BudgetPeriod): TimeSeriesPoint[] {
  const now = new Date();
  const points: TimeSeriesPoint[] = [];

  if (period === 'hourly') {
    // Show hours of today
    for (let h = 0; h < 24; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      const filtered = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getHours() >= h && d.getHours() < h + 1;
      });
      points.push({
        label,
        income: filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return points;
  }

  if (period === 'daily') {
    // Show days of current month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let day = 0; day < daysInMonth; day++) {
      const startDay = day + 1;
      const endDay = Math.min(startDay, daysInMonth);
      if (startDay > daysInMonth) break;
      const filtered = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getDate() >= startDay && d.getDate() <= endDay;
      });
      points.push({
        label: `${day + 1}`,
        income: filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return points;
  }

  if (period === 'weekly') {
    // Show weeks of current month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let week = 0; week < 5; week++) {
      const startDay = week * 7 + 1;
      const endDay = Math.min(startDay + 6, daysInMonth);
      if (startDay > daysInMonth) break;
      const label = `${startDay}-${endDay}`;
      const filtered = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getDate() >= startDay && d.getDate() <= endDay;
      });
      points.push({
        label: `Week ${week + 1} (${label})`,
        income: filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return points;
  }

  if (period === 'monthly') {
    // Show months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let m = 0; m < 12; m++) {
      const filtered = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === m && d.getFullYear() === now.getFullYear();
      });
      points.push({
        label: monthNames[m],
        income: filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return points;
  }

  // Show years
  for (let y = YEARS_TO_SHOW - 1; y >= 0; y--) {
    const currentYear = now.getFullYear();
    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear - y;
    });
    points.push({
      label: `${currentYear - y}`,
      income: filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    });
  }
  return points;
}

export function filterBudgetByPeriod(transactions: Transaction[], period: BudgetPeriod): Transaction[] {
  const now = new Date('2026-04-27T14:56:19');
  const nowQuarter = Math.ceil((now.getMonth() + 1) / 3);

  return transactions.filter((t) => {
    const d = new Date(t.date);
    const diffDays = Math.abs(+now - +d) / (1000 * 60 * 60 * 24);
    const dQuarter = Math.ceil((d.getMonth() + 1) / 3);

    switch (period) {
      case 'daily':
        return diffDays < 1;
      case 'weekly':
        return diffDays < now.getDay() || (now.getDay() === 0 && diffDays < 7);
      case 'monthly':
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case 'quarterly':
        return dQuarter === nowQuarter && d.getFullYear() === now.getFullYear();
      case 'yearly':
        return d.getFullYear() === now.getFullYear();
    }
  });
}

export function getBudgetProgress(
  plans: BudgetPlan[],
  transactions: Transaction[]
): BudgetProgress[] {
  return plans.map((plan) => {
    const periodTransactions = filterBudgetByPeriod(transactions, plan.period);
    const spent = periodTransactions
      .filter((t) => t.type === 'expense' && t.category === plan.category && t.otherCategory === plan.otherCategory)
      .reduce((sum, t) => sum + t.amount, 0);
    const remaining = Math.max(0, plan.limit - spent);
    const percentage = plan.limit > 0 ? Math.min(100, (spent / plan.limit) * 100) : 0;

    return {
      plan,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentage: Math.round(percentage * 10) / 10,
    };
  });
}
