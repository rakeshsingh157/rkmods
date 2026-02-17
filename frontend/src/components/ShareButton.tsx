'use client';

import { Share2, Check, Copy } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ appName }: { appName: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: appName,
            text: `Check out ${appName} on RKMODS!`,
            url: url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 bg-white/5 text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-white/10 transition border border-white/10"
        >
            {copied ? (
                <>
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                </>
            ) : (
                <>
                    <Share2 className="w-5 h-5" />
                    Share
                </>
            )}
        </button>
    );
}
