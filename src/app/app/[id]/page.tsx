import pool from '@/lib/db';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Download, Star, Calendar, HardDrive, ShieldCheck, User, ChevronLeft } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';
import ShareButton from '@/components/ShareButton';

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
            <main className="min-h-screen bg-[#0b0f19] text-white">
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
        <main className="min-h-screen bg-[#0b0f19] font-sans text-gray-200 selection:bg-cyan-500 selection:text-white">
            <Navbar />

            {/* Header / Banner */}
            <div className="relative pt-32 pb-12 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-900/10 to-[#0b0f19] -z-10"></div>
                <div className="container mx-auto px-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
                        <ChevronLeft className="w-5 h-5" /> Back to Home
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-[#131b2e] flex-shrink-0 overflow-hidden shadow-2xl shadow-cyan-500/10 border border-white/10 relative group">
                            {app.icon_url ? (
                                <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">No Icon</div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-cyan-500/20">{app.category}</span>
                                <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 border border-green-500/20">
                                    <ShieldCheck className="w-3 h-3" /> Verified Safe
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">{app.name}</h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8">
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <span className="font-bold text-white text-lg">{averageRating}</span>
                                    <span className="text-gray-500">({reviews.length} Reviews)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <HardDrive className="w-5 h-5 text-gray-500" />
                                    <span className="font-medium">{app.size || 'Unknown Size'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <span className="font-medium">v{app.version}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <a
                                    href={`/api/download/${app.id}`}
                                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition transform hover:-translate-y-1"
                                >
                                    <Download className="w-6 h-6" />
                                    Download Mod
                                </a>
                                <ShareButton appName={app.name} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Screenshots */}
                        {app.screenshots && app.screenshots.length > 0 ? (
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-6">Screenshots</h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {app.screenshots.map((shot: string, i: number) => (
                                        <img key={i} src={shot} alt={`Screenshot ${i + 1}`} className="w-64 h-auto rounded-2xl shadow-lg border border-white/10" />
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {/* Description */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">About this Mod</h2>
                            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed whitespace-pre-wrap bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-inner">
                                {app.description}
                            </div>
                        </section>

                        {/* Reviews */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Ratings & Reviews</h2>
                            </div>

                            <ReviewForm appId={app.id} />

                            <div className="space-y-4 mt-8">
                                {reviews.map((review: any) => (
                                    <div key={review.id} className="bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-cyan-400 font-bold text-sm border border-white/10">
                                                    {review.user_name ? review.user_name[0].toUpperCase() : 'A'}
                                                </div>
                                                <span className="font-bold text-gray-200">{review.user_name || 'Anonymous'}</span>
                                            </div>
                                            <div className="flex text-yellow-400">
                                                {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 pl-13">{review.message}</p>
                                        <p className="text-xs text-gray-600 mt-4">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                                {reviews.length === 0 && (
                                    <div className="text-center py-12 bg-[#131b2e] rounded-2xl border border-white/5 border-dashed">
                                        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* App Info Card */}
                        <div className="bg-[#131b2e] p-6 rounded-3xl border border-white/5 shadow-lg">
                            <h3 className="font-bold text-white mb-6 text-lg">Mod Information</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-gray-500">Version</span>
                                    <span className="font-medium text-gray-300">{app.version}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-gray-500">Updated</span>
                                    <span className="font-medium text-gray-300">{new Date(app.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-gray-500">Downloads</span>
                                    <span className="font-medium text-cyan-400">{downloadCount}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-gray-500">Developer</span>
                                    <span className="font-medium text-blue-400">RK Mods</span>
                                </div>
                            </div>
                        </div>

                        {/* Related Apps */}
                        <div>
                            <h3 className="font-bold text-white mb-6 text-lg">You might also like</h3>
                            <div className="space-y-4">
                                {relatedApps.map((related: any) => (
                                    <Link key={related.id} href={`/app/${related.id}`} className="flex items-center gap-4 bg-[#131b2e] p-4 rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition group">
                                        <div className="w-14 h-14 rounded-xl bg-[#0b0f19] flex-shrink-0 overflow-hidden border border-white/5">
                                            {related.icon_url ? (
                                                <img src={related.icon_url} alt={related.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Icon</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-200 truncate group-hover:text-cyan-400 transition">{related.name}</h4>
                                            <p className="text-xs text-gray-500">{related.category}</p>
                                        </div>
                                    </Link>
                                ))}
                                {relatedApps.length === 0 && (
                                    <p className="text-gray-500 text-sm">No related apps found.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
