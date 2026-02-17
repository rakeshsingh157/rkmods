import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Download, Star, Calendar, HardDrive, ShieldCheck, User, ChevronLeft, Zap, Shield, Sparkles, TrendingUp, Clock, Package, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp, Cpu, Gauge, Smartphone, Lock } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';
import ShareButton from '@/components/ShareButton';
import ScreenshotGallery from '@/components/ScreenshotGallery';
import InstallationGuide from '@/components/InstallationGuide';
import ReviewSection from '@/components/ReviewSection';
import RatingBreakdown from '@/components/RatingBreakdown';
import DynamicBackground from '@/components/DynamicBackground';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

async function getAppDetails(id: string) {
    try {
        const res = await fetch(`${API_URL}/api/user/apps/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('Error fetching app details:', error);
        return null;
    }
}

export default async function AppPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const app = await getAppDetails(id);

    if (!app) {
        return (
            <main className="min-h-screen text-white">
                <Navbar />
                <div className="container mx-auto py-32 text-center">
                    <h1 className="text-3xl font-bold text-gray-200">App not found</h1>
                    <Link href="/" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">Return Home</Link>
                </div>
            </main>
        );
    }

    const relatedApps = app.related || [];
    const reviews = app.reviews || [];
    const downloadCount = app.download_count || 0;
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 'New';

    return (
        <main className="min-h-screen font-sans text-gray-200 selection:bg-cyan-500 selection:text-white relative overflow-hidden">
            {/* Animated Background Elements */}
            {app.icon_url && <DynamicBackground iconUrl={app.icon_url} />}

            <Navbar />

            {/* Header / Banner */}
            <div className="relative pt-24 md:pt-32 pb-8 md:pb-12 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-900/10 via-purple-900/5 to-transparent -z-10"></div>
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 md:mb-8 transition group">
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition" />
                        <span className="text-sm md:text-base">Back to Home</span>
                    </Link>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-2xl md:rounded-3xl bg-[#131b2e] flex-shrink-0 overflow-hidden shadow-2xl shadow-cyan-500/20 border border-white/10 relative group">
                            {app.icon_url ? (
                                <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Icon</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        </div>

                        <div className="flex-1 text-center md:text-left w-full">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-3 md:mb-4">
                                <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
                                    {app.category}
                                </span>
                                <span className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 border border-green-500/20 shadow-lg shadow-green-500/10">
                                    <ShieldCheck className="w-3 h-3" /> Verified
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 tracking-tight leading-tight">
                                {app.name}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6 text-xs md:text-sm text-gray-400 mb-6 md:mb-8">
                                <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                                    <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                                    <span className="font-bold text-white text-base md:text-lg">{averageRating}</span>
                                    <span className="text-gray-500 text-xs md:text-sm">({reviews.length})</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                                    <HardDrive className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                                    <span className="font-medium">{app.size || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                                    <span className="font-medium">v{app.version}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center md:justify-start">
                                <a
                                    href={`${API_URL}/api/user/apps/${app.id}/download`}
                                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base hover:shadow-lg hover:shadow-cyan-500/30 transition transform hover:-translate-y-0.5 active:scale-95"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Mod
                                </a>
                                <ShareButton appName={app.name} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8 md:space-y-12">

                        {/* Screenshots */}
                        {app.screenshots && app.screenshots.length > 0 && (
                            <section className="animate-fadeIn [animation-delay:0.05s]">
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
                                    <span className="w-1 h-7 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></span>
                                    Screenshots
                                    <span className="bg-cyan-500/10 text-cyan-400 px-2.5 md:px-3 py-1 rounded-full text-xs font-bold border border-cyan-500/20">
                                        {app.screenshots.length}
                                    </span>
                                </h2>
                                <ScreenshotGallery screenshots={app.screenshots} />
                            </section>
                        )}

                        {/* Description */}
                        <section className="animate-fadeIn [animation-delay:0.1s]">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
                                <span className="w-1 h-7 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></span>
                                About this Mod
                            </h2>
                            <div className="prose prose-invert max-w-none text-gray-400 text-sm md:text-base leading-relaxed whitespace-pre-wrap bg-[#131b2e] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 shadow-lg hover:border-white/10 transition">
                                {app.description}
                            </div>
                        </section>

                        {/* What's New / Features Section */}
                        <section className="animate-fadeIn [animation-delay:0.15s]">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
                                <span className="w-1 h-7 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
                                Key Features
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {app.key_features && app.key_features.length > 0 ? (
                                    app.key_features.map((feat: any, i: number) => {
                                        const icons = [Zap, Sparkles, Shield, TrendingUp, Cpu, Gauge, Smartphone, Lock];
                                        const IconComp = icons[i % icons.length] || Zap;
                                        const colors = [
                                            'from-cyan-500/20 to-blue-600/20 border-cyan-500/20 text-cyan-400',
                                            'from-purple-500/20 to-pink-600/20 border-purple-500/20 text-purple-400',
                                            'from-green-500/20 to-emerald-600/20 border-green-500/20 text-green-400',
                                            'from-yellow-500/20 to-orange-600/20 border-yellow-500/20 text-yellow-400',
                                            'from-blue-500/20 to-indigo-600/20 border-blue-500/20 text-blue-400',
                                            'from-red-500/20 to-rose-600/20 border-red-500/20 text-red-500'
                                        ];
                                        const colorClass = colors[i % colors.length];

                                        return (
                                            <div key={i} className="bg-[#131b2e] p-5 rounded-xl border border-white/5 hover:border-white/10 hover:shadow-lg transition group">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0 group-hover:scale-110 transition border`}>
                                                        <IconComp className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white mb-1">{feat.title}</h3>
                                                        <p className="text-sm text-gray-400">{feat.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full bg-[#131b2e] p-8 rounded-xl border border-white/5 border-dashed text-center">
                                        <p className="text-gray-500 italic">No specific features listed yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Installation Guide */}
                        <InstallationGuide appName={app.name} />

                        {/* What's New Section */}
                        <section className="animate-fadeIn [animation-delay:0.2s]">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
                                <span className="w-1 h-7 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
                                What's New in v{app.version}
                            </h2>
                            <div className="bg-[#131b2e] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 shadow-lg">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm text-gray-400">Updated on {new Date(app.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <ul className="space-y-4 text-gray-300">
                                    {app.changelog && app.changelog.updates && app.changelog.updates.length > 0 ? (
                                        app.changelog.updates.map((update: string, i: number) => (
                                            <li key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition group">
                                                <div className="bg-green-500/20 p-1.5 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                                                    <CheckCircle2 className="w-4 h-4 text-green-400 group-hover:text-inherit shrink-0" />
                                                </div>
                                                <span className="text-sm md:text-base">{update}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 italic text-center py-4">Regular performance improvements and bug fixes.</li>
                                    )}
                                </ul>
                            </div>
                        </section>

                        {/* Reviews */}
                        <section className="animate-fadeIn [animation-delay:0.25s]">
                            <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-4">
                                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                                    <span className="w-1 h-7 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full"></span>
                                    Ratings & Reviews
                                </h2>
                            </div>

                            {/* Rating Summary */}
                            <div className="bg-[#131b2e] p-6 md:p-8 rounded-2xl border border-white/5 shadow-lg mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="text-5xl md:text-6xl font-black text-white mb-2">{averageRating}</div>
                                        <div className="flex text-yellow-400 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? 'fill-current' : ''}`} />
                                            ))}
                                        </div>
                                        <p className="text-gray-400 text-sm">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                                    </div>
                                    <RatingBreakdown reviews={reviews} />
                                </div>
                            </div>

                            <ReviewForm appId={app.id} />

                            <ReviewSection reviews={reviews} appId={app.id} />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 md:space-y-8 lg:sticky lg:top-24 lg:self-start">
                        {/* Download Stats Card */}
                        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-cyan-500/20 shadow-lg hover:shadow-cyan-500/20 transition animate-fadeIn [animation-delay:0.3s]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl md:text-3xl font-black text-white">{downloadCount.toLocaleString()}</div>
                                    <div className="text-xs text-cyan-400 font-medium">Total Downloads</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full w-[75%]"></div>
                                </div>
                                <span className="text-green-400 font-bold">+24%</span>
                            </div>
                        </div>

                        {/* Safety & Compatibility */}
                        <div className="bg-[#131b2e] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 shadow-lg hover:border-white/10 transition animate-fadeIn [animation-delay:0.32s]">
                            <h3 className="font-bold text-white mb-4 md:mb-5 text-base md:text-lg flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
                                Safety & Info
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                                    <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-green-400">Verified Safe</div>
                                        <div className="text-xs text-gray-500">Scanned & tested</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                                    <Package className="w-5 h-5 text-blue-400 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-blue-400">Requires Android</div>
                                        <div className="text-xs text-gray-500">5.0 and up</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                                    <Info className="w-5 h-5 text-purple-400 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-purple-400">File Size</div>
                                        <div className="text-xs text-gray-500">{app.size || 'Varies by device'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* App Info Card */}
                        <div className="bg-[#131b2e] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 shadow-lg hover:border-white/10 transition animate-fadeIn [animation-delay:0.35s]">
                            <h3 className="font-bold text-white mb-5 md:mb-6 text-base md:text-lg flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
                                Mod Information
                            </h3>
                            <div className="space-y-3 md:space-y-4 text-sm">
                                <div className="flex justify-between py-2.5 md:py-3 border-b border-white/5">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500/50"></div>
                                        Version
                                    </span>
                                    <span className="font-bold text-cyan-400">{app.version}</span>
                                </div>
                                <div className="flex justify-between py-2.5 md:py-3 border-b border-white/5">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
                                        Updated
                                    </span>
                                    <span className="font-medium text-gray-300">{new Date(app.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-2.5 md:py-3 border-b border-white/5">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500/50"></div>
                                        Downloads
                                    </span>
                                    <span className="font-bold text-purple-400">{downloadCount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2.5 md:py-3">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                                        Developer
                                    </span>
                                    <span className="font-bold text-green-400">RK Mods</span>
                                </div>
                            </div>
                        </div>

                        {/* Related Apps */}
                        <div className="animate-fadeIn [animation-delay:0.4s]">
                            <h3 className="font-bold text-white mb-4 md:mb-6 text-base md:text-lg flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-pink-500 to-rose-600 rounded-full"></span>
                                You might also like
                            </h3>
                            <div className="space-y-3 md:space-y-4">
                                {relatedApps.map((related: any) => (
                                    <Link key={related.id} href={`/app/${related.id}`} className="flex items-center gap-3 md:gap-4 bg-[#131b2e] p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition group active:scale-95">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-background shrink-0 overflow-hidden border border-white/5 group-hover:scale-105 transition">
                                            {related.icon_url ? (
                                                <img src={related.icon_url} alt={related.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Icon</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-200 text-sm md:text-base truncate group-hover:text-cyan-400 transition">{related.name}</h4>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">{related.category}</p>
                                        </div>
                                        <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 rotate-180 group-hover:translate-x-1 transition" />
                                    </Link>
                                ))}
                                {relatedApps.length === 0 && (
                                    <div className="text-center py-8 bg-[#131b2e] rounded-xl border border-white/5 border-dashed">
                                        <p className="text-gray-500 text-xs md:text-sm">No related apps found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
