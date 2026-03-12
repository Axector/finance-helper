'use client';

import { ReactNode } from 'react';

interface StatCardProps {
    label: string;
    value: string;
    subtitle?: string;
    icon: ReactNode;
    color: 'green' | 'red' | 'blue' | 'purple';
}

export default function StatCard({ label, value, subtitle, icon, color }: StatCardProps) {
    return (
        <div className={`card stat-card ${color}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            {subtitle && <div className="stat-sub">{subtitle}</div>}
        </div>
    );
}
