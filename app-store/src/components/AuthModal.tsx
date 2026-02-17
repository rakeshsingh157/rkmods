'use client';

import { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (user: any, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isLogin ? '/api/user/auth/store-login' : '/api/user/auth/store-signup';
        const body = isLogin
            ? { email: formData.email, password: formData.password }
            : {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                password: formData.password
            };

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onAuthSuccess(data.user, data.token);
                onClose();
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {isLogin ? <LogIn className="w-6 h-6 text-cyan-400" /> : <UserPlus className="w-6 h-6 text-cyan-400" />}
                        {isLogin ? 'Login' : 'Sign Up'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-[#131b2e] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                                        required={!isLogin}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-[#131b2e] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full bg-[#131b2e] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                                    required={!isLogin}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-[#131b2e] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-[#131b2e] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition disabled:opacity-50"
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-cyan-400 hover:text-cyan-300 text-sm transition"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-400 text-xs transition"
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
}
