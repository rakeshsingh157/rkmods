'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Upload, AlertCircle, CheckCircle, Shield, Lock, Edit, Trash2, X, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UploadModal from '@/components/UploadModal';
import UploadcareWidget from '@/components/UploadcareWidget';

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [screenshots, setScreenshots] = useState<string[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessCode, setAccessCode] = useState('');

    // Edit Mode State
    const [apps, setApps] = useState<any[]>([]);
    const [editingApp, setEditingApp] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDirectLink, setIsDirectLink] = useState(false);

    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (isAuthenticated && activeTab === 'manage') {
            fetchApps();
        }
    }, [isAuthenticated, activeTab]);

    async function fetchApps() {
        try {
            const res = await fetch('/api/apps');
            const data = await res.json();
            if (Array.isArray(data)) {
                setApps(data);
            } else {
                console.error('Failed to fetch apps:', data.error);
                setApps([]);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!fileUrl && !editingApp) {
            setError('Please upload an APK file');
            setLoading(false);
            return;
        }

        const formData = new FormData(e.currentTarget);
        formData.set('fileUrl', fileUrl || (editingApp ? editingApp.file_url : ''));
        formData.set('iconUrl', iconUrl || (editingApp ? editingApp.icon_url : ''));
        formData.set('size', fileSize || (editingApp ? editingApp.size : ''));
        formData.set('screenshots', JSON.stringify(screenshots));

        if (editingApp) {
            formData.set('id', editingApp.id);
        }

        try {
            const endpoint = editingApp ? '/api/update-app' : '/api/upload-app';
            const method = editingApp ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                body: formData,
            });

            if (res.ok) {
                if (editingApp) {
                    setEditingApp(null);
                    fetchApps();
                    alert('App updated successfully!');
                } else {
                    router.push('/');
                    router.refresh();
                }
            } else {
                const data = await res.json();
                setError(data.error || 'Operation failed');
            }
        } catch (err) {
            console.error(err);
            setError('Error processing request');
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(app: any) {
        setEditingApp(app);
        setFileUrl(app.file_url);
        setFileSize(app.size);
        setIconUrl(app.icon_url);
        setScreenshots(app.screenshots || []);
        setActiveTab('upload');
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this app? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/delete-app?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setApps(apps.filter(app => app.id !== id));
                alert('App deleted successfully');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete app');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting app');
        }
    }

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-[#0b0f19] flex items-center justify-center font-sans selection:bg-cyan-500 selection:text-white">
                <Navbar />
                <div className="bg-[#131b2e] p-8 rounded-3xl shadow-2xl border border-white/5 max-w-md w-full mx-4 mt-20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Lock className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                        <p className="text-gray-400 text-sm mt-2">Enter your access code to continue</p>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (accessCode === 'Rakesh?2005@123') {
                            setIsAuthenticated(true);
                        } else {
                            setError('Invalid access code');
                        }
                    }} className="space-y-6">
                        <div>
                            <input
                                type="password"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition text-center tracking-widest text-lg placeholder:tracking-normal"
                                placeholder="Enter Code"
                            />
                        </div>
                        {error && !isAuthenticated && (
                            <div className="flex items-center justify-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition transform hover:-translate-y-0.5"
                        >
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0b0f19] font-sans selection:bg-cyan-500 selection:text-white">
            <Navbar />
            <div className="container mx-auto py-32 px-4 max-w-4xl">

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => { setActiveTab('upload'); setEditingApp(null); setFileUrl(''); setIconUrl(''); setFileSize(''); }}
                        className={`flex-1 py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-[#131b2e] text-gray-400 border border-white/5 hover:bg-white/5'}`}
                    >
                        <Upload className="w-5 h-5" />
                        {editingApp ? 'Edit App' : 'Upload New'}
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`flex-1 py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-[#131b2e] text-gray-400 border border-white/5 hover:bg-white/5'}`}
                    >
                        <Edit className="w-5 h-5" />
                        Manage Apps
                    </button>
                </div>

                {activeTab === 'upload' ? (
                    <div className="bg-[#131b2e] p-8 md:p-10 rounded-3xl shadow-2xl border border-white/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

                        <h1 className="text-3xl font-black mb-8 flex items-center gap-4 text-white">
                            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20">
                                {editingApp ? <Edit className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                            </div>
                            {editingApp ? `Edit ${editingApp.name}` : 'Upload New Mod'}
                        </h1>

                        {error && (
                            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3 text-sm font-bold border border-red-500/20 animate-pulse">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">App Name</label>
                                    <input name="name" defaultValue={editingApp?.name} required className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition" placeholder="e.g. Super Game Mod" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Category</label>
                                        <select name="category" defaultValue={editingApp?.category} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition appearance-none">
                                            <option>Games</option>
                                            <option>Productivity</option>
                                            <option>Social</option>
                                            <option>Tools</option>
                                            <option>Entertainment</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Version</label>
                                        <input name="version" defaultValue={editingApp?.version} placeholder="1.0.0" className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Description</label>
                                    <textarea name="description" defaultValue={editingApp?.description} rows={4} className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition" placeholder="Describe your mod features..."></textarea>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-white/5 transition relative group">
                                    <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">App Icon</label>
                                    <div className="uploadcare-wrapper">
                                        <UploadcareWidget
                                            publicKey="1eab7359b521f25ceb5a"
                                            onChange={(info: any) => setIconUrl(info.cdnUrl || '')}
                                            clearable
                                            imagesOnly
                                        />
                                    </div>
                                    {iconUrl && <div className="mt-4 text-sm text-green-400 flex items-center justify-center gap-2 font-bold"><CheckCircle className="w-4 h-4" /> Icon Uploaded</div>}
                                </div>

                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-white/5 transition relative group">
                                    <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">APK File</label>

                                    {isDirectLink ? (
                                        <div className="space-y-4">
                                            <input
                                                type="url"
                                                placeholder="https://example.com/app.apk"
                                                value={fileUrl}
                                                onChange={(e) => setFileUrl(e.target.value)}
                                                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setIsDirectLink(false); setFileUrl(''); }}
                                                className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                                            >
                                                Upload File Instead
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsUploadModalOpen(true)}
                                                className="w-full bg-cyan-500/10 text-cyan-400 py-4 rounded-xl font-bold border border-cyan-500/20 hover:bg-cyan-500/20 transition flex items-center justify-center gap-2"
                                            >
                                                <Upload className="w-5 h-5" />
                                                {fileUrl ? 'Replace APK' : 'Upload APK'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setIsDirectLink(true); setFileUrl(''); }}
                                                className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                                            >
                                                Enter Direct Link Instead
                                            </button>
                                        </div>
                                    )}

                                    <input type="hidden" name="fileUrl" value={fileUrl} />
                                    <input type="hidden" name="iconUrl" value={iconUrl} />
                                    {(fileUrl || editingApp?.file_url) && <div className="mt-4 text-sm text-green-400 flex items-center justify-center gap-2 font-bold"><CheckCircle className="w-4 h-4" /> {isDirectLink ? 'Link Set' : `APK Set ${fileSize ? `(${fileSize})` : ''}`}</div>}
                                </div>
                            </div>

                            {/* Screenshots Section */}
                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 hover:bg-white/5 transition relative group">
                                <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">Screenshots (Optional)</label>
                                <div className="uploadcare-wrapper mb-4">
                                    <UploadcareWidget
                                        publicKey="1eab7359b521f25ceb5a"
                                        onChange={(info: any) => {
                                            if (info.cdnUrl && !screenshots.includes(info.cdnUrl)) {
                                                setScreenshots([...screenshots, info.cdnUrl]);
                                            }
                                        }}
                                        clearable
                                        imagesOnly
                                    />
                                </div>
                                {screenshots.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="text-sm text-green-400 flex items-center gap-2 font-bold">
                                            <CheckCircle className="w-4 h-4" /> {screenshots.length} Screenshot{screenshots.length > 1 ? 's' : ''} Added
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {screenshots.map((url, index) => (
                                                <div key={index} className="relative group/img">
                                                    <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-white/10" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setScreenshots(screenshots.filter((_, i) => i !== index))}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    'Processing...'
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        {editingApp ? 'Update Mod' : 'Publish Mod'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-[#131b2e] rounded-3xl shadow-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold text-white">Manage Apps</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search apps..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-[#0b0f19] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 outline-none w-64 transition"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {filteredApps.map((app) => (
                                <div key={app.id} className="p-6 flex items-center gap-4 hover:bg-white/5 transition">
                                    <div className="w-12 h-12 rounded-xl bg-[#0b0f19] flex-shrink-0 overflow-hidden border border-white/5">
                                        {app.icon_url ? (
                                            <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Icon</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white truncate">{app.name}</h3>
                                        <p className="text-sm text-gray-500">v{app.version} • {app.category}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(app)}
                                            className="bg-cyan-500/10 text-cyan-400 p-2 rounded-lg hover:bg-cyan-500 hover:text-white transition"
                                            title="Edit App"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(app.id)}
                                            className="bg-red-500/10 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white transition"
                                            title="Delete App"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {apps.length === 0 && (
                                <div className="p-12 text-center text-gray-500">
                                    No apps found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{`
                .uploadcare--widget__button_type_open {
                    background-color: rgba(6, 182, 212, 0.1) !important;
                    color: #22d3ee !important;
                    border: 1px solid rgba(6, 182, 212, 0.2) !important;
                    border-radius: 0.75rem !important;
                    font-weight: 700 !important;
                    padding: 10px 20px !important;
                    transition: all 0.2s !important;
                }
                .uploadcare--widget__button_type_open:hover {
                    background-color: rgba(6, 182, 212, 0.2) !important;
                    box-shadow: 0 0 15px rgba(6, 182, 212, 0.1) !important;
                }
                .uploadcare--dialog__container {
                    background: #131b2e !important;
                    color: white !important;
                }
                .uploadcare--panel__content {
                    background: #0b0f19 !important;
                    color: white !important;
                }
                .uploadcare--tab__action-button {
                    background-color: #06b6d4 !important;
                    border-color: #06b6d4 !important;
                }
            `}</style>
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadComplete={(url, size) => {
                    setFileUrl(url);
                    setFileSize(size);
                }}
            />
        </main>
    );
}
