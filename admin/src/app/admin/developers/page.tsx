'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { Search, MoreVertical, Code2, Trash2, MessageSquare } from 'lucide-react';
import ChatDrawer from '../../../components/ChatDrawer';
import ConfirmModal from '../../../components/ConfirmModal';

export default function DevelopersPage() {
    const [developers, setDevelopers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDev, setSelectedDev] = useState<any>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false,
        confirmText: 'Confirm'
    });

    useEffect(() => {
        const fetchDevelopers = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const res = await fetch('/api/admin/developers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDevelopers(data);
                }
            } catch (error) {
                console.error('Failed to fetch developers', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDevelopers();
    }, []);

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
                setDevelopers(developers.map(d => d._id === id ? { ...d, account_status: newStatus } : d));
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
                setDevelopers(developers.filter(d => d._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete developer', error);
        }
    };

    const handleChat = (dev: any) => {
        setSelectedDev(dev);
        setIsChatOpen(true);
    };

    const filteredDevs = developers.filter(dev =>
        dev.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev._id?.toString().includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar />

            <ChatDrawer
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                developer={selectedDev}
            />

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
                        <h1 className="text-2xl font-bold text-white">Developers</h1>
                        <p className="text-slate-400 mt-1">Manage verified developer accounts</p>
                    </div>
                </header>

                {/* Filters */}
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search developers..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Developer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Apps</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                        Loading developers...
                                    </td>
                                </tr>
                            ) : filteredDevs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                        No developers found.
                                    </td>
                                </tr>
                            ) : (
                                filteredDevs.map((dev) => (
                                    <tr key={dev._id} className="hover:bg-slate-800/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
                                                    <Code2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{dev.email}</p>
                                                    <p className="text-xs text-slate-500">ID: {dev._id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${dev.account_status === 'suspended'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                }`}>
                                                {dev.account_status === 'suspended' ? 'Suspended' : 'Verified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            - {/* To implement app count later */}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleChat(dev)}
                                                    className="p-2 hover:bg-indigo-500/10 rounded-lg text-slate-400 hover:text-indigo-400 transition"
                                                    title="Chat with Developer"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newStatus = dev.account_status === 'suspended' ? 'active' : 'suspended';
                                                        setModalConfig({
                                                            isOpen: true,
                                                            title: `${newStatus === 'active' ? 'Activate' : 'Suspend'} Developer`,
                                                            message: `Are you sure you want to ${newStatus} ${dev.email}?`,
                                                            onConfirm: () => handleSuspend(dev._id, dev.account_status),
                                                            isDestructive: newStatus === 'suspended',
                                                            confirmText: newStatus === 'active' ? 'Activate' : 'Suspend'
                                                        });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${dev.account_status === 'suspended'
                                                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                            : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                                                        }`}
                                                >
                                                    {dev.account_status === 'suspended' ? 'Activate' : 'Suspend'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setModalConfig({
                                                            isOpen: true,
                                                            title: 'Delete Developer',
                                                            message: 'Are you sure you want to PERMANENTLY delete this developer? All their apps will remain but they cannot login.',
                                                            onConfirm: () => handleDelete(dev._id),
                                                            isDestructive: true,
                                                            confirmText: 'Delete'
                                                        });
                                                    }}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition"
                                                    title="Delete Developer"
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
