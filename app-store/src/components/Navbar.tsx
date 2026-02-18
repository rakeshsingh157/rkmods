'use client';

import Link from 'next/link';
import { Search, Menu, X, Sparkles, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

export default function Navbar() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        // Check for existing auth
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#0b0f19]/90 backdrop-blur-xl border-white/5 py-3' : 'bg-transparent border-transparent py-5'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 z-50 relative group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-white">RK<span className="text-cyan-400">MODS</span></span>
                    </Link>

                    {/* Desktop Search */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-96 focus-within:bg-white/10 focus-within:border-cyan-500/50 transition-all">
                        <Search className="text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search apps, games, tools..."
                            className="bg-transparent border-none outline-none ml-3 w-full text-sm font-medium text-gray-200 placeholder-gray-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </form>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-white transition">Home</Link>
                        <Link href="/trending" className="text-sm font-bold text-gray-400 hover:text-white transition">Trending</Link>
                        <Link href="/categories" className="text-sm font-bold text-gray-400 hover:text-white transition">Categories</Link>
                        {user && (
                            <Link href="/profile" className="text-sm font-bold text-gray-400 hover:text-white transition">Profile</Link>
                        )}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/profile" className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition group">
                                    <User className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
                                    <span className="text-sm font-semibold text-white group-hover:text-cyan-100">{user.username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-bold text-gray-400 hover:text-red-400 transition flex items-center gap-1"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-cyan-500/30 transition"
                            >
                                Login
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-white bg-white/5 rounded-lg"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-[#0b0f19] pt-24 px-6 md:hidden">
                    <form onSubmit={handleSearch} className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-8">
                        <Search className="text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none ml-3 w-full text-lg font-medium text-white"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </form>
                    <div className="space-y-2">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-xl font-bold text-gray-200 py-3 border-b border-white/5">Home</Link>
                        <Link href="/trending" onClick={() => setMobileMenuOpen(false)} className="block text-xl font-bold text-gray-200 py-3 border-b border-white/5">Trending</Link>
                        <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="block text-xl font-bold text-gray-200 py-3 border-b border-white/5">Categories</Link>

                        {user ? (
                            <>
                                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-xl font-bold text-cyan-400 py-3 border-b border-white/5 hover:text-cyan-300 transition">
                                    👤 {user.username}
                                </Link>
                                <button onClick={handleLogout} className="block w-full text-left text-xl font-bold text-red-400 py-3">Logout</button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setAuthModalOpen(true);
                                    setMobileMenuOpen(false);
                                }}
                                className="block w-full text-left text-xl font-bold text-cyan-400 py-3"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            )}

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onAuthSuccess={(newUser) => setUser(newUser)}
            />
        </>
    );
}
