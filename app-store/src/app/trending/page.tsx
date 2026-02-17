import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { TrendingUp, Star, Download, Flame } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

async function getTrendingApps() {
    try {
        const res = await fetch(`${API_URL}/api/user/apps/trending`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        return [];
    }
}

export default async function TrendingPage() {
    const apps = await getTrendingApps();

    return (
        <main className="min-h-screen font-sans flex flex-col selection:bg-cyan-500 selection:text-white">
            <Navbar />

            <div className="relative pt-32 pb-12 border-b border-white/5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/10 to-[#0b0f19] -z-10"></div>
                <div className="container mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 shadow-lg shadow-red-500/10">
                            <Flame className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Trending Mods</h1>
                    </div>
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        The hottest mods and apps everyone is downloading right now. Updated daily.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {apps.map((app: any, index: number) => (
                        <div key={app.id} className="bg-[#131b2e] p-6 rounded-3xl border border-white/5 shadow-lg hover:border-cyan-500/30 hover:shadow-cyan-500/10 transition flex items-center gap-6 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

                            <div className="text-4xl font-black text-white/10 w-12 text-center relative z-10">#{index + 1}</div>

                            <div className="w-20 h-20 rounded-2xl bg-[#0b0f19] flex-shrink-0 overflow-hidden relative border border-white/5 group-hover:scale-105 transition duration-500 z-10">
                                {app.icon_url ? (
                                    <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Icon</div>
                                )}
                            </div>

                            <Link href={`/app/${app.id}`} className="flex-1 min-w-0 group z-10">
                                <h2 className="text-xl font-bold text-white truncate mb-1 group-hover:text-cyan-400 transition">{app.name}</h2>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="bg-white/5 px-2 py-0.5 rounded text-xs uppercase tracking-wide">{app.category}</span>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="font-bold text-gray-300">4.9</span>
                                    </div>
                                </div>
                            </Link>

                            <Link href={`/app/${app.id}`} className="bg-white/5 text-cyan-400 p-3 rounded-xl hover:bg-cyan-500 hover:text-white transition z-10 border border-white/5">
                                <Download className="w-6 h-6" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
