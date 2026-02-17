'use client';

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { authFetch } from '@/lib/api';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: (url: string, size: string) => void;
}

export default function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (!file.name.endsWith('.apk')) {
            setError('Please upload an APK file');
            return;
        }

        setLoading(true);
        setError('');
        setProgress(10); // Start progress

        try {
            // ...

            // 1. Get Upload Server
            const serverRes = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/developer/upload/devuploads`);
            if (!serverRes.ok) throw new Error('Failed to get upload server');
            const { url, sess_id } = await serverRes.json();

            setProgress(30);

            // 2. Upload to DevUploads
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sess_id', sess_id);
            formData.append('utype', 'reg');
            formData.append('file_public', '1');

            // Note: Fetch doesn't support upload progress natively easily without XHR
            // We'll just simulate it or jump to 50% then 100%
            setProgress(50);

            const uploadRes = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) throw new Error('Upload failed');

            const uploadData = await uploadRes.json();
            const fileData = uploadData[0];

            if (!fileData || !fileData.file_code) {
                throw new Error('Invalid upload response');
            }

            setProgress(100);

            const downloadUrl = `https://devuploads.com/${fileData.file_code}`;
            let sizeInMB = '';
            if (file.size) {
                sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
            }

            onUploadComplete(downloadUrl, sizeInMB);
            onClose();

        } catch (err) {
            console.error('Upload failed:', err);
            setError('Failed to upload APK. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#131b2e] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Upload APK</h2>
                    <p className="text-gray-400 mb-6">Select or drag and drop your APK file here.</p>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-bold border border-red-500/20">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <div
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition relative group ${dragActive ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 hover:bg-white/5'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".apk,application/vnd.android.package-archive"
                            className="hidden"
                            onChange={handleChange}
                        />

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-cyan-400 font-bold animate-pulse">Uploading... {progress}%</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pointer-events-none">
                                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition duration-300">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <p className="text-white font-bold text-lg mb-2">Drag & Drop APK</p>
                                <p className="text-gray-500 text-sm">or click to browse</p>
                            </div>
                        )}

                        {!loading && (
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="absolute inset-0 w-full h-full cursor-pointer"
                            />
                        )}
                    </div>
                </div>

                <div className="bg-[#0b0f19] p-6 border-t border-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
