import pool from '@/lib/db';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Download, Star, Calendar, HardDrive, ShieldCheck, User, ChevronLeft } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';
import ShareButton from '@/components/ShareButton';
import ScreenshotGallery from '@/components/ScreenshotGallery';

async function getApp(id: string) {
    try {
        const res = await pool.query('SELECT * FROM apps WHERE id = $1', [id]);
        return res.rows[0];
    } catch (error) {
        console.error('Error fetching app:', error);
        return null;
    }
}

async function getRelatedApps(category: string, currentId: number) {
    try {
        const res = await pool.query('SELECT * FROM apps WHERE category = $1 AND id != $2 LIMIT 4', [category, currentId]);
        return res.rows;
    } catch (error) {
        return [];
    }
}

async function getReviews(appId: number) {
    try {
        const res = await pool.query('SELECT * FROM reviews WHERE app_id = $1 ORDER BY created_at DESC', [appId]);
        return res.rows;
    } catch (error) {
        return [];
    }
}

async function getDownloadCount(appId: number) {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM downloads WHERE app_id = $1', [appId]);
        return parseInt(res.rows[0].count);
    } catch (error) {
        return 0;
    }
}

export default async function AppPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const app = await getApp(id);

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

    const relatedApps = await getRelatedApps(app.category, app.id);
    const reviews = await getReviews(app.id);
    const downloadCount = await getDownloadCount(app.id);
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 'New';

    return (
        <main className="min-h-screen font-sans text-gray-200 selection:bg-cyan-500 selection:text-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
            
            <Navbar />

            {/* Header / Banner */}
            <div className="relative pt-24 md:pt-32 pb-8 md:pb-12 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-900/10 via-purple-900/5 to-transparent -z-10"></div>
                <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 md:mb-8 transition group">
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition" /> 
                        <span className="text-sm md:text-base">Back to Home</span>
                    </Link>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-12 items-center md:items-start">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-52 lg:h-52 rounded-2xl md:rounded-3xl bg-[#131b2e] flex-shrink-0 overflow-hidden shadow-2xl shadow-cyan-500/20 border border-white/10 relative group">
                            {app.icon_url ? (
                                <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs md:text-sm">No Icon</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        </div>

                        <div className="flex-1 text-center md:text-left w-full max-w-3xl">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-3 md:mb-5">
                                <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
                                    {app.category}
                                </span>
                                <span className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 border border-green-500/20 shadow-lg shadow-green-500/10">
                                    <ShieldCheck className="w-3 h-3" /> Verified
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-3 md:mb-5 tracking-tight leading-tight">
                                {app.name}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 lg:gap-6 text-xs md:text-sm text-gray-400 mb-6 md:mb-8">
                                <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition">
                                    <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                                    <span className="font-bold text-white text-base md:text-lg">{averageRating}</span>
                                    <span className="text-gray-500 text-xs md:text-sm">({reviews.length})</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition">
                                    <HardDrive className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                                    <span className="font-medium">{app.size || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition">
                                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                                    <span className="font-medium">v{app.version}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center md:justify-start">
                                <a
                                    href={`/api/download/${app.id}`}
                                    className="w-full sm:flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 md:px-10 lg:px-12 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:shadow-lg hover:shadow-cyan-500/30 transition transform hover:-translate-y-1 active:scale-95"
                                >
                                    <Download className="w-5 h-5 md:w-6 md:h-6" />
                                    Download Mod
                                </a>
                                <ShareButton appName={app.name} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-8 md:py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8 md:space-y-10 lg:space-y-12">

                        {/* Screenshots */}
                        {app.screenshots && app.screenshots.length > 0 && (
                            <section className="animate-fadeIn">
                                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
                                    <span className="w-1 h-7 md:h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></span>
                                    Screenshots
                                    <span className="bg-cyan-500/10 text-cyan-400 px-2.5 md:px-3 py-1 rounded-full text-xs font-bold border border-cyan-500/20">
                                        {app.screenshots.length}
                                    </span>
                                </h2>
                                <ScreenshotGallery screenshots={app.screenshots} />
                            </section>
                        )}

                        {/* Description */}
                        <section className="animate-fadeIn" style={{animationDelay: '0.1s'}}>
                            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
                                <span className="w-1 h-7 md:h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></span>
                                About this Mod
                            </h2>
                            <div className="prose prose-invert max-w-none text-gray-400 text-sm md:text-base lg:text-lg leading-relaxed whitespace-pre-wrap bg-[#131b2e] p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-white/5 shadow-lg hover:border-white/10 transition">
                                {app.description}
                            </div>
                        </section>

                        {/* Reviews */}
                        <section className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                                    <span className="w-1 h-7 md:h-8 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full"></span>
                                    Ratings & Reviews
                                </h2>
                            </div>

                            <ReviewForm appId={app.id} />

                            <div className="space-y-3 md:space-y-4 mt-6 md:mt-8">
                                {reviews.map((review: any) => (
                                    <div key={review.id} className="bg-[#131b2e] p-4 md:p-6 lg:p-7 rounded-xl md:rounded-2xl border border-white/5 shadow-sm hover:border-white/10 hover:shadow-lg transition group">
                                        <div className="flex items-center justify-between mb-3 md:mb-4">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 font-bold text-xs md:text-sm lg:text-base border border-cyan-500/20 group-hover:scale-110 transition">
                                                    {review.user_name ? review.user_name[0].toUpperCase() : 'A'}
                                                </div>
                                                <span className="font-bold text-gray-200 text-sm md:text-base lg:text-lg">{review.user_name || 'Anonymous'}</span>
                                            </div>
                                            <div className="flex text-yellow-400">
                                                {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 fill-current" />)}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm md:text-base lg:text-lg leading-relaxed">{review.message}</p>
                                        <p className="text-xs md:text-sm text-gray-600 mt-3 md:mt-4">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                                {reviews.length === 0 && (
                                    <div className="text-center py-12 md:py-16 lg:py-20 bg-[#131b2e] rounded-xl md:rounded-2xl border border-white/5 border-dashed">
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                            <Star className="w-8 h-8 md:w-10 md:h-10 text-gray-600" />
                                        </div>
                                        <p className="text-gray-500 text-sm md:text-base lg:text-lg">No reviews yet. Be the first to review!</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 md:space-y-8 lg:sticky lg:top-24 lg:self-start">
                        {/* App Info Card */}
                        <div className="bg-[#131b2e] p-5 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl border border-white/5 shadow-lg hover:border-white/10 transition animate-fadeIn" style={{animationDelay: '0.3s'}}>
                            <h3 className="font-bold text-white mb-5 md:mb-6 text-base md:text-lg lg:text-xl flex items-center gap-2">
                                <span className="w-1 h-6 md:h-7 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
                                Mod Information
                            </h3>
                            <div className="space-y-3 md:space-y-4 text-sm md:text-base">
                                <div className="flex justify-between py-2.5 md:py-3 lg:py-4 border-b border-white/5">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500/50"></div>
                                        Version
                                    </span>
                                    <span className="font-bold text-cyan-400 text-sm md:text-base lg:text-lg">{app.version}</span>
                                </div>
                                <div className="flex justify-between py-2.5 md:py-3 lg:py-4 border-b border-white/5">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
                                        Updated
                                    </span>
                                    <span className="font-medium text-gray-300 text-sm md:text-base">{new Date(app.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-2.5 md:py-3 lg:py-4 border-b border-white/5">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500/50"></div>
                                        Downloads
                                    </span>
                                    <span className="font-bold text-purple-400 text-sm md:text-base lg:text-lg">{downloadCount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2.5 md:py-3 lg:py-4">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                                        Developer
                                    </span>
                                    <span className="font-bold text-green-400 text-sm md:text-base lg:text-lg">RK Mods</span>
                                </div>
                            </div>
                        </div>

                        {/* Related Apps */}
                        <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
                            <h3 className="font-bold text-white mb-4 md:mb-6 text-base md:text-lg lg:text-xl flex items-center gap-2">
                                <span className="w-1 h-6 md:h-7 bg-gradient-to-b from-pink-500 to-rose-600 rounded-full"></span>
                                You might also like
                            </h3>
                            <div className="space-y-3 md:space-y-4">
                                {relatedApps.map((related: any) => (
                                    <Link key={related.id} href={`/app/${related.id}`} className="flex items-center gap-3 md:gap-4 bg-[#131b2e] p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition group active:scale-95">
                                        <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg md:rounded-xl bg-background shrink-0 overflow-hidden border border-white/5 group-hover:scale-105 transition">
                                            {related.icon_url ? (
                                                <img src={related.icon_url} alt={related.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Icon</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-200 text-sm md:text-base lg:text-lg truncate group-hover:text-cyan-400 transition">{related.name}</h4>
                                            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wide">{related.category}</p>
                                        </div>
                                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-cyan-400 rotate-180 group-hover:translate-x-1 transition" />
                                    </Link>
                                ))}
                                {relatedApps.length === 0 && (
                                    <div className="text-center py-8 md:py-10 bg-[#131b2e] rounded-xl border border-white/5 border-dashed">
                                        <p className="text-gray-500 text-xs md:text-sm lg:text-base">No related apps found.</p>
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
