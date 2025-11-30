'use client';

import { useEffect, useRef } from 'react';

interface UploadcareWidgetProps {
    publicKey: string;
    onChange: (info: any) => void;
    clearable?: boolean;
    imagesOnly?: boolean;
    multiple?: boolean;
}

// Track if script is already loaded globally
let uploadcareScriptLoaded = false;
let uploadcareScriptPromise: Promise<void> | null = null;

function loadUploadcareScript(): Promise<void> {
    if (uploadcareScriptPromise) {
        return uploadcareScriptPromise;
    }

    if ((window as any).uploadcare) {
        return Promise.resolve();
    }

    uploadcareScriptPromise = new Promise((resolve) => {
        const link = document.createElement('link');
        link.href = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.min.css';
        link.rel = 'stylesheet';
        
        const script = document.createElement('script');
        script.src = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js';
        script.charset = 'utf-8';
        
        script.onload = () => {
            console.log('Uploadcare script loaded globally');
            resolve();
        };

        document.head.appendChild(link);
        document.head.appendChild(script);
    });

    return uploadcareScriptPromise;
}

export default function UploadcareWidget({ publicKey, onChange, clearable, imagesOnly, multiple }: UploadcareWidgetProps) {
    const widgetRef = useRef<HTMLInputElement>(null);
    const widgetInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initWidget = async () => {
            await loadUploadcareScript();
            
            if (widgetRef.current && !widgetInstanceRef.current) {
                console.log('Initializing widget for:', { multiple, imagesOnly });
                const widget = (window as any).uploadcare.Widget(widgetRef.current);
                
                widget.onUploadComplete((info: any) => {
                    console.log('onUploadComplete triggered:', info);
                    onChange(info);
                });
                
                widgetInstanceRef.current = widget;
                console.log('Widget ready');
            }
        };

        initWidget();

        return () => {
            if (widgetInstanceRef.current) {
                widgetInstanceRef.current = null;
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
            data-multiple={multiple ? 'true' : 'false'}
            data-multiple-max={multiple ? '10' : undefined}
        />
    );
}
