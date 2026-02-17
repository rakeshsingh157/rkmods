'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Added Link import
import {
    Users,
    Code2,
    Smartphone,
    Clock,
    LogOut,
    LayoutDashboard,
    Settings,
    Shield
} from 'lucide-react';
import Sidebar from '../../components/Sidebar'; // Added Sidebar import

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDevelopers: 0,
        totalApps: 0,
        pendingApps: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const userData = localStorage.getItem('user');

            if (!token || !userData) {
                router.push('/login');
                return;
            }

            try {
                const parsedUser = JSON.parse(userData);
                if (parsedUser.role !== 'ADMIN') {
                    throw new Error('Not an admin');
                }
                setUser(parsedUser);

                // Fetch stats
                const res = await fetch('/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar />

            {/* Main Content */}
            <main className="ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
                        <p className="text-slate-400 mt-1">Welcome back, here's what's happening today.</p>
                    </div>
                    <div className="text-sm text-slate-500">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={<Users className="w-6 h-6 text-blue-400" />}
                        trend="+12%"
                        color="bg-blue-500/10 border-blue-500/20"
                    />
                    <StatCard
                        title="Developers"
                        value={stats.totalDevelopers}
                        icon={<Code2 className="w-6 h-6 text-purple-400" />}
                        trend="+5%"
                        color="bg-purple-500/10 border-purple-500/20"
                    />
                    <StatCard
                        title="Total Apps"
                        value={stats.totalApps}
                        icon={<Smartphone className="w-6 h-6 text-emerald-400" />}
                        trend="+8%"
                        color="bg-emerald-500/10 border-emerald-500/20"
                    />
                    <StatCard
                        title="Pending Review"
                        value={stats.pendingApps}
                        icon={<Clock className="w-6 h-6 text-orange-400" />}
                        trend="Action Needed"
                        color="bg-orange-500/10 border-orange-500/20"
                        highlight={stats.pendingApps > 0}
                    />
                </div>

                {/* Quick Actions */}
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ActionCard
                        title="Review Pending Apps"
                        description={`${stats.pendingApps} apps waiting for approval`}
                        action="Start Review"
                        href="/admin/apps?status=pending"
                        primary
                    />
                    <ActionCard
                        title="User Management"
                        description="Manage user roles and permissions"
                        action="View Users"
                        href="/admin/users"
                    />
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, trend, color, highlight }: any) {
    return (
        <div className={`p-6 rounded-2xl border ${color} bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800`}>
                    {icon}
                </div>
                {highlight && (
                    <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold animate-pulse">
                        {value} New
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
            </div>
        </div>
    );
}

function ActionCard({ title, description, action, href, primary }: any) {
    return (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 group">
            <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
            <p className="text-slate-400 mb-6">{description}</p>
            <Link
                href={href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${primary
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
            >
                {action}
            </Link>
        </div>
    );
}
