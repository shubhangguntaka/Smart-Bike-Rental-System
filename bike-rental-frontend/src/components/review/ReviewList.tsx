import React, { useState, useEffect } from "react";
import type { Review, ReviewDTO } from "@/types/review";
import reviewService from "@/services/reviewService";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import RatingStars from "./RatingStars";
import { Modal, ModalHeader, ModalBody } from "@/components/common/Modal";
import { Star, MessageSquare, SlidersHorizontal, Loader2, Award, PlusCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";

interface ReviewListProps {
  bikeId: number;
  showWriteReview?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({ bikeId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting & Filtering state
  const [sortBy, setSortBy] = useState<string>("latest");
  const [starFilter, setStarFilter] = useState<number | "ALL">("ALL");

  // Edit / Delete Modal state
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviewsAndRating = async () => {
    try {
      setLoading(true);
      setError(null);

      // Primary fetch with fallback to getAllReviews filtered by bikeId
      const listPromise = reviewService.getReviewsByBike(bikeId)
        .then((data) => (Array.isArray(data) && data.length > 0 ? data : null))
        .catch(() => null);

      const avgPromise = reviewService.getAverageRating(bikeId)
        .catch(() => null);

      let listData: Review[] | null;
      const avgData: number | null = await avgPromise;
      listData = await listPromise;

      // Fallback: If getReviewsByBike failed or returned null, try filtering getAllReviews
      if (!listData) {
        try {
          const allReviews = await reviewService.getAllReviews();
          listData = allReviews.filter((r) => Number(r.bikeId) === Number(bikeId));
        } catch {
          listData = [];
        }
      }

      const safeList = Array.isArray(listData) ? listData : [];
      setReviews(safeList);

      if (typeof avgData === "number" && !isNaN(avgData) && avgData > 0) {
        setAverageRating(avgData);
      } else if (safeList.length > 0) {
        const sum = safeList.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
        setAverageRating(sum / safeList.length);
      } else {
        setAverageRating(0);
      }
    } catch (err: any) {
      console.error("Failed to load bike reviews:", err);
      setReviews([]);
      setAverageRating(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bikeId) {
      fetchReviewsAndRating();
    }
  }, [bikeId]);

  // Handle Edit Submit
  const handleUpdateReview = async (updatedDto: ReviewDTO) => {
    if (!editingReview?.reviewId) return;
    try {
      await reviewService.updateReview(editingReview.reviewId, {
        rating: updatedDto.rating,
        reviewMessage: updatedDto.reviewMessage,
      });
      toast.success("Review updated successfully!");
      setEditingReview(null);
      fetchReviewsAndRating();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update review.";
      toast.error(msg);
    }
  };

  // Handle Delete Confirm
  const handleDeleteReview = async () => {
    if (!deletingId) return;
    try {
      await reviewService.deleteReview(deletingId);
      toast.success("Review deleted successfully.");
      setDeletingId(null);
      fetchReviewsAndRating();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete review.");
    }
  };

  // Filter & Sort Logic
  const filteredReviews = reviews.filter((r) => {
    if (starFilter === "ALL") return true;
    return r.rating === starFilter;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "latest") {
      const dtA = new Date(a.createdAt || a.reviewDate || 0).getTime();
      const dtB = new Date(b.createdAt || b.reviewDate || 0).getTime();
      return dtB - dtA;
    }
    if (sortBy === "oldest") {
      const dtA = new Date(a.createdAt || a.reviewDate || 0).getTime();
      const dtB = new Date(b.createdAt || b.reviewDate || 0).getTime();
      return dtA - dtB;
    }
    if (sortBy === "highest") {
      return b.rating - a.rating;
    }
    if (sortBy === "lowest") {
      return a.rating - b.rating;
    }
    return 0;
  });

  return (
    <div className="space-y-6 text-foreground">
      {/* Aggregate Rating Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 min-w-20">
            <span className="text-3xl font-black font-mono leading-none">
              {reviews.length > 0 ? averageRating.toFixed(1) : "N/A"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-amber-600">
              {reviews.length > 0 ? "Rating" : "Unrated"}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <RatingStars rating={Math.round(averageRating)} readOnly size="md" />
              <span className="text-sm font-bold text-foreground">
                {reviews.length > 0 ? `${reviews.length} Customer Review${reviews.length > 1 ? "s" : ""}` : "No reviews yet"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {reviews.length > 0
                ? "Verified customer reviews and ratings for this rental bike."
                : "Be the first to rent and leave a review for this vehicle!"}
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        {reviews.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-semibold outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>

            <select
              value={starFilter}
              onChange={(e) => setStarFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-semibold outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="ALL">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs font-semibold">Loading reviews...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
          {error}
        </div>
      ) : sortedReviews.length > 0 ? (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              onEdit={setEditingReview}
              onDelete={setDeletingId}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-2 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40" />
          <p className="text-sm font-bold text-foreground">No reviews found</p>
          <p className="text-xs">
            {reviews.length > 0 ? "No reviews match the selected star filter." : "No customer reviews submitted yet for this bike."}
          </p>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <Modal isOpen={!!editingReview} onClose={() => setEditingReview(null)} size="md">
          <ModalHeader onClose={() => setEditingReview(null)}>Edit Your Review</ModalHeader>
          <ModalBody>
            <ReviewForm
              bookingId={editingReview.bookingId}
              bikeId={editingReview.bikeId}
              customerId={editingReview.customerId}
              initialRating={editingReview.rating}
              initialMessage={editingReview.reviewMessage}
              isEditMode
              onSubmit={handleUpdateReview}
              onCancel={() => setEditingReview(null)}
            />
          </ModalBody>
        </Modal>
      )}

      {/* Delete Review Confirm Modal */}
      {deletingId !== null && (
        <Modal isOpen={deletingId !== null} onClose={() => setDeletingId(null)} size="sm">
          <ModalHeader onClose={() => setDeletingId(null)}>Delete Review</ModalHeader>
          <ModalBody>
            <div className="space-y-4 py-2">
              <p className="text-xs text-foreground font-medium">
                Are you sure you want to delete your review? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-bold hover:bg-accent transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer"
                >
                  Delete Review
                </button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default ReviewList;
