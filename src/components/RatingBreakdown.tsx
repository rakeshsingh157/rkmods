'use client';

import { Star } from 'lucide-react';

interface Review {
    rating: number;
}

const getWidthClass = (percentage: number) => {
    if (percentage === 0) return 'w-0';
    if (percentage < 10) return 'w-[10%]';
    if (percentage < 20) return 'w-[20%]';
    if (percentage < 30) return 'w-[30%]';
    if (percentage < 40) return 'w-[40%]';
    if (percentage < 50) return 'w-[50%]';
    if (percentage < 60) return 'w-[60%]';
    if (percentage < 70) return 'w-[70%]';
    if (percentage < 80) return 'w-[80%]';
    if (percentage < 90) return 'w-[90%]';
    return 'w-full';
};

export default function RatingBreakdown({ reviews }: { reviews: Review[] }) {
    const ratingCounts = [0, 0, 0, 0, 0];
    
    reviews.forEach((review) => {
        if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[review.rating - 1]++;
        }
    });

    const totalReviews = reviews.length;

    return (
        <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts[rating - 1];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                const widthClass = getWidthClass(percentage);
                
                return (
                    <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12">
                            <span className="text-sm text-gray-400 font-medium">{rating}</span>
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500 ${widthClass}`}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                    </div>
                );
            })}
        </div>
    );
}
