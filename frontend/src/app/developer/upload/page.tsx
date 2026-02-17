'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, AlertCircle, CheckCircle, Shield, X, ArrowRight, ArrowLeft, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import UploadModal from '@/components/UploadModal';
import UploadcareWidget from '@/components/UploadcareWidget';
import { authFetch } from '@/lib/api';

function UploadWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');

    const [step, setStep] = useState(1);
    const totalSteps = 5;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        category: 'Games',
        version: '',
        description: '',
        downloadType: 'apk', // 'apk' | 'link'
        directLink: '',
    });

    // File Data
    const [fileUrl, setFileUrl] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [screenshots, setScreenshots] = useState<string[]>([]);

    // Key Features (array of {title, description, icon})
    const [keyFeatures, setKeyFeatures] = useState<Array<{ title: string, description: string, icon: string }>>([
        { title: '', description: '', icon: 'Zap' }
    ]);

    // Changelog
    const [changelog, setChangelog] = useState({
        version: '',
        date: new Date().toISOString().split('T')[0],
        updates: [''] as string[]
    });

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const categories = ['Games', 'Productivity', 'Social', 'Tools', 'Entertainment', 'Education'];

    // Load Existing App if Editing
    useEffect(() => {
        if (editId) {
            loadApp(editId);
        }
    }, [editId]);

    async function loadApp(id: string) {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/developer/my-apps`);
            const apps: any[] = await res.json();
            const app = apps.find(a => a.id === id);
            if (app) {
                setFormData({
                    name: app.name,
                    category: app.category,
                    version: app.version,
                    description: app.description,
                    downloadType: 'apk',
                    directLink: ''
                });
                setFileUrl(app.file_url);
                setFileSize(app.size || '');
                setIconUrl(app.icon_url);
                setScreenshots(app.screenshots || []);
                setKeyFeatures(app.key_features || [{ title: '', description: '', icon: 'Zap' }]);
                setChangelog(app.changelog || {
                    version: app.version,
                    date: new Date().toISOString().split('T')[0],
                    updates: ['']
                });
            }
        } catch (err) {
            console.error('Failed to load app', err);
        }
    }

    const nextStep = () => {
        if (step === 1 && (!formData.name || !formData.version || !formData.description)) {
            setError('Please fill in all details.');
            return;
        }
        if (step === 2 && !iconUrl) {
            // Optional: allow no icon? No, better enforce it.
            setError('Please upload an icon.');
            return;
        }
        if (step === 3 && keyFeatures.some(f => !f.title || !f.description)) {
            setError('Please complete all features or remove empty ones.');
            return;
        }
        if (step === 3 && changelog.updates.some(u => !u.trim())) {
            setError('Please complete all update items or remove empty ones.');
            return;
        }
        if (step === 4 && formData.downloadType === 'apk' && !fileUrl) {
            setError('Please upload an APK.');
            return;
        }
        if (step === 4 && formData.downloadType === 'link' && !formData.directLink) {
            setError('Please provide a link.');
            return;
        }

        setError('');
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        setError('');
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            const payload = {
                name: formData.name,
                category: formData.category,
                version: formData.version,
                description: formData.description,
                fileUrl: formData.downloadType === 'link' ? formData.directLink : fileUrl,
                iconUrl,
                size: fileSize,
                screenshots,
                key_features: keyFeatures.filter(f => f.title && f.description),
                changelog: {
                    ...changelog,
                    version: formData.version, // Sync with app version
                    updates: changelog.updates.filter(u => u.trim() !== '')
                }
            };

            const url = editId
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/developer/apps/${editId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/developer/apps`;
            const method = editId ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editId ? 'App updated!' : 'App submitted!');
                router.push('/developer/apps');
            } else {
                const data = await res.json();
                setError(data.error || 'Submission failed');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Error processing request');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            // STEP 1: IDENTITY
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Let's start with the basics</h2>
                            <p className="text-gray-400">What are we building today?</p>
                        </div>

                        <div className="max-w-xl mx-auto space-y-8">
                            <div className="relative group">
                                <label className="sr-only">App Name</label>
                                <input
                                    type="text"
                                    placeholder="App Name"
                                    className="w-full bg-transparent border-b-2 border-white/20 px-4 py-4 text-4xl font-bold text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors text-center"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div>
                                    <span className="block text-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Choose a Category</span>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat })}
                                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all transform hover:scale-105 ${formData.category === cat
                                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0a0f1e]'
                                                    : 'bg-[#131b2e] text-gray-400 border border-white/10 hover:bg-[#1e293b]'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Version</label>
                                    <div className="relative group max-w-[150px] mx-auto">
                                        <input
                                            type="text"
                                            placeholder="1.0.0"
                                            className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-white text-center focus:outline-none focus:border-cyan-500 transition-colors placeholder-gray-700"
                                            value={formData.version}
                                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="sr-only">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Short description of your app..."
                                    className="w-full bg-[#131b2e] border border-white/10 rounded-2xl p-6 text-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none text-center"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                );

            // STEP 2: VISUALS
            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Show it off</h2>
                            <p className="text-gray-400">Upload your icon and screenshots</p>
                        </div>

                        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Icon Upload */}
                            <div className="md:col-span-1">
                                <div className={`aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group ${iconUrl ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/20 bg-[#131b2e] hover:border-white/40'}`}>
                                    {iconUrl ? (
                                        <>
                                            <img src={iconUrl} className="w-full h-full object-cover" alt="Icon" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <div className="scale-90 relative z-20">
                                                    <UploadcareWidget
                                                        publicKey="1eab7359b521f25ceb5a"
                                                        onChange={(info: any) => setIconUrl(info.cdnUrl)}
                                                        imagesOnly
                                                        tabs="file camera url"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-cyan-400 mx-auto">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <p className="font-bold text-white">App Icon</p>
                                            <div className="mt-4 scale-90 relative z-20">
                                                <UploadcareWidget
                                                    publicKey="1eab7359b521f25ceb5a"
                                                    onChange={(info: any) => setIconUrl(info.cdnUrl)}
                                                    imagesOnly
                                                    tabs="file camera url"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Screenshots Upload */}
                            <div className="md:col-span-2">
                                <div className="h-full min-h-[300px] rounded-3xl border-2 border-dashed border-white/20 bg-[#131b2e] p-6 relative">
                                    {screenshots.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {screenshots.map((src, i) => (
                                                <div key={i} className="relative group/shot">
                                                    <img src={src} className="w-full h-32 object-cover rounded-xl shadow-lg border border-white/10" alt={`Screen ${i}`} />
                                                    <button
                                                        onClick={() => setScreenshots(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="absolute top-1 right-1 bg-red-500 p-1 rounded-full opacity-0 group-hover/shot:opacity-100 transition"
                                                    >
                                                        <X className="w-3 h-3 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="flex items-center justify-center bg-white/5 rounded-xl min-h-[8rem] border border-dashed border-white/10 relative">
                                                <div className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center z-10">
                                                    <UploadcareWidget
                                                        publicKey="1eab7359b521f25ceb5a"
                                                        onChange={(info: any) => {
                                                            if (info.count) {
                                                                const groupUrl = info.cdnUrl;
                                                                if (groupUrl) {
                                                                    const newUrls: string[] = [];
                                                                    for (let i = 0; i < info.count; i++) {
                                                                        const baseUrl = groupUrl.endsWith('/') ? groupUrl : groupUrl + '/';
                                                                        newUrls.push(`${baseUrl}nth/${i}/`);
                                                                    }
                                                                    setScreenshots(prev => [...prev, ...newUrls]);
                                                                }
                                                            } else if (info.cdnUrl) {
                                                                setScreenshots(prev => [...prev, info.cdnUrl]);
                                                            }
                                                        }}
                                                        imagesOnly
                                                        multiple
                                                        tabs="file camera url"
                                                    />
                                                </div>
                                                <span className="text-3xl text-gray-600">+</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 h-full flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <p className="font-bold text-white text-lg">Screenshots</p>
                                            <p className="text-sm text-gray-500 mt-2 mb-4">Add your app screenshots</p>
                                            <div className="relative z-20">
                                                <UploadcareWidget
                                                    publicKey="1eab7359b521f25ceb5a"
                                                    onChange={(info: any) => {
                                                        if (info.count) {
                                                            const groupUrl = info.cdnUrl;
                                                            if (groupUrl) {
                                                                const newUrls: string[] = [];
                                                                for (let i = 0; i < info.count; i++) {
                                                                    const baseUrl = groupUrl.endsWith('/') ? groupUrl : groupUrl + '/';
                                                                    newUrls.push(`${baseUrl}nth/${i}/`);
                                                                }
                                                                setScreenshots(newUrls);
                                                            }
                                                        } else if (info.cdnUrl) {
                                                            setScreenshots(prev => [...prev, info.cdnUrl]);
                                                        }
                                                    }}
                                                    imagesOnly
                                                    multiple
                                                    tabs="file camera url"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            // STEP 3: DETAILS
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">The Details</h2>
                            <p className="text-gray-400">Tell users what makes your app special</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Key Features */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-cyan-400" />
                                    Key Features
                                </h3>
                                <div className="space-y-4">
                                    {keyFeatures.map((feat, i) => (
                                        <div key={i} className="bg-[#131b2e] p-4 rounded-xl border border-white/10 space-y-3 relative group">
                                            {keyFeatures.length > 1 && (
                                                <button
                                                    onClick={() => setKeyFeatures(prev => prev.filter((_, idx) => idx !== i))}
                                                    className="absolute -top-2 -right-2 bg-red-500/80 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition shadow-lg"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                            <input
                                                type="text"
                                                placeholder="Feature Title"
                                                className="w-full bg-[#0a0f1e] text-white px-3 py-2 rounded-lg text-sm font-bold border border-white/5 focus:border-cyan-500 outline-none"
                                                value={feat.title}
                                                onChange={(e) => {
                                                    const updated = [...keyFeatures];
                                                    updated[i].title = e.target.value;
                                                    setKeyFeatures(updated);
                                                }}
                                            />
                                            <textarea
                                                rows={2}
                                                placeholder="Feature Description"
                                                className="w-full bg-[#0a0f1e] text-gray-300 px-3 py-2 rounded-lg text-sm border border-white/5 focus:border-cyan-500 outline-none resize-none"
                                                value={feat.description}
                                                onChange={(e) => {
                                                    const updated = [...keyFeatures];
                                                    updated[i].description = e.target.value;
                                                    setKeyFeatures(updated);
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setKeyFeatures(prev => [...prev, { title: '', description: '', icon: 'Zap' }])}
                                        className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition font-bold text-sm"
                                    >
                                        + Add Feature
                                    </button>
                                </div>
                            </div>

                            {/* What's New */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-400" />
                                    What's New in v{formData.version}
                                </h3>
                                <div className="space-y-3">
                                    {changelog.updates.map((update, i) => (
                                        <div key={i} className="flex gap-2 group">
                                            <input
                                                type="text"
                                                placeholder="e.g. Bug fixes"
                                                className="flex-1 bg-[#131b2e] text-gray-300 px-4 py-3 rounded-xl border border-white/10 focus:border-blue-500 outline-none text-sm"
                                                value={update}
                                                onChange={(e) => {
                                                    const updated = [...changelog.updates];
                                                    updated[i] = e.target.value;
                                                    setChangelog({ ...changelog, updates: updated });
                                                }}
                                            />
                                            {changelog.updates.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        const updated = changelog.updates.filter((_, idx) => idx !== i);
                                                        setChangelog({ ...changelog, updates: updated });
                                                    }}
                                                    className="px-3 text-red-400 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setChangelog({ ...changelog, updates: [...changelog.updates, ''] })}
                                        className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition font-bold text-sm"
                                    >
                                        + Add Update Item
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            // STEP 4: FILE
            case 4:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">The Good Stuff</h2>
                            <p className="text-gray-400">Upload the APK or provide a download link</p>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            <div className="grid grid-cols-2 gap-4 mb-8 bg-[#131b2e] p-2 rounded-2xl border border-white/10">
                                <button
                                    type="button"
                                    className={`py-4 rounded-xl font-bold text-lg transition-all ${formData.downloadType === 'apk' ? 'bg-[#0a0f1e] text-green-400 shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                    onClick={() => setFormData({ ...formData, downloadType: 'apk' })}
                                >
                                    APK File
                                </button>
                                <button
                                    type="button"
                                    className={`py-4 rounded-xl font-bold text-lg transition-all ${formData.downloadType === 'link' ? 'bg-[#0a0f1e] text-blue-400 shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                    onClick={() => setFormData({ ...formData, downloadType: 'link' })}
                                >
                                    Direct Link
                                </button>
                            </div>

                            <div className="bg-[#131b2e] rounded-3xl p-1 border border-white/10 shadow-2xl min-h-[300px] flex flex-col">
                                {formData.downloadType === 'apk' ? (
                                    <div
                                        className={`flex-1 rounded-[22px] border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all cursor-pointer group ${fileUrl ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-white/30'}`}
                                        onClick={() => setIsUploadModalOpen(true)}
                                    >
                                        {fileUrl ? (
                                            <div className="text-center animate-bounce-in">
                                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 mx-auto text-green-400">
                                                    <CheckCircle className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">APK Ready</h3>
                                                <p className="text-green-400 font-mono text-sm">{fileSize}</p>
                                                <button className="mt-6 text-sm text-gray-500 hover:text-white underline">Replace File</button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-20 h-20 bg-[#0a0f1e] rounded-full flex items-center justify-center mb-6 mx-auto text-gray-400 group-hover:scale-110 group-hover:text-green-400 transition-all shadow-xl">
                                                    <Upload className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">Click to Upload APK</h3>
                                                <p className="text-gray-500">Secure uploads via DevUploads</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col justify-center p-8">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">External URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://example.com/download/app.apk"
                                            className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-6 py-5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                                            value={formData.directLink}
                                            onChange={(e) => setFormData({ ...formData, directLink: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            // STEP 5: REVIEW
            case 5:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Ready to Launch?</h2>
                            <p className="text-gray-400">Review your listing one last time</p>
                        </div>

                        <div className="max-w-md mx-auto relative group">
                            <div className="bg-[#131b2e] rounded-[40px] border-8 border-[#1f2937] shadow-2xl overflow-hidden relative transform group-hover:scale-[1.02] transition-transform duration-500">
                                {/* Simulated Phone Header */}
                                <div className="h-48 bg-gray-800 relative">
                                    {screenshots[0] && (
                                        <img src={screenshots[0]} className="w-full h-full object-cover opacity-80" alt="Header" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e] to-transparent"></div>
                                </div>

                                <div className="px-6 -mt-10 relative z-10 flex items-end gap-4">
                                    <div className="w-24 h-24 rounded-2xl bg-[#0a0f1e] border-4 border-[#131b2e] shadow-lg overflow-hidden flex-shrink-0">
                                        {iconUrl ? (
                                            <img src={iconUrl} className="w-full h-full object-cover" alt="Icon" />
                                        ) : (
                                            <div className="w-full h-full bg-cyan-900 flex items-center justify-center text-2xl font-bold text-white">?</div>
                                        )}
                                    </div>
                                    <div className="pb-2">
                                        <h3 className="font-bold text-white text-xl leading-tight">{formData.name || 'App Name'}</h3>
                                        <p className="text-cyan-400 text-sm">{formData.category}</p>
                                    </div>
                                </div>

                                <div className="px-6 mt-6">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full py-3 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-gray-200 transition active:scale-95"
                                    >
                                        {loading ? 'Publishing...' : 'Publish Now'}
                                    </button>
                                </div>

                                <div className="px-6 py-6 text-sm text-gray-400 leading-relaxed min-h-[150px]">
                                    {formData.description || 'No description provided.'}
                                </div>
                            </div>
                            <div className="absolute -inset-4 bg-cyan-500/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] flex flex-col font-sans">
            <header className="px-8 py-6 flex items-center justify-between">
                <button onClick={() => router.push('/developer/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
                    <span className="font-bold">Exit</span>
                </button>

                <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-cyan-400 shadow-lg shadow-cyan-500/50' : 'w-2 bg-white/20'}`}></div>
                    ))}
                </div>

                <div className="w-24"></div>
            </header>

            <main className="flex-1 container mx-auto px-6 py-8 flex flex-col justify-center max-w-5xl relative">
                {error && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-500/10 text-red-400 px-6 py-3 rounded-full flex items-center gap-2 text-sm font-bold border border-red-500/20 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                {renderStepContent()}
            </main>

            <footer className="px-8 py-8 flex items-center justify-between max-w-5xl mx-auto w-full">
                {step > 1 ? (
                    <button
                        onClick={prevStep}
                        className="px-8 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition"
                    >
                        Back
                    </button>
                ) : <div></div>}

                {step < totalSteps && (
                    <button
                        onClick={nextStep}
                        className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition transform active:scale-95 flex items-center gap-2"
                    >
                        Continue <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </footer>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadComplete={(url, size) => {
                    setFileUrl(url);
                    setFileSize(size);
                    setTimeout(() => setError(''), 100);
                }}
            />
        </div>
    );
}

export default function DeveloperUpload() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white">Loading...</div>}>
            <UploadWizard />
        </Suspense>
    );
}
