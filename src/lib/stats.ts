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
} from '@/types';

const YEARS_TO_SHOW = 4;

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

export function computeStats(transactions: Transaction[]): DashboardStats {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsRate: Math.round(savingsRate * 10) / 10,
    transactionCount: transactions.length,
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

export function getBudgetProgress(
  plans: BudgetPlan[],
  transactions: Transaction[]
): BudgetProgress[] {
  return plans.map((plan) => {
    const periodTransactions = filterByPeriod(transactions, plan.period);
    const spent = periodTransactions
      .filter((t) => t.type === 'expense' && t.category === plan.category)
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

export function getDateTime(date: Date) {
  const dateOnly = date.toISOString().split('T')[0].split('-').slice(0, 2).join('-');
  const day = date.getDate();
  const hours = date.getHours();
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const minutes = date.getMinutes();
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${dateOnly}-${day}T${formattedHours}:${formattedMinutes}`;
}

export function getCurrentDateTime() {
  return (getDateTime(new Date()))
}
