'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BudgetProgress, CATEGORY_LABELS } from '@/types';

interface Props {
  data: BudgetProgress[];
}

export default function BudgetBarChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="card chart-card">
        <h3>Budget Utilization</h3>
        <div className="empty-state" style={{ minHeight: 200 }}>
          <p>No budget plans yet</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.plan.otherCategory || CATEGORY_LABELS[d.plan.category],
    percentage: d.percentage,
    spent: d.spent,
    limit: d.plan.limit,
    category: CATEGORY_LABELS[d.plan.category],
  }));

  const getBarColor = (pct: number) => {
    if (pct < 60) return '#10b981';
    if (pct < 85) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="card chart-card">
      <h3>Budget Utilization</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#9a9ab0', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#9a9ab0', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: '#f0f0f5',
              fontSize: 13,
            }}
            formatter={(value, _name, props) => {
              const v = Number(value);
              const p = props.payload as { spent: number; limit: number };
              return [`${v.toFixed(1)}% ($${p.spent} / $${p.limit})`, 'Usage'];
            }}
          />
          <Bar
            dataKey="percentage"
            fill='#ffffff'
            radius={[0, 6, 6, 0]}
            barSize={20}
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
