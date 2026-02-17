'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authFetch } from '@/lib/api';
import { LayoutDashboard, Upload, List, LogOut, TrendingUp, Download, Star, ArrowRight, User, MessageSquare } from 'lucide-react';
import SupportChat from '@/components/SupportChat';

export default function DeveloperDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        apps: 0,
        downloads: 0,
        reviews: 0,
        avgRating: 0
    });

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');

        if (!token || !userData || userData === 'undefined' || userData === 'null') {
            router.push('/developer/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Fetch real stats
            authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/developer/stats`)
                .then(res => res.json())
                .then(data => {
                    setStats({
                        apps: data.totalApps || 0,
                        downloads: data.totalDownloads || 0,
                        reviews: data.totalReviews || 0,
                        avgRating: data.avgRating || 0
                    });
                })
                .catch(err => console.error('Failed to load stats', err))
                .finally(() => setLoading(false));

        } catch (error) {
            console.error('Failed to parse user data:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            router.push('/developer/login');
        }
    }, [router]);

    const handleLogout = async () => {
        try {
            await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, { method: 'POST' });
        } catch (e) {
            console.error('Logout error', e);
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/developer/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white selection:bg-cyan-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0f1e]/80 border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">DevPortal</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition cursor-default">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10">
                                <User className="w-4 h-4 text-cyan-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-300 pr-2">{user?.email}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition duration-300"
                            title="Sign out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Hero */}
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                        Hello, {user?.name || 'Developer'}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Welcome to your command center. Manage your applications, track performance, and deploy updates to the store.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Apps', value: stats.apps, icon: List, color: 'from-blue-500 to-indigo-600' },
                        { label: 'Total Downloads', value: stats.downloads.toLocaleString(), icon: Download, color: 'from-cyan-500 to-teal-500' },
                        { label: 'Total Ratings', value: stats.reviews.toLocaleString(), icon: MessageSquare, color: 'from-purple-500 to-pink-600' },
                        { label: 'Avg. Rating', value: stats.avgRating, icon: Star, color: 'from-yellow-400 to-orange-500' }
                    ].map((stat, i) => (
                        <div key={i} className="group relative bg-[#131b2e]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 overflow-hidden hover:border-white/10 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:opacity-20 transition duration-500`}></div>
                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <p className="text-gray-400 font-medium mb-1">{stat.label}</p>
                                    <h3 className="text-4xl font-bold text-white tracking-tight">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-black/20`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                <TrendingUp className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-500 font-medium">All time</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></span>
                    Quick Actions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/developer/upload" className="group relative bg-gradient-to-br from-[#131b2e] to-[#0f1623] border border-white/5 rounded-3xl p-8 overflow-hidden hover:border-cyan-500/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#0a0f1e] border border-white/10 flex items-center justify-center group-hover:scale-110 transition duration-300 shadow-xl">
                                <Upload className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">Upload New App</h3>
                                <p className="text-gray-400 mb-4 line-clamp-2">Deploy a new application to the RK App Store. Supports APK and direct link downloads.</p>
                                <span className="inline-flex items-center text-cyan-400 font-bold text-sm">
                                    Start Upload <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                                </span>
                            </div>
                        </div>
                    </Link>

                    <Link href="/developer/apps" className="group relative bg-gradient-to-br from-[#131b2e] to-[#0f1623] border border-white/5 rounded-3xl p-8 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#0a0f1e] border border-white/10 flex items-center justify-center group-hover:scale-110 transition duration-300 shadow-xl">
                                <List className="w-8 h-8 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">Manage Applications</h3>
                                <p className="text-gray-400 mb-4 line-clamp-2">Update existing apps, view detailed analytics, edit listings, or remove outdated builds.</p>
                                <span className="inline-flex items-center text-blue-400 font-bold text-sm">
                                    View Library <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            </main>

            {/* Support Chat Overlay */}
            <SupportChat />
        </div>
    );
}
