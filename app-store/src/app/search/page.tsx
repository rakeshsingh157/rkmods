import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Download, Search as SearchIcon } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

async function searchApps(query: string) {
    if (!query) return [];
    try {
        const res = await fetch(`${API_URL}/api/user/apps/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
    const { q } = await searchParams;
    const apps = await searchApps(q);

    return (
        <main className="min-h-screen font-sans selection:bg-cyan-500 selection:text-white">
            <Navbar />

            <div className="relative pt-32 pb-12 border-b border-white/5">
                <div className="container mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/5 text-gray-200 rounded-2xl border border-white/10">
                            <SearchIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Results for "{q}"</h1>
                    </div>
                    <p className="text-gray-400">Found {apps.length} matching apps</p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app: any) => (
                        <div key={app.id} className="bg-[#131b2e] rounded-3xl shadow-lg border border-white/5 hover:border-cyan-500/30 transition p-6 flex flex-col group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

                            <Link href={`/app/${app.id}`} className="flex items-start gap-4 group mb-4 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-[#0b0f19] flex-shrink-0 overflow-hidden border border-white/5 group-hover:scale-105 transition duration-500">
                                    {app.icon_url ? (
                                        <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Icon</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-white truncate group-hover:text-cyan-400 transition">{app.name}</h2>
                                    <p className="text-gray-500 text-sm font-medium">{app.category}</p>
                                </div>
                            </Link>

                            <p className="text-gray-400 mt-2 line-clamp-2 text-sm flex-1 relative z-10">{app.description}</p>

                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                                <span className="text-xs text-gray-500 font-mono">v{app.version}</span>
                                <Link href={`/app/${app.id}`} className="flex items-center gap-2 text-cyan-400 font-bold hover:text-white hover:bg-cyan-500 px-4 py-2 rounded-xl transition bg-cyan-500/10">
                                    <Download className="w-4 h-4" />
                                    View
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {apps.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                            <SearchIcon className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                        <p className="text-gray-500">Try searching for something else.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
