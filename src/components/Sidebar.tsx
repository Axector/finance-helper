'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Target,
    ChevronLeft,
    Wallet,
    User,
    DollarSign,
} from 'lucide-react';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/accounts', label: 'Accounts', icon: DollarSign },
    { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { href: '/budget', label: 'Budget', icon: Target },
    { href: '/user', label: 'User', icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            <aside
                className="sidebar"
                style={{
                    width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 'var(--space-md)',
                    transition: 'width var(--transition-normal)',
                    zIndex: 40,
                    overflow: 'hidden',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        padding: 'var(--space-sm) var(--space-xs)',
                        marginBottom: 'var(--space-xl)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Wallet size={20} color="white" />
                    </div>
                    {!collapsed && (
                        <span
                            style={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                background: 'var(--gradient-primary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            FinanceHelper
                        </span>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-sm)',
                                    padding: '10px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    background: isActive ? 'var(--bg-card)' : 'transparent',
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: '0.9rem',
                                    transition: 'all var(--transition-fast)',
                                    whiteSpace: 'nowrap',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {isActive && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: '20%',
                                            bottom: '20%',
                                            width: 3,
                                            borderRadius: '0 2px 2px 0',
                                            background: 'var(--gradient-primary)',
                                        }}
                                    />
                                )}
                                <Icon size={20} style={{ flexShrink: 0 }} />
                                {!collapsed && item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: 'var(--space-sm)',
                        padding: '10px 12px',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.8rem',
                        transition: 'all var(--transition-fast)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <ChevronLeft
                        size={18}
                        style={{
                            transform: collapsed ? 'rotate(180deg)' : 'none',
                            transition: 'transform var(--transition-normal)',
                            flexShrink: 0,
                        }}
                    />
                    {!collapsed && 'Collapse'}
                </button>
            </aside>

            {/* Mobile bottom nav */}
            <nav
                className="mobile-nav"
                style={{
                    display: 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: 'var(--space-sm) var(--space-md)',
                    justifyContent: 'space-around',
                    zIndex: 40,
                }}
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                textDecoration: 'none',
                                color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                                fontSize: '0.7rem',
                                fontWeight: isActive ? 600 : 400,
                                padding: '4px 12px',
                            }}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
        </>
    );
}
