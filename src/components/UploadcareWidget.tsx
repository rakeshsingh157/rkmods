'use client';

import { useEffect, useRef } from 'react';

interface UploadcareWidgetProps {
    publicKey: string;
    onChange: (info: any) => void;
    clearable?: boolean;
    imagesOnly?: boolean;
}

export default function UploadcareWidget({ publicKey, onChange, clearable, imagesOnly }: UploadcareWidgetProps) {
    const widgetRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && widgetRef.current) {
            // Dynamically load uploadcare widget script
            const script = document.createElement('script');
            script.src = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js';
            script.charset = 'utf-8';
            document.head.appendChild(script);

            const link = document.createElement('link');
            link.href = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.min.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            script.onload = () => {
                if (widgetRef.current && (window as any).uploadcare) {
                    const widget = (window as any).uploadcare.Widget(widgetRef.current);
                    widget.onUploadComplete((info: any) => {
                        onChange(info);
                    });
                }
            };

            return () => {
                document.head.removeChild(script);
                document.head.removeChild(link);
            };
        }
    }, [publicKey, onChange]);

    return (
        <input
            ref={widgetRef}
            type="hidden"
            role="uploadcare-uploader"
            data-public-key={publicKey}
            data-clearable={clearable ? 'true' : 'false'}
            data-images-only={imagesOnly ? 'true' : 'false'}
        />
    );
}
