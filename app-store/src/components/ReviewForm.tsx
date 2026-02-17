'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ReviewForm({ appId }: { appId: string }) {
    const router = useRouter();
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username;
            setLoggedInUser(userData);
            if (!user) setUser(fullName);
        }
    }, [showForm]);



    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/user/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId, rating, message, user }),
            });

            if (res.ok) {
                setMessage('');
                setUser('');
                setRating(5);
                setShowForm(false);
                router.refresh();
            } else if (res.status === 429) {
                const data = await res.json();
                // Show a more visible error, maybe check if we have an error state for the form
                // For now, I'll use the alert or add an error state variable if likely.
                // Let's check imports... useState is there. I'll add an error state.
                const resetTime = new Date(data.resetAt).toLocaleTimeString();
                alert(`You are reviewing too fast! Please try again after ${resetTime}.`);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="bg-white/5 text-cyan-400 border border-cyan-500/30 px-6 py-3 rounded-xl font-bold hover:bg-cyan-500/10 transition w-full md:w-auto"
            >
                Write a Review
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-[#131b2e] p-6 rounded-3xl border border-white/5 mb-8 shadow-xl">
            <h3 className="font-bold text-white mb-6 text-lg">Write a Review</h3>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    {loggedInUser ? 'Reviewing as' : 'Your Name'}
                </label>
                <input
                    required
                    value={user}
                    onChange={(e) => !loggedInUser && setUser(e.target.value)}
                    readOnly={!!loggedInUser}
                    className={`w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition ${loggedInUser ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder="John Doe"
                />
                {!loggedInUser && (
                    <p className="text-[10px] text-gray-500 mt-2 ml-1 italic">
                        Login to link this review to your account.
                    </p>
                )}
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Review</label>
                <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition"
                    placeholder="Tell us what you think..."
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-white/5 text-gray-400 px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
