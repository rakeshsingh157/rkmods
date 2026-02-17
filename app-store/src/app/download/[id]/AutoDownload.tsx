'use client';

import { useEffect } from 'react';

export default function AutoDownload({ downloadUrl }: { downloadUrl: string }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = downloadUrl;
        }, 2000); // 2 second delay

        return () => clearTimeout(timer);
    }, [downloadUrl]);

    return null;
}
