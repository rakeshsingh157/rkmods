'use client';

import { useEffect, useRef } from 'react';

interface UploadcareWidgetProps {
    publicKey: string;
    onChange: (info: any) => void;
    clearable?: boolean;
    imagesOnly?: boolean;
    multiple?: boolean;
    tabs?: string;
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

export default function UploadcareWidget({ publicKey, onChange, clearable, imagesOnly, multiple, tabs }: UploadcareWidgetProps) {
    const widgetRef = useRef<HTMLInputElement>(null);
    const widgetInstanceRef = useRef<any>(null);

    console.log('[Widget] Component rendering with:', { multiple, imagesOnly, publicKey, tabs });

    useEffect(() => {
        console.log('[Widget] useEffect triggered!');
        if (typeof window === 'undefined') {
            console.log('[Widget] Window is undefined, bailing');
            return;
        }

        const initWidget = async () => {
            console.log('[Widget] Starting initialization...');
            await loadUploadcareScript();
            console.log('[Widget] Script loaded, window.uploadcare:', typeof (window as any).uploadcare);

            if (widgetRef.current && !widgetInstanceRef.current) {
                console.log('[Widget] Initializing for:', { multiple, imagesOnly, publicKey, tabs });
                console.log('[Widget] Widget ref element:', widgetRef.current);

                try {
                    const widget = (window as any).uploadcare.Widget(widgetRef.current);
                    console.log('[Widget] Widget created:', widget);

                    // Try both onChange and onUploadComplete
                    widget.onChange((file: any) => {
                        console.log('[Widget] ===== onChange FIRED =====');
                        console.log('[Widget] File object:', file);

                        if (file) {
                            file.done((info: any) => {
                                console.log('[Widget] ===== FILE DONE =====');
                                console.log('[Widget] Info object:', info);
                                console.log('[Widget] Info.count:', info.count);
                                console.log('[Widget] Info.cdnUrl:', info.cdnUrl);
                                console.log('[Widget] Calling onChange callback...');
                                onChange(info);
                                console.log('[Widget] onChange called');
                            });
                        }
                    });

                    widget.onUploadComplete((info: any) => {
                        console.log('[Widget] ===== onUploadComplete FIRED =====');
                        console.log('[Widget] Info object:', info);
                        onChange(info);
                    });

                    widgetInstanceRef.current = widget;
                    console.log('[Widget] Widget ready and listening');
                } catch (error) {
                    console.error('[Widget] Error during initialization:', error);
                }
            } else {
                console.log('[Widget] Skipping init - widgetRef:', widgetRef.current, 'instance:', widgetInstanceRef.current);
            }
        };

        initWidget();

        return () => {
            console.log('[Widget] Cleanup');
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
            data-tabs={tabs}
        />
    );
}
