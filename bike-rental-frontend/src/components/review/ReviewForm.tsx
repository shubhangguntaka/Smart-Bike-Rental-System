import React, { useState, useEffect } from "react";
import RatingStars from "./RatingStars";
import { Loader2, MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";
import type { ReviewDTO } from "@/types/review";

interface ReviewFormProps {
  bookingId: number;
  bikeId: number;
  customerId: number;
  initialRating?: number;
  initialMessage?: string;
  isEditMode?: boolean;
  onSubmit: (review: ReviewDTO) => Promise<void>;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  bookingId,
  bikeId,
  customerId,
  initialRating = 5,
  initialMessage = "",
  isEditMode = false,
  onSubmit,
  onCancel,
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [reviewMessage, setReviewMessage] = useState<string>(initialMessage);
  const [loading, setLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setRating(initialRating);
    setReviewMessage(initialMessage);
  }, [initialRating, initialMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Frontend validation matching backend rules
    if (!rating || rating < 1 || rating > 5) {
      setValidationError("Please select a rating between 1 and 5 stars.");
      return;
    }

    if (!reviewMessage.trim()) {
      setValidationError("Review message cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        bookingId,
        bikeId,
        customerId,
        rating,
        reviewMessage: reviewMessage.trim(),
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to submit review.";
      setValidationError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border p-5 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          {isEditMode ? "Edit Your Review" : "Write a Rental Review"}
        </h3>
        <span className="text-xs font-semibold text-muted-foreground font-mono">
          Booking #{bookingId}
        </span>
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Rating Stars Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Rating (1 to 5 Stars)
        </label>
        <div className="flex items-center gap-3">
          <RatingStars rating={rating} onRatingChange={setRating} size="lg" />
          <span className="text-sm font-bold text-amber-500 font-mono">
            {rating} / 5
          </span>
        </div>
      </div>

      {/* Review Comment Textarea */}
      <div className="space-y-1.5">
        <label htmlFor="reviewMessage" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Your Experience / Feedback
        </label>
        <textarea
          id="reviewMessage"
          rows={4}
          value={reviewMessage}
          onChange={(e) => setReviewMessage(e.target.value)}
          placeholder="Share your experience regarding bike condition, pickup process, and performance..."
          className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition duration-200 resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        {onCancel && (
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-bold hover:bg-accent transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{isEditMode ? "Updating..." : "Submitting..."}</span>
            </>
          ) : (
            <>
              {isEditMode ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
              <span>{isEditMode ? "Update Review" : "Submit Review"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;