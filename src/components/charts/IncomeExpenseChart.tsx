'use client';

import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Bar,
} from 'recharts';
import { TimeSeriesPoint } from '@/types';
import { CURRENCY } from '@/lib/common';

interface Props {
  data: TimeSeriesPoint[];
}

export default function IncomeExpenseChart({ data }: Props) {
  return (
    <div className="card chart-card">
      <h3>Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
            tickFormatter={(v) => `${CURRENCY}${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: '#f0f0f5',
              fontSize: 13,
            }}
            formatter={(value) => [`${CURRENCY}${Number(value).toLocaleString()}`]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#9a9ab0' }}
          />
          <Bar name="Income" dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20}></Bar>
          <Bar name="Expenses" dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20}></Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
