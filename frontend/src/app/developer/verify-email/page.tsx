'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('No verification token provided');
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch(`/api/developer/auth/verify-email?token=${token}`);
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message);
                    setTimeout(() => router.push('/developer/login'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Network error. Please try again.');
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1e] via-[#0f1729] to-[#0a0f1e] px-4">
            <div className="max-w-md w-full bg-[#131b2e] rounded-2xl p-8 border border-white/10 text-center">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
                        <p className="text-gray-400">Please wait while we verify your email address</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                        <p className="text-gray-400 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to login...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <a href="/developer/signup" className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition">
                            Back to Signup
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmail() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1e] via-[#0f1729] to-[#0a0f1e] px-4">
                <div className="max-w-md w-full bg-[#131b2e] rounded-2xl p-8 border border-white/10 text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
