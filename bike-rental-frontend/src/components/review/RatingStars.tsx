import React from "react";

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
}) => {

  return (
    <div className="flex gap-1">

      {[1, 2, 3, 4, 5].map((star) => (

        <span
          key={star}
          className={`text-2xl cursor-pointer ${
            star <= rating ? "text-yellow-500" : "text-gray-400"
          }`}
          onClick={() => onRatingChange?.(star)}
        >
          ★
        </span>

      ))}

    </div>
  );
};

export default RatingStars;