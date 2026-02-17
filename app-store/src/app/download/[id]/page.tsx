import Link from 'next/link';
import { Download, ChevronLeft, Loader2, ShieldCheck, FileDown } from 'lucide-react';
import AutoDownload from './AutoDownload';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getAppDetails(id: string) {
    try {
        const res = await fetch(`${API_URL}/api/user/apps/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

export default async function DownloadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const app = await getAppDetails(id);

    if (!app) {
        return (
            <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white">
                <p>App not found.</p>
                <Link href="/" className="ml-4 text-cyan-400 hover:underline">Go Home</Link>
            </div>
        );
    }

    return (
        <main className="relative min-h-screen w-full bg-[#0B1120] overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-cyan-500/30">

            {/* Background Ambience & Image */}
            <div className="absolute inset-0 z-0">
                {app.icon_url && (
                    <img
                        src={app.icon_url}
                        alt=""
                        className="w-full h-full object-cover blur-2xl opacity-30 scale-110 animate-pulse-slow"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-[#0B1120]/60"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Content Card */}
            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-[#131b2e]/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl shadow-black/50 text-center transform transition-all hover:scale-[1.02] duration-500">

                    {/* Icon */}
                    <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-[#0B1120] shadow-2xl border border-white/10 overflow-hidden relative group">
                        {app.icon_url ? (
                            <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">No Icon</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    </div>

                    {/* Title & Status */}
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{app.name}</h1>
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider border border-cyan-500/20 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3" /> Verified Secure
                        </span>
                        <span className="text-gray-500 text-xs font-medium">v{app.version}</span>
                    </div>

                    {/* Loading Animation / Status */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-3 text-cyan-400 font-bold text-lg animate-pulse">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Starting Download...</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">Please wait while we prepare your file.</p>
                    </div>

                    {/* Manual Download Link */}
                    <div className="space-y-4">
                        <a
                            href={`${API_URL}/api/user/apps/${app.id}/download`}
                            className="block w-full bg-white text-black hover:bg-cyan-400 hover:text-black py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-white/5 active:scale-95"
                        >
                            Click here if it doesn't start
                        </a>

                        <Link href={`/app/${app.id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition text-sm font-medium">
                            <ChevronLeft className="w-4 h-4" />
                            Return to App Page
                        </Link>
                    </div>
                </div>
            </div>

            {/* Auto Download Logic */}
            <AutoDownload downloadUrl={`${API_URL}/api/user/apps/${app.id}/download`} />

        </main>
    );
}
