'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User, Download, Star, Trash2, Calendar, Shield, Edit2, Save, X } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [downloads, setDownloads] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'downloads' | 'reviews'>('downloads');
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', email: '', firstName: '', lastName: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchProfileData(userData.id);
    }, []);

    async function fetchProfileData(userId: string) {
        try {
            // Fetch profile
            const profileRes = await fetch(`${API_URL}/api/user/profile/${userId}`);
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
                setEditForm({
                    username: profileData.username,
                    email: profileData.email,
                    firstName: profileData.first_name || '',
                    lastName: profileData.last_name || ''
                });
            }

            // Fetch downloads
            const downloadsRes = await fetch(`${API_URL}/api/user/downloads/${userId}`);
            if (downloadsRes.ok) {
                const downloadsData = await downloadsRes.json();
                setDownloads(downloadsData);
            }

            // Fetch reviews
            const reviewsRes = await fetch(`${API_URL}/api/user/reviews/user/${userId}`);
            if (reviewsRes.ok) {
                const reviewsData = await reviewsRes.json();
                setReviews(reviewsData);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveProfile() {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/user/profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                const data = await res.json();
                setProfile({ ...profile, ...data.user });
                // Update localStorage
                const updatedUser = { ...user, ...data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setEditMode(false);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to update profile');
            }
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteReview(reviewId: string) {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const res = await fetch(`${API_URL}/api/user/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            if (res.ok) {
                setReviews(reviews.filter(r => r.id !== reviewId));
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to delete review');
            }
        } catch (error) {
            alert('Failed to delete review');
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0a0f19] text-white">
                <Navbar />
                <div className="container mx-auto px-6 pt-32 pb-12 text-center">
                    <p className="text-gray-400">Loading profile...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0f19] text-white">
            <Navbar />

            <div className="container mx-auto px-4 md:px-6 pt-24 pb-12 max-w-5xl">
                {/* Profile Header Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 blur group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative bg-[#131b2e] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">

                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1 shadow-2xl shadow-cyan-500/20">
                                <div className="w-full h-full rounded-full bg-[#0a0f1a] flex items-center justify-center text-4xl font-bold text-white relative overflow-hidden">
                                    {(user?.avatar_url) ? (
                                        <img src={user.avatar_url} alt={profile?.username} className="w-full h-full object-cover" />
                                    ) : (
                                        (editMode ? editForm.username : profile?.username)?.[0]?.toUpperCase() || 'U'
                                    )}
                                </div>
                            </div>
                            {editMode && (
                                <button className="absolute bottom-0 right-0 bg-cyan-500 text-white p-2 rounded-full hover:bg-cyan-400 transition shadow-lg border-4 border-[#131b2e]">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Info & Edit Form */}
                        <div className="flex-1 text-center md:text-left w-full">
                            {editMode ? (
                                <div className="space-y-4 max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-400 uppercase font-semibold tracking-wider ml-1 mb-1 block">First Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.firstName}
                                                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                                    className="w-full bg-[#0a0f1a] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition"
                                                    placeholder="First Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 uppercase font-semibold tracking-wider ml-1 mb-1 block">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.lastName}
                                                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                                    className="w-full bg-[#0a0f1a] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition"
                                                    placeholder="Last Name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 uppercase font-semibold tracking-wider ml-1 mb-1 block">Username</label>
                                            <input
                                                type="text"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                className="w-full bg-[#0a0f1a] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition"
                                                placeholder="Username"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 uppercase font-semibold tracking-wider ml-1 mb-1 block">Email</label>
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full bg-[#0a0f1a] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition"
                                                placeholder="Email"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditMode(false);
                                                if (profile) {
                                                    setEditForm({
                                                        username: profile.username || '',
                                                        email: profile.email || '',
                                                        firstName: profile.first_name || '',
                                                        lastName: profile.last_name || ''
                                                    });
                                                }
                                            }}
                                            className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition font-medium flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                                    <div className="space-y-2 w-full">
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                                {profile?.first_name} {profile?.last_name}
                                            </h1>
                                            {profile?.is_developer && (
                                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] md:text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-purple-500/20">
                                                    <Shield className="w-3 h-3" />
                                                    Dev
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-cyan-400 font-medium">@{profile?.username}</p>
                                        <p className="text-gray-400 font-medium text-sm">{profile?.email}</p>
                                        <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Joined {new Date(profile?.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="group bg-[#0a0f1a] hover:bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition" />
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                    <div className="bg-[#131b2e] border border-white/5 p-4 rounded-xl text-center">
                        <p className="text-gray-400 text-sm mb-1">Total Downloads</p>
                        <p className="text-2xl font-bold text-white">{downloads.length}</p>
                    </div>
                    <div className="bg-[#131b2e] border border-white/5 p-4 rounded-xl text-center">
                        <p className="text-gray-400 text-sm mb-1">Reviews Given</p>
                        <p className="text-2xl font-bold text-white">{reviews.length}</p>
                    </div>
                    {/* Add lighter/placeholder stats to fill space if needed */}
                </div>

                {/* Content Tabs */}
                <div className="bg-[#131b2e] border border-white/5 rounded-2xl overflow-hidden min-h-[400px]">
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('downloads')}
                            className={`flex-1 py-4 text-center font-semibold text-sm tracking-wide transition relative ${activeTab === 'downloads' ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Download className={`w-4 h-4 ${activeTab === 'downloads' ? 'text-cyan-400' : ''}`} />
                                Downloads
                            </div>
                            {activeTab === 'downloads' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`flex-1 py-4 text-center font-semibold text-sm tracking-wide transition relative ${activeTab === 'reviews' ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Star className={`w-4 h-4 ${activeTab === 'reviews' ? 'text-yellow-400' : ''}`} />
                                Reviews
                            </div>
                            {activeTab === 'reviews' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                            )}
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Download History */}
                        {activeTab === 'downloads' && (
                            <div className="space-y-3">
                                {downloads.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Download className="w-8 h-8 text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-1">No downloads yet</h3>
                                        <p className="text-gray-500 text-sm">Apps you download will appear here.</p>
                                        <Link href="/" className="inline-block mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium">Browse Apps &rarr;</Link>
                                    </div>
                                ) : (
                                    downloads.map((download, idx) => (
                                        <div key={idx} className="group bg-[#0a0f1a] p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={download.app.icon_url}
                                                    alt={download.app.name}
                                                    className="w-12 h-12 rounded-lg object-cover bg-gray-800"
                                                />
                                                <div>
                                                    <Link href={`/app/${download.app.id}`} className="font-semibold text-white group-hover:text-cyan-400 transition block">
                                                        {download.app.name}
                                                    </Link>
                                                    <span className="inline-block text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded mt-1">
                                                        {download.app.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">Downloaded on</p>
                                                <p className="text-sm font-medium text-gray-300">
                                                    {new Date(download.downloaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Review History */}
                        {activeTab === 'reviews' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reviews.length === 0 ? (
                                    <div className="col-span-full text-center py-20">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Star className="w-8 h-8 text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-1">No reviews yet</h3>
                                        <p className="text-gray-500 text-sm">Share your thoughts on apps you've used.</p>
                                    </div>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review.id} className="bg-[#0a0f1a] p-5 rounded-xl border border-white/5 hover:border-white/10 transition group relative">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={review.app.icon_url}
                                                        alt={review.app.name}
                                                        className="w-10 h-10 rounded-lg object-cover bg-gray-800"
                                                    />
                                                    <div>
                                                        <Link href={`/app/${review.app.id}`} className="font-semibold text-white hover:text-cyan-400 transition text-sm">
                                                            {review.app.name}
                                                        </Link>
                                                        <div className="flex text-yellow-400 mt-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-700'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition p-2 bg-white/5 rounded-lg"
                                                    title="Delete review"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="bg-[#131b2e] p-3 rounded-lg mb-2">
                                                <p className="text-gray-300 text-sm leading-relaxed">"{review.comment}"</p>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-gray-600">
                                                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                                {review.replies && review.replies.length > 0 && (
                                                    <span className="flex items-center gap-1 text-cyan-500/70">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                                        {review.replies.length} developer reply
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
