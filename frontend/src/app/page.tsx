'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  Rocket,
  ShieldCheck,
  BarChart3,
  Globe2,
  ChevronRight,
  Code2,
  Sparkles,
  Layers,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.push('/developer/dashboard');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute top-[10%] right-[10%] w-px h-[400px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"></div>
          <div className="absolute top-[40%] left-[5%] w-px h-[300px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-bold text-cyan-400 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="w-4 h-4" />
              Early Access Developer Program
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Shape the Future. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">Start Early.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 font-medium">
              We're building the next generation of application discovery. Join us as a pioneer developer, post your first apps, and help define the platform from day one.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link href="/developer/signup" className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-xl hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1 overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">
                  Join Early Access
                  <Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Link>
              <Link href="/developer/login" className="px-10 py-5 bg-white/5 text-white rounded-2xl font-bold text-xl hover:bg-white/10 transition border border-white/10 backdrop-blur-md flex items-center gap-3">
                Console Access <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 relative border-t border-white/5 bg-[#0b1225]/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#131b2e] rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all group">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Pioneer Advantage</h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                Be the first in your category. Early developers get curated featuring and dedicated placement as we scale our user base.
              </p>
            </div>

            <div className="p-8 bg-[#131b2e] rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Layers className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Direct Influence</h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                Work directly with our team. Your feedback shapes the tools, APIs, and features we build for the Developer Console.
              </p>
            </div>

            <div className="p-8 bg-[#131b2e] rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all group">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Smart Listings</h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                Optimized pages for your software. Support for custom icons, galleries, and rich descriptions to make your app shine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] -z-10"></div>

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Designed for the <br />
                <span className="text-cyan-400">First Wave</span> of Creators.
              </h2>

              <div className="space-y-6">
                {[
                  { title: "Zero Commission Forever", desc: "Early adopters lock in 0% platform fees for all direct-link monetization." },
                  { title: "Vanguard Badge", desc: "Exclusive profile indicator for developers who joined during our launch phase." },
                  { title: "Priority Support", desc: "Direct 1-on-1 access to our core engineers via private dev channels." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition border border-transparent hover:border-white/5">
                    <div className="mt-1">
                      <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-gray-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative bg-gradient-to-br from-[#131b2e] to-[#0a0f1e] p-2 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <div className="bg-[#0b0f19] rounded-[1.6rem] p-8 aspect-video flex items-center justify-center border border-white/5 relative z-10">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>
                    <div className="h-24 bg-white/5 rounded-2xl animate-pulse delay-75"></div>
                    <div className="h-24 bg-white/5 rounded-2xl animate-pulse delay-150"></div>
                    <div className="h-24 bg-white/5 rounded-2xl animate-pulse delay-300"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Code2 className="w-20 h-20 text-cyan-500/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#050811]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">RK<span className="text-cyan-400">MODS</span></span>
            </div>

            <div className="flex items-center gap-12 font-bold text-gray-500 text-sm tracking-widest uppercase">
              <span className="hover:text-white transition cursor-pointer">Terms</span>
              <span className="hover:text-white transition cursor-pointer">Privacy</span>
              <span className="hover:text-white transition cursor-pointer">Contact</span>
            </div>

            <p className="text-gray-600 font-medium text-sm">
              &copy; 2026 RKMODS Developer Portal.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
