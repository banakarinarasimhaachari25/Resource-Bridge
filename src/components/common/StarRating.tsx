import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showScore?: boolean;
  totalReviews?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showScore = false,
  totalReviews,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = currentDisplayRating >= starValue;
          const isHalf = !isFilled && currentDisplayRating >= starValue - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-115 transition-transform focus:outline-none'
                  : 'cursor-default'
              } p-0.5`}
              aria-label={interactive ? `Rate ${starValue} stars out of ${maxStars}` : `${rating} stars`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? 'fill-[#BF6B2E] text-[#BF6B2E]'
                    : isHalf
                    ? 'fill-[#BF6B2E]/50 text-[#BF6B2E]'
                    : 'fill-stone-100 text-[#D8C3A5]'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="font-semibold text-xs font-inter text-[#34251F] ml-0.5">
          {rating > 0 ? rating.toFixed(1) : 'New'}
          {totalReviews !== undefined && (
            <span className="font-normal text-stone-500 ml-1">
              ({totalReviews})
            </span>
          )}
        </span>
      )}
    </div>
  );
};
