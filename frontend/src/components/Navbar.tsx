'use client';

import Link from 'next/link';
import { Search, Menu, X, Sparkles, LayoutDashboard, Upload, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        // Check for existing auth
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Auth parse error", e);
            }
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#0a0f1e]/90 backdrop-blur-xl border-white/5 py-3' : 'bg-transparent border-transparent py-5'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 z-50 relative group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-white">RK<span className="text-cyan-400">MODS</span></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-white transition">Home</Link>
                        {user ? (
                            <>
                                <Link href="/developer/dashboard" className="text-sm font-bold text-gray-400 hover:text-white transition flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <Link href="/developer/upload" className="text-sm font-bold text-gray-400 hover:text-white transition flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Publish
                                </Link>
                                <div className="h-4 w-px bg-white/10 mx-2"></div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-white bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                        <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                                            <User className="w-3 h-3 text-white" />
                                        </div>
                                        {user.email?.split('@')[0]}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-bold text-gray-400 hover:text-red-400 transition flex items-center gap-1"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/developer/login" className="text-sm font-bold text-gray-400 hover:text-white transition">Login</Link>
                                <Link
                                    href="/developer/signup"
                                    className="text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition transform hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-white bg-white/5 rounded-lg border border-white/10"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-[#0a0f1e] pt-24 px-6 md:hidden animate-in fade-in duration-300">
                    <div className="space-y-4">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-xl font-bold text-gray-200 py-3 border-b border-white/5">Home</Link>
                        {user ? (
                            <>
                                <Link href="/developer/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-xl font-bold text-gray-200 py-3 border-b border-white/5">Dashboard</Link>
                                <Link href="/developer/upload" onClick={() => setMobileMenuOpen(false)} className="block text-xl font-bold text-gray-200 py-3 border-b border-white/5">Upload App</Link>
                                <button onClick={handleLogout} className="block w-full text-left text-xl font-bold text-red-400 py-3">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/developer/login" onClick={() => setMobileMenuOpen(false)} className="block text-xl font-bold text-gray-200 py-3 border-b border-white/5">Login</Link>
                                <Link href="/developer/signup" onClick={() => setMobileMenuOpen(false)} className="block text-xl font-bold text-cyan-400 py-3 border-b border-white/5">Join Program</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
