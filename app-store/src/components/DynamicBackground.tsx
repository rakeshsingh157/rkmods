'use client';

import { useEffect, useState } from 'react';

interface DynamicBackgroundProps {
    iconUrl: string;
}

export default function DynamicBackground({ iconUrl }: DynamicBackgroundProps) {
    const [colors, setColors] = useState<string[]>(['#06b6d4', '#3b82f6']); // cyan and blue defaults

    useEffect(() => {
        if (!iconUrl) return;

        const extractColors = async () => {
            try {
                const img = new Image();
                // Try without CORS first for same-origin images
                img.src = iconUrl;

                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d', { willReadFrequently: true });
                        if (!ctx) return;

                        // Use smaller canvas for better performance
                        const size = 100;
                        canvas.width = size;
                        canvas.height = size;
                        ctx.drawImage(img, 0, 0, size, size);

                        const imageData = ctx.getImageData(0, 0, size, size);
                        const data = imageData.data;

                        // Collect color frequencies
                        const colorMap: { [key: string]: number } = {};

                        for (let i = 0; i < data.length; i += 4 * 5) { // Sample every 5th pixel
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            const a = data[i + 3];

                            // Skip transparent or very dark/very light pixels
                            if (a < 50) continue;
                            const brightness = r + g + b;
                            if (brightness < 80 || brightness > 650) continue;

                            // Group similar colors
                            const colorKey = `${Math.floor(r / 30)},${Math.floor(g / 30)},${Math.floor(b / 30)}`;
                            colorMap[colorKey] = (colorMap[colorKey] || 0) + 1;
                        }

                        // Get top 3 most common colors
                        const sortedColors = Object.entries(colorMap)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([color]) => {
                                const [r, g, b] = color.split(',').map(n => Math.min(255, parseInt(n) * 30 + 15));
                                // Boost saturation slightly
                                return `rgb(${r}, ${g}, ${b})`;
                            });

                        if (sortedColors.length >= 2) {
                            setColors(sortedColors.slice(0, 2));
                            console.log('Extracted colors:', sortedColors);
                        }
                    } catch (err) {
                        console.error('Canvas error:', err);
                    }
                };

                img.onerror = () => {
                    console.error('Failed to load image for color extraction');
                };
            } catch (error) {
                console.error('Error extracting colors:', error);
            }
        };

        extractColors();
    }, [iconUrl]);

    return (
        <>
            <div 
                className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse transition-colors duration-1000 -z-10"
                style={{ backgroundColor: colors[0], opacity: 0.25 }}
            ></div>
            <div 
                className="absolute bottom-20 left-0 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse transition-colors duration-1000 -z-10 [animation-delay:1.5s]"
                style={{ backgroundColor: colors[1], opacity: 0.25 }}
            ></div>
            <div 
                className="absolute top-0 left-0 w-full h-full -z-10 transition-all duration-1000"
                style={{
                    background: `linear-gradient(135deg, ${colors[0]}20 0%, transparent 40%, ${colors[1]}20 100%)`,
                }}
            ></div>
        </>
    );
}
