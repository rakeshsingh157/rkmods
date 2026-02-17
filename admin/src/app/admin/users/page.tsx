'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { Search, MoreVertical, Trash2, Mail } from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false,
        confirmText: 'Confirm'
    });

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const res = await fetch('/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Failed to fetch users', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id?.toString().includes(searchTerm)
    );

    const handleSuspend = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`/api/admin/users/${id}/status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Optimistic update
                setUsers(users.map(u => u._id === id ? { ...u, account_status: newStatus } : u));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDelete = async (id: string) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setUsers(users.filter(u => u._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete user', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar />

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                isDestructive={modalConfig.isDestructive}
                confirmText={modalConfig.confirmText}
            />

            <main className="ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Users</h1>
                        <p className="text-slate-400 mt-1">Manage platform users</p>
                    </div>
                </header>

                {/* Filters */}
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search users by email or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-800/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                                    {user.email?.[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.email}</p>
                                                    <p className="text-xs text-slate-500">ID: {user._id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${user.account_status === 'suspended'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                {user.account_status === 'suspended' ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {new Date(user.timestamp || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        const newStatus = user.account_status === 'suspended' ? 'active' : 'suspended';
                                                        setModalConfig({
                                                            isOpen: true,
                                                            title: `${newStatus === 'active' ? 'Activate' : 'Suspend'} User`,
                                                            message: `Are you sure you want to ${newStatus} ${user.email}?`,
                                                            onConfirm: () => handleSuspend(user._id, user.account_status),
                                                            isDestructive: newStatus === 'suspended',
                                                            confirmText: newStatus === 'active' ? 'Activate' : 'Suspend'
                                                        });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${user.account_status === 'suspended'
                                                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                            : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                                                        }`}
                                                >
                                                    {user.account_status === 'suspended' ? 'Activate' : 'Suspend'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setModalConfig({
                                                            isOpen: true,
                                                            title: 'Delete User',
                                                            message: 'Are you sure you want to PERMANENTLY delete this user? This cannot be undone.',
                                                            onConfirm: () => handleDelete(user._id),
                                                            isDestructive: true,
                                                            confirmText: 'Delete'
                                                        });
                                                    }}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
