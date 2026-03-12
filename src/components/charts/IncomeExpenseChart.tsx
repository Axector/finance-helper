'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { TimeSeriesPoint } from '@/types';

interface Props {
    data: TimeSeriesPoint[];
}

export default function IncomeExpenseChart({ data }: Props) {
    return (
        <div className="card chart-card">
            <h3>Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: '#9a9ab0', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#9a9ab0', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#1a1a2e',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            color: '#f0f0f5',
                            fontSize: 13,
                        }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`]}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 12, color: '#9a9ab0' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#gradIncome)"
                    />
                    <Area
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="url(#gradExpense)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
