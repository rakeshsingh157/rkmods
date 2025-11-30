'use client';

import { useEffect, useRef, useState } from 'react';

interface UploadcareWidgetProps {
    publicKey: string;
    onChange: (info: any) => void;
    clearable?: boolean;
    imagesOnly?: boolean;
}

// Track if script is already loaded globally
let uploadcareScriptLoaded = false;

export default function UploadcareWidget({ publicKey, onChange, clearable, imagesOnly }: UploadcareWidgetProps) {
    const widgetRef = useRef<HTMLInputElement>(null);
    const widgetInstanceRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initWidget = () => {
            if (widgetRef.current && (window as any).uploadcare && !widgetInstanceRef.current) {
                try {
                    widgetInstanceRef.current = (window as any).uploadcare.Widget(widgetRef.current);
                    widgetInstanceRef.current.onUploadComplete((info: any) => {
                        onChange(info);
                    });
                    setIsReady(true);
                } catch (error) {
                    console.error('Error initializing Uploadcare widget:', error);
                }
            }
        };

        if ((window as any).uploadcare) {
            // Already loaded
            initWidget();
        } else if (!uploadcareScriptLoaded) {
            // Load script only once
            uploadcareScriptLoaded = true;
            
            const link = document.createElement('link');
            link.href = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.min.css';
            link.rel = 'stylesheet';
            link.id = 'uploadcare-css';
            
            const script = document.createElement('script');
            script.src = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js';
            script.charset = 'utf-8';
            script.id = 'uploadcare-script';
            
            script.onload = () => {
                initWidget();
            };

            if (!document.getElementById('uploadcare-css')) {
                document.head.appendChild(link);
            }
            if (!document.getElementById('uploadcare-script')) {
                document.head.appendChild(script);
            }
        }

        return () => {
            // Cleanup widget instance only
            if (widgetInstanceRef.current) {
                try {
                    widgetInstanceRef.current = null;
                } catch (error) {
                    console.error('Error cleaning up widget:', error);
                }
            }
        };
    }, []);

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
