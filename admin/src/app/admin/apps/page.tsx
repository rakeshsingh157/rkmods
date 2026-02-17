'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { Search, MoreVertical, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import ConfirmModal from '../../../components/ConfirmModal';

export default function AppsPage() {
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get('status') || '';

    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false,
        confirmText: 'Confirm'
    });

    const fetchApps = async () => {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        try {
            const query = statusFilter ? `?status=${statusFilter}` : '';
            const res = await fetch(`/api/admin/apps${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setApps(data);
            }
        } catch (error) {
            console.error('Failed to fetch apps', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setStatusFilter(searchParams.get('status') || '');
    }, [searchParams]);

    useEffect(() => {
        fetchApps();
    }, [statusFilter]);

    const handleApprove = async (id: string) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`/api/admin/apps/${id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchApps(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to approve', error);
        }
    };

    const handleReject = async (id: string) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`/api/admin/apps/${id}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchApps(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to reject', error);
        }
    };

    const handleDelete = async (id: string) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`/api/admin/apps/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchApps();
        } catch (e) { console.error(e); }
    };

    const filteredApps = apps.filter(app =>
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.developer_id?.toString().includes(searchTerm)
    );

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
                        <h1 className="text-2xl font-bold text-white">Apps Management</h1>
                        <p className="text-slate-400 mt-1">Review and manage submitted applications</p>
                    </div>
                </header>

                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatusFilter('')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === '' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                        >
                            All Apps
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setStatusFilter('approved')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === 'approved' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                        >
                            Approved
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search apps..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">App Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Developer ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                        Loading apps...
                                    </td>
                                </tr>
                            ) : filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                        No apps found.
                                    </td>
                                </tr>
                            ) : (
                                filteredApps.map((app) => (
                                    <tr key={app._id} className="hover:bg-slate-800/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden">
                                                    {/* Placeholder for icon if available */}
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {app.name?.[0]}
                                                    </div>
                                                </div>
                                                <p className="font-medium text-white">{app.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                                            {app.developer_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={app.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {app.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setModalConfig({
                                                                    isOpen: true,
                                                                    title: 'Approve App',
                                                                    message: `Are you sure you want to approve "${app.name}"?`,
                                                                    onConfirm: () => handleApprove(app._id),
                                                                    isDestructive: false,
                                                                    confirmText: 'Approve'
                                                                });
                                                            }}
                                                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setModalConfig({
                                                                    isOpen: true,
                                                                    title: 'Reject App',
                                                                    message: `Are you sure you want to REJECT "${app.name}"?`,
                                                                    onConfirm: () => handleReject(app._id),
                                                                    isDestructive: true,
                                                                    confirmText: 'Reject'
                                                                });
                                                            }}
                                                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setModalConfig({
                                                            isOpen: true,
                                                            title: 'Delete App',
                                                            message: `Are you sure you want to DELETE "${app.name}"? This cannot be undone.`,
                                                            onConfirm: () => handleDelete(app._id),
                                                            isDestructive: true,
                                                            confirmText: 'Delete'
                                                        });
                                                    }}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition"
                                                    title="Delete App"
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

function StatusBadge({ status }: { status: string }) {
    if (status === 'approved') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" /> Approved
            </span>
        );
    }
    if (status === 'pending') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Clock className="w-3 h-3" /> Pending
            </span>
        );
    }
    if (status === 'rejected') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                <XCircle className="w-3 h-3" /> Rejected
            </span>
        );
    }
    return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
            {status}
        </span>
    );
}
