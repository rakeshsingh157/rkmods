'use client';

import { useState } from 'react';
import { Star, MessageCircle, Send } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Reply {
    reply_id: string;
    user_name: string;
    is_developer: boolean;
    comment: string;
    created_at: string;
}

interface Review {
    _id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
    replies?: Reply[];
}

export default function ReviewSection({ reviews: initialReviews, appId }: { reviews: Review[], appId: string }) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replyUser, setReplyUser] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleReply(reviewId: string) {
        if (!replyText.trim() || !replyUser.trim()) {
            alert('Please enter your name and reply');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/user/reviews/${reviewId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment: replyText,
                    user_name: replyUser,
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Update reviews state with new reply
                setReviews(prev => prev.map(r =>
                    r._id === reviewId
                        ? { ...r, replies: [...(r.replies || []), data.reply] }
                        : r
                ));
                setReplyText('');
                setReplyUser('');
                setReplyingTo(null);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to post reply');
            }
        } catch (err) {
            alert('Failed to post reply');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-3 md:space-y-4 mt-6 md:mt-8">
            {reviews.map((review) => (
                <div key={review._id} className="bg-[#131b2e] p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 shadow-sm hover:border-white/10 hover:shadow-lg transition group">
                    <div className="flex items-center justify-between mb-3 md:mb-2">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 font-bold text-xs md:text-sm border border-cyan-500/20 group-hover:scale-110 transition">
                                {review.user_name ? review.user_name[0].toUpperCase() : 'A'}
                            </div>
                            <span className="font-bold text-gray-200 text-sm md:text-base">{review.user_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex text-yellow-400">
                            {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-3 h-3 md:w-4 md:h-4 fill-current" />)}
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base pl-0 md:pl-13 leading-relaxed">{review.comment}</p>
                    <div className="flex items-center justify-between mt-3 md:mt-4">
                        <p className="text-xs text-gray-600">{new Date(review.created_at).toLocaleDateString()}</p>
                        <button
                            onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
                            className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 transition"
                        >
                            <MessageCircle className="w-3 h-3" />
                            Reply {review.replies && review.replies.length > 0 && `(${review.replies.length})`}
                        </button>
                    </div>

                    {/* Replies */}
                    {review.replies && review.replies.length > 0 && (
                        <div className="mt-4 pl-4 md:pl-8 space-y-3 border-l-2 border-cyan-500/20">
                            {review.replies.map((reply) => (
                                <div key={reply.reply_id} className="bg-[#0a0f1a] p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center text-purple-400 font-bold text-xs border border-purple-500/20">
                                            {reply.user_name[0].toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-gray-300 text-xs">{reply.user_name}</span>
                                        {reply.is_developer && (
                                            <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30">Developer</span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-xs leading-relaxed">{reply.comment}</p>
                                    <p className="text-[10px] text-gray-700 mt-2">{new Date(reply.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === review._id && (
                        <div className="mt-4 bg-[#0a0f1a] p-4 rounded-lg border border-white/5">
                            <input
                                type="text"
                                placeholder="Your name"
                                value={replyUser}
                                onChange={(e) => setReplyUser(e.target.value)}
                                className="w-full bg-[#131b2e] text-white px-3 py-2 rounded-lg text-sm mb-2 border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                            />
                            <textarea
                                placeholder="Write your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full bg-[#131b2e] text-white px-3 py-2 rounded-lg text-sm resize-none border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                                rows={3}
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => handleReply(review._id)}
                                    disabled={loading}
                                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-2 transition"
                                >
                                    <Send className="w-3 h-3" />
                                    {loading ? 'Posting...' : 'Post Reply'}
                                </button>
                                <button
                                    onClick={() => {
                                        setReplyingTo(null);
                                        setReplyText('');
                                        setReplyUser('');
                                    }}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            {reviews.length === 0 && (
                <div className="text-center py-12 md:py-16 bg-[#131b2e] rounded-xl md:rounded-2xl border border-white/5 border-dashed">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm md:text-base">No reviews yet. Be the first to review!</p>
                </div>
            )}
        </div>
    );
}
