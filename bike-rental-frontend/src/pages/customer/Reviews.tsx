import { useEffect, useState } from "react";
import reviewService from "../../services/reviewService";
import type { Review, ReviewDTO } from "../../types/review";
import ReviewCard from "../../components/review/ReviewCard";
import ReviewForm from "../../components/review/ReviewForm";

const Reviews = () => {

    const [reviews, setReviews] = useState<Review[]>([]);

    const loadReviews = async () => {
        try {
            const data = await reviewService.getAllReviews();
            setReviews(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleSubmit = async (review: ReviewDTO) => {

        try {

            await reviewService.addReview(review);

            alert("Review Submitted Successfully");

            loadReviews();

        } catch (error) {

            console.error(error);

            alert("Unable to submit review");

        }

    };

    return (

        <div className="max-w-5xl mx-auto p-6">

            <h1 className="text-3xl font-bold mb-6">
                Bike Reviews
            </h1>

            <ReviewForm onSubmit={handleSubmit} />

            <div className="mt-8 space-y-4">

                {reviews.map((review) => (

                    <ReviewCard
                        key={review.reviewId}
                        review={review}
                    />

                ))}

            </div>

        </div>

    );

};

export default Reviews;