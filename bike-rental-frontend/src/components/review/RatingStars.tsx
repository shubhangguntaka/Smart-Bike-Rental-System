import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  readOnly = false,
  size = "md",
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  const activeSize = starSizes[size];

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onRatingChange?.(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(null)}
            className={`transition-all duration-150 ${
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
            } focus:outline-none`}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`${activeSize} ${
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                  : "fill-muted text-muted-foreground/40"
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;