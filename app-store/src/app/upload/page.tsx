'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Upload, AlertCircle, CheckCircle, Shield, Lock, Edit, Trash2, X, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UploadModal from '@/components/UploadModal';
import UploadcareWidget from '@/components/UploadcareWidget';

export default function AdminPage() {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
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
            const res = await fetch('/api/apps', {
                cache: 'no-store'
            });
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

        console.log('Submitting with screenshots state:', screenshots);
        console.log('Screenshots JSON in FormData:', formData.get('screenshots'));

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
                    // Clear all form fields and state
                    setEditingApp(null);
                    setFileUrl('');
                    setIconUrl('');
                    setFileSize('');
                    setScreenshots([]);

                    // Reset form fields using ref
                    if (formRef.current) {
                        formRef.current.reset();
                    }

                    await fetchApps();
                    setActiveTab('manage');
                    alert('App updated successfully!');
                } else {
                    // Clear form for new uploads
                    setFileUrl('');
                    setIconUrl('');
                    setFileSize('');
                    setScreenshots([]);

                    if (formRef.current) {
                        formRef.current.reset();
                    }

                    router.push('/');
                    router.refresh();
                }
            } else {
                const data = await res.json();
                setError(data.error || 'Operation failed');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError(err instanceof Error ? err.message : 'Error processing request');
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
                await fetchApps(); // Refetch from database to get live data
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
            <main className="min-h-screen flex items-center justify-center font-sans selection:bg-cyan-500 selection:text-white">
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
        <main className="min-h-screen font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
            {/* Enhanced Animated Background Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            <Navbar />
            <div className="container mx-auto py-24 md:py-32 px-4 max-w-5xl relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Mod Management
                    </h1>
                    <p className="text-gray-400 text-lg">Upload and manage your Android mods</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-10 p-2 bg-[#131b2e] rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-6 duration-700">
                    <button
                        onClick={() => { setActiveTab('upload'); setEditingApp(null); setFileUrl(''); setIconUrl(''); setFileSize(''); }}
                        className={`flex-1 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Upload className="w-5 h-5" />
                        <span className="hidden sm:inline">{editingApp ? 'Edit App' : 'Upload New'}</span>
                        <span className="sm:hidden">Upload</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`flex-1 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Edit className="w-5 h-5" />
                        <span className="hidden sm:inline">Manage Apps</span>
                        <span className="sm:hidden">Manage</span>
                    </button>
                </div>

                {activeTab === 'upload' ? (
                    <div className="bg-gradient-to-br from-[#131b2e] to-[#0f1623] p-6 md:p-10 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 backdrop-blur-xl">
                        {/* Animated top border */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <h1 className="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3 md:gap-4 text-white">
                                <div className="p-2 md:p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                                    {editingApp ? <Edit className="w-6 h-6 md:w-8 md:h-8" /> : <Upload className="w-6 h-6 md:w-8 md:h-8" />}
                                </div>
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    {editingApp ? `Edit ${editingApp.name}` : 'Upload New Mod'}
                                </span>
                            </h1>

                            {error && (
                                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3 text-sm font-bold border border-red-500/20 animate-pulse">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3 text-sm font-bold border border-red-500/20 animate-pulse">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}

                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                            <div className="w-1 h-4 bg-cyan-500 rounded"></div>
                                            App Name
                                        </label>
                                        <input name="name" defaultValue={editingApp?.name} required className="w-full bg-[#0b0f19]/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:bg-[#0b0f19] outline-none transition-all duration-300 hover:border-cyan-500/30" placeholder="e.g. Super Game Mod" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                                <div className="w-1 h-4 bg-blue-500 rounded"></div>
                                                Category
                                            </label>
                                            <select name="category" defaultValue={editingApp?.category} className="w-full bg-[#0b0f19]/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:bg-[#0b0f19] outline-none transition-all duration-300 hover:border-cyan-500/30 appearance-none cursor-pointer">
                                                <option>Games</option>
                                                <option>Productivity</option>
                                                <option>Social</option>
                                                <option>Tools</option>
                                                <option>Entertainment</option>
                                            </select>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                                <div className="w-1 h-4 bg-purple-500 rounded"></div>
                                                Version
                                            </label>
                                            <input name="version" defaultValue={editingApp?.version} placeholder="1.0.0" className="w-full bg-[#0b0f19]/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:bg-[#0b0f19] outline-none transition-all duration-300 hover:border-cyan-500/30" />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                            <div className="w-1 h-4 bg-green-500 rounded"></div>
                                            Description
                                        </label>
                                        <textarea name="description" defaultValue={editingApp?.description} rows={4} className="w-full bg-[#0b0f19]/50 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:bg-[#0b0f19] outline-none transition-all duration-300 hover:border-cyan-500/30 resize-none" placeholder="Describe your mod features..."></textarea>
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
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide">Screenshots (Optional)</label>
                                        <span className="text-xs text-gray-500 font-medium">Select multiple images at once (up to 10)</span>
                                    </div>
                                    <div className="uploadcare-wrapper mb-4">
                                        <UploadcareWidget
                                            publicKey="1eab7359b521f25ceb5a"
                                            onChange={(info: any) => {
                                                console.log('Screenshot upload info:', info);

                                                if (info.count) {
                                                    // Multiple files (Group)
                                                    const groupUrl = info.cdnUrl;
                                                    if (groupUrl) {
                                                        const newUrls: string[] = [];
                                                        for (let i = 0; i < info.count; i++) {
                                                            const baseUrl = groupUrl.endsWith('/') ? groupUrl : groupUrl + '/';
                                                            newUrls.push(`${baseUrl}nth/${i}/`);
                                                        }
                                                        console.log('Generated group URLs:', newUrls);
                                                        setScreenshots(newUrls);
                                                    }
                                                } else if (info.cdnUrl) {
                                                    // Single file
                                                    console.log('Single file URL:', info.cdnUrl);
                                                    if (!screenshots.includes(info.cdnUrl)) {
                                                        setScreenshots(prev => [...prev, info.cdnUrl]);
                                                    }
                                                }
                                            }}
                                            clearable
                                            imagesOnly
                                            multiple
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
                                                            className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition hover:bg-red-600"
                                                            title="Remove screenshot"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setScreenshots([])}
                                                className="text-xs text-red-400 hover:text-red-300 underline"
                                            >
                                                Clear all screenshots
                                            </button>
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
                    </div>
                ) : (
                    <div className="bg-[#131b2e] rounded-3xl shadow-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="p-4 md:p-6 border-b border-white/5">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <h2 className="text-xl md:text-2xl font-bold text-white">Manage Apps</h2>
                                <div className="relative w-full sm:w-auto sm:min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search apps..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-[#0b0f19] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 outline-none w-full transition"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {filteredApps.map((app) => (
                                <div key={app.id} className="p-4 md:p-6 flex items-center gap-3 md:gap-4 hover:bg-white/5 transition">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#0b0f19] shrink-0 overflow-hidden border border-white/5">
                                        {app.icon_url ? (
                                            <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Icon</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white truncate text-sm md:text-base">{app.name}</h3>
                                        <p className="text-xs md:text-sm text-gray-500">v{app.version} • {app.category}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleEdit(app)}
                                            className="bg-cyan-500/10 text-cyan-400 p-2 rounded-lg hover:bg-cyan-500 hover:text-white transition"
                                            title="Edit App"
                                        >
                                            <Edit className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(app.id)}
                                            className="bg-red-500/10 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white transition"
                                            title="Delete App"
                                        >
                                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
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
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
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
