'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScreenshotGalleryProps {
    screenshots: string[];
}

export default function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const openLightbox = (index: number) => {
        setSelectedImage(screenshots[index]);
        setCurrentIndex(index);
        document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'unset';
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % screenshots.length;
        setSelectedImage(screenshots[nextIndex]);
        setCurrentIndex(nextIndex);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        const prevIndex = (currentIndex - 1 + screenshots.length) % screenshots.length;
        setSelectedImage(screenshots[prevIndex]);
        setCurrentIndex(prevIndex);
    };
    return (
        <>
            {/* Mobile: horizontal scroll, Desktop: grid */}
            <div className="md:hidden flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory -mx-6 px-6 scrollbar-hide">
                {screenshots.map((shot, i) => (
                    <div
                        key={i}
                        className="shrink-0 w-[60vw] aspect-[9/16] snap-center cursor-pointer rounded-2xl overflow-hidden shadow-lg border border-white/10"
                        onClick={() => openLightbox(i)}
                    >
                        <img
                            src={shot}
                            alt={`Screenshot ${i + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Desktop: responsive grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
                {screenshots.map((shot, i) => (
                    <div
                        key={i}
                        className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 hover:border-cyan-500/30 transition shadow-lg hover:shadow-cyan-500/10 aspect-[9/16]"
                        onClick={() => openLightbox(i)}
                    >
                        <img
                            src={shot}
                            alt={`Screenshot ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && createPortal(
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-50"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition hidden md:block"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition hidden md:block"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <img
                        src={selectedImage}
                        alt="Full screen view"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm font-medium bg-black/50 px-3 py-1 rounded-full border border-white/10">
                        {currentIndex + 1} / {screenshots.length}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
