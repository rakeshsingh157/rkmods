import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Download, Star, ChevronRight, Zap, Trophy, Smartphone, Flame, Gamepad2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const dynamic = 'force-dynamic';

async function getApps() {
  try {
    const res = await fetch(`${API_URL}/api/user/apps`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch apps');
    return res.json();
  } catch (error) {
    console.error('Error fetching apps:', error);
    return [];
  }
}

async function getStats() {
  try {
    const res = await fetch(`${API_URL}/api/user/stats`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { apps: '0', downloads: '0' };
  }
}

export default async function Home() {
  const apps = await getApps();
  const stats = await getStats();

  return (
    <main className="min-h-screen font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] -z-10 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] -z-10 opacity-30"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-sm font-semibold text-cyan-400 mb-8 shadow-lg shadow-cyan-500/10">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                The Ultimate App Store
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                Unlock your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">true potential.</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Download premium apps, unlocked features, and exclusive games. No ads, no limits, just pure performance.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/trending" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition transform hover:-translate-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5" />
                    Hot Apps
                  </div>
                </Link>
                <Link href="/categories" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Browse Games
                  </div>
                </Link>
              </div>
            </div>

            {/* Hero Stats/Visual */}
            <div className="lg:w-1/2 w-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-8">
                  <div className="bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-2xl">
                    <Smartphone className="w-8 h-8 text-cyan-400 mb-3" />
                    <div className="text-3xl font-bold text-white">{stats.apps}</div>
                    <div className="text-sm text-gray-400">Premium Apps</div>
                  </div>
                  <div className="bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-2xl opacity-80">
                    <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                    <div className="text-3xl font-bold text-white">Fast</div>
                    <div className="text-sm text-gray-400">Downloads</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-2xl opacity-80">
                    <Download className="w-8 h-8 text-green-400 mb-3" />
                    <div className="text-3xl font-bold text-white">{stats.downloads}</div>
                    <div className="text-sm text-gray-400">Total Installs</div>
                  </div>
                  <div className="bg-[#131b2e] p-6 rounded-2xl border border-white/5 shadow-2xl">
                    <Trophy className="w-8 h-8 text-purple-400 mb-3" />
                    <div className="text-3xl font-bold text-white">#1</div>
                    <div className="text-sm text-gray-400">Trusted Source</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Apps Section */}
      <div className="container mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
              Featured Apps
            </h2>
            <p className="text-gray-400 font-medium ml-4">Hand-picked for you today</p>
          </div>
          <Link href="/trending" className="hidden md:flex items-center gap-2 text-cyan-400 font-bold hover:text-cyan-300 transition-all bg-cyan-500/10 px-4 py-2 rounded-lg">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apps.map((app: any) => (
            <Link key={app.id} href={`/app/${app.id}`} className="group bg-[#131b2e] rounded-2xl p-4 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 border border-white/5 hover:border-cyan-500/30 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden">
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>

              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className="w-20 h-20 rounded-xl bg-[#0b0f19] shadow-inner overflow-hidden relative group-hover:scale-105 transition duration-500 border border-white/5">
                  {app.icon_url ? (
                    <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">Icon</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-400 transition">{app.name}</h3>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">{app.category}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs font-bold text-gray-300">4.9</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto relative z-10">
                <div className="flex items-center justify-between bg-[#0b0f19] rounded-lg p-3 border border-white/5 group-hover:border-white/10 transition">
                  <span className="text-xs font-mono text-gray-500">v{app.version}</span>
                  <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
                    <Download className="w-4 h-4" />
                    <span>Get</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {apps.length === 0 && (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5">
            <div className="bg-[#0b0f19] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/50 border border-white/5">
              <Gamepad2 className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No apps found</h3>
            <p className="text-gray-400">Upload your first app to get started!</p>
          </div>
        )}

        <div className="mt-12 text-center md:hidden">
          <Link href="/trending" className="inline-flex items-center gap-2 text-cyan-400 font-bold bg-cyan-500/10 px-6 py-3 rounded-xl w-full justify-center">
            See All Apps <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
