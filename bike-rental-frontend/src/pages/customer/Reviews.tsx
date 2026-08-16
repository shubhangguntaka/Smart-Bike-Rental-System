import React, { useEffect, useState } from "react";
import reviewService from "@/services/reviewService";
import type { Review } from "@/types/review";
import ReviewCard from "@/components/review/ReviewCard";
import RatingStars from "@/components/review/RatingStars";
import { Star, MessageSquare, Loader2, Award, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CustomerReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewService.getAllReviews();
      setReviews(data || []);
    } catch (err: any) {
      console.error("Failed to load reviews:", err);
      setError("Unable to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (reviewId: number) => {
    try {
      await reviewService.deleteReview(reviewId);
      toast.success("Review deleted.");
      loadReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete review.");
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  // Sort latest first
  const sortedReviews = [...reviews].sort((a, b) => {
    const dtA = new Date(a.createdAt || a.reviewDate || 0).getTime();
    const dtB = new Date(b.createdAt || b.reviewDate || 0).getTime();
    return dtB - dtA;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 text-foreground">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Customer Reviews & Ratings
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real customer reviews for rental bikes across the platform.
          </p>
        </div>

        {/* Aggregate Stats Card */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-2xl shadow-xs">
            <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <span className="text-2xl font-black font-mono leading-none">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-[9px] font-bold uppercase mt-1 text-amber-600">Avg Rating</span>
            </div>
            <div className="space-y-1">
              <RatingStars rating={Math.round(avgRating)} readOnly size="sm" />
              <p className="text-xs font-bold text-foreground">
                {reviews.length} Verified Review{reviews.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-semibold">Loading platform reviews...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
          {error}
        </div>
      ) : sortedReviews.length > 0 ? (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <ReviewCard key={review.reviewId} review={review} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center border border-dashed border-border rounded-2xl bg-card space-y-2 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30" />
          <p className="text-sm font-bold text-foreground">No reviews submitted yet</p>
          <p className="text-xs">Customer reviews will appear here once rides are completed.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;