import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Gamepad2, Briefcase, Users, Wrench, Film, ChevronRight, Zap } from 'lucide-react';

const categories = [
    { name: 'Games', icon: Gamepad2, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', desc: 'Action, Puzzle, RPG, and more' },
    { name: 'Productivity', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'Tools to help you get things done' },
    { name: 'Social', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', desc: 'Connect with friends and family' },
    { name: 'Tools', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', desc: 'Utilities for your device' },
    { name: 'Entertainment', icon: Film, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', desc: 'Movies, Music, and Streaming' },
];

export default function CategoriesPage() {
    return (
        <main className="min-h-screen font-sans flex flex-col selection:bg-cyan-500 selection:text-white">
            <Navbar />

            <div className="relative pt-32 pb-12 border-b border-white/5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/10 to-[#0b0f19] -z-10"></div>
                <div className="container mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Browse Categories</h1>
                    </div>
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        Find exactly what you're looking for. Explore our vast collection of mods by category.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <Link key={cat.name} href={`/search?q=${cat.name}`} className={`group bg-[#131b2e] p-8 rounded-3xl border border-white/5 shadow-lg hover:border-white/20 transition flex items-center gap-6 relative overflow-hidden`}>
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition duration-500 ${cat.bg}`}></div>

                            <div className={`w-16 h-16 rounded-2xl ${cat.bg} ${cat.color} ${cat.border} border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition shadow-lg`}>
                                <cat.icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1 relative z-10">
                                <h2 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition">{cat.name}</h2>
                                <p className="text-gray-500 text-sm">{cat.desc}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition relative z-10" />
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
