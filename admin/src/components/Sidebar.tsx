'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Users,
    Code2,
    Smartphone,
    LayoutDashboard,
    Settings,
    Shield,
    LogOut,
    MessageSquare
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                // Ignore error
            }
        }
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error', e);
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col z-50">
            <div className="flex items-center gap-3 mb-10">
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">RKMODS</h1>
            </div>

            <nav className="flex-1 space-y-2">
                <NavItem
                    icon={<LayoutDashboard />}
                    label="Overview"
                    href="/dashboard"
                    active={pathname === '/dashboard'}
                />
                <NavItem
                    icon={<Smartphone />}
                    label="Apps"
                    href="/admin/apps"
                    active={pathname?.startsWith('/admin/apps')}
                />
                <NavItem
                    icon={<Users />}
                    label="Users"
                    href="/admin/users"
                    active={pathname?.startsWith('/admin/users')}
                />
                <NavItem
                    icon={<Code2 />}
                    label="Developers"
                    href="/admin/developers"
                    active={pathname?.startsWith('/admin/developers')}
                />
                <NavItem
                    icon={<MessageSquare />}
                    label="Messages"
                    href="/admin/messages"
                    active={pathname?.startsWith('/admin/messages')}
                />
                <NavItem
                    icon={<Settings />}
                    label="Settings"
                    href="/admin/settings"
                    active={pathname?.startsWith('/admin/settings')}
                />
            </nav>

            <div className="pt-6 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
                <div className="mt-4 flex items-center gap-3 px-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                        <p className="text-xs text-indigo-400">Administrator</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ icon, label, href = "#", active = false }: any) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    );
}
