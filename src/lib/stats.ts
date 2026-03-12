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

export function filterByPeriod(transactions: Transaction[], period: BudgetPeriod): Transaction[] {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter((t) => {
        const d = new Date(t.date);
        switch (period) {
            case 'daily':
                return d >= startOfDay;
            case 'monthly':
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            case 'yearly':
                return d.getFullYear() === now.getFullYear();
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
    const expenses = transactions.filter((t) => t.type === 'expense');
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

    if (period === 'daily') {
        // Show hours of today
        const points: TimeSeriesPoint[] = [];
        for (let h = 0; h < 24; h += 3) {
            const label = `${h.toString().padStart(2, '0')}:00`;
            const filtered = transactions.filter((t) => {
                const d = new Date(t.date);
                return d.getHours() >= h && d.getHours() < h + 3;
            });
            points.push({
                label,
                income: filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
                expenses: filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
            });
        }
        return points;
    }

    if (period === 'monthly') {
        // Show weeks of current month
        const points: TimeSeriesPoint[] = [];
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

    // Yearly — show months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const points: TimeSeriesPoint[] = [];
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
