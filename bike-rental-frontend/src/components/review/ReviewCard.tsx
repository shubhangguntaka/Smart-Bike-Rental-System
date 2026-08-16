import React from "react";
import type { Review } from "@/types/review";
import RatingStars from "./RatingStars";
import { User, Calendar, Edit3, Trash2, ShieldCheck } from "lucide-react";
import useAuth from "@/hooks/useAuth";

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
}

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return "Recently";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Just now";
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onEdit, onDelete }) => {
  const { user } = useAuth();
  const currentUserId = user?.id ? Number(user.id) : null;
  const isAuthor = currentUserId !== null && Number(review.customerId) === currentUserId;

  return (
    <div className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:shadow-sm transition-all duration-200 space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
            {review.customerName ? review.customerName[0].toUpperCase() : <User className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">
                {review.customerName || `Customer #${review.customerId}`}
              </h4>
              {isAuthor && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {formatRelativeTime(review.createdAt || review.reviewDate)}
              </span>
              <span>•</span>
              <span className="font-mono text-muted-foreground">Booking #{review.bookingId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RatingStars rating={review.rating} readOnly size="sm" />
          {isAuthor && (
            <div className="flex items-center gap-1 pl-2 border-l border-border">
              {onEdit && (
                <button
                  type="button"
                  title="Edit Review"
                  onClick={() => onEdit(review)}
                  className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-accent transition cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}
              {onDelete && review.reviewId && (
                <button
                  type="button"
                  title="Delete Review"
                  onClick={() => onDelete(review.reviewId!)}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Content */}
      <p className="text-xs text-foreground/90 leading-relaxed font-normal bg-muted/20 p-3.5 rounded-xl border border-border/40">
        "{review.reviewMessage}"
      </p>
    </div>
  );
};

export default ReviewCard;