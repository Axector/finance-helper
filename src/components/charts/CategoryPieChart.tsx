'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryBreakdown, CATEGORY_LABELS } from '@/types';

interface Props {
    data: CategoryBreakdown[];
}

export default function CategoryPieChart({ data }: Props) {
    if (data.length === 0) {
        return (
            <div className="card chart-card">
                <h3>Expense Breakdown</h3>
                <div className="empty-state" style={{ minHeight: 200 }}>
                    <p>No expense data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card chart-card">
            <h3>Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="amount"
                        nameKey="category"
                        paddingAngle={3}
                        strokeWidth={0}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: '#1a1a2e',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            color: '#f0f0f5',
                            fontSize: 13,
                        }}
                        formatter={(value, name) => [
                            `$${Number(value).toLocaleString()}`,
                            CATEGORY_LABELS[name as keyof typeof CATEGORY_LABELS] || name,
                        ]}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 11, color: '#9a9ab0' }}
                        formatter={(value: string) =>
                            CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] || value
                        }
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
