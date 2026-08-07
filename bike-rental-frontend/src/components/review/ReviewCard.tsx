import type { Review } from "../../types/review";
import RatingStars from "./ratingStars";

interface Props {
  review: Review;
}

const ReviewCard = ({ review }: Props) => {

  return (

    <div className="border rounded-lg p-4 shadow">

      <h2 className="font-semibold">
        Customer #{review.customerId}
      </h2>

      <p>Bike ID : {review.bikeId}</p>

      <RatingStars rating={review.rating} />

      <p className="mt-2">
        {review.reviewMessage}
      </p>

      <p className="text-sm text-gray-500 mt-2">
        {review.reviewDate}
      </p>

    </div>

  );

};

export default ReviewCard;