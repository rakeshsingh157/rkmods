'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Search, ArrowLeft, Download, Star, Plus } from 'lucide-react';
import Link from 'next/link';
import { authFetch } from '@/lib/api';

interface App {
    id: string;
    name: string;
    category: string;
    version: string;
    description: string;
    file_url: string;
    icon_url: string;
    size: string;
    screenshots: string[];
    status: string;
    downloads: number;
    reviews_count: number;
    rating: number;
}

export default function DeveloperApps() {
    const router = useRouter();
    const [apps, setApps] = useState<App[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/developer/login');
            return;
        }
        fetchApps();
    }, [router]);

    async function fetchApps() {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/developer/my-apps`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setApps(data);
            }
        } catch (err) {
            console.error('Fetch apps error:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this app?')) return;

        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/developer/apps/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchApps();
            } else {
                alert('Failed to delete app');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting app');
        }
    }

    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0f1e]/80 border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/developer/dashboard')}
                            className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight">Your Library</h1>
                    </div>
                    <Link
                        href="/developer/upload"
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition transform active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Upload New
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                {apps.length === 0 ? (
                    <div className="bg-[#131b2e]/50 backdrop-blur-sm rounded-3xl p-12 border border-white/10 text-center max-w-2xl mx-auto mt-12 flex flex-col items-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-white/5">
                            <Search className="w-10 h-10 text-gray-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">No Apps Yet</h2>
                        <p className="text-gray-400 mb-8 max-w-sm mx-auto text-lg">Your library is empty. Upload your first app to get started on the RK App Store.</p>
                        <Link href="/developer/upload" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-cyan-500/20 transition duration-300 transform hover:-translate-y-1">
                            <Plus className="w-5 h-5" />
                            Create First App
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">My Applications</h2>
                                <p className="text-gray-400">Manage {apps.length} application{apps.length !== 1 ? 's' : ''}</p>
                            </div>

                            <div className="relative w-full max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition" />
                                <input
                                    type="text"
                                    placeholder="Search your apps..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#131b2e]/50 backdrop-blur-sm border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredApps.map((app, index) => (
                                <div
                                    key={app.id}
                                    className="group relative bg-[#131b2e]/60 backdrop-blur-md rounded-3xl border border-white/5 p-6 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Glass Highlight */}
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                                    {/* Action Buttons (Absolute) */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.push(`/developer/upload?edit=${app.id}`); }}
                                            className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl hover:bg-cyan-500 hover:text-white text-gray-300 transition shadow-lg border border-white/5"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }}
                                            className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl hover:bg-red-500 hover:text-white text-gray-300 transition shadow-lg border border-white/5"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-start gap-5 mb-6 relative z-10">
                                        <div className="w-20 h-20 rounded-2xl bg-[#0a0f1e] overflow-hidden border border-white/10 shadow-xl flex-shrink-0 group-hover:scale-105 transition duration-500">
                                            {app.icon_url ? (
                                                <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold bg-white/5">NO ICON</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <h3 className="font-bold text-xl text-white mb-1 truncate leading-tight group-hover:text-cyan-400 transition">{app.name}</h3>
                                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider mb-2">
                                                <span className="px-2 py-1 bg-white/5 rounded-md text-cyan-400 border border-white/5">{app.category}</span>
                                                <span className="px-2 py-1 bg-white/5 rounded-md text-gray-400 border border-white/5">v{app.version}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-6 h-10 leading-relaxed">{app.description}</p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Download className="w-4 h-4" />
                                                    <span>{app.downloads || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span>{app.rating ? app.rating.toFixed(1) : '0.0'} ({app.reviews_count || 0})</span>
                                                </div>
                                            </div>
                                            <span className={`w-2 h-2 rounded-full ${app.status === 'published' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`}></span>
                                        </div>
                                    </div>

                                    {/* Hover Bloom */}
                                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/20 blur-[80px] rounded-full group-hover:bg-cyan-500/30 transition duration-700"></div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
