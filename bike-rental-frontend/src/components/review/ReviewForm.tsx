import { useState } from "react";
import RatingStars from "./ratingStars";

interface Props {
  onSubmit: (review: any) => void;
}

const ReviewForm = ({ onSubmit }: Props) => {

  const [bikeId, setBikeId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    onSubmit({
      bikeId: Number(bikeId),
      bookingId: Number(bookingId),
      customerId: Number(customerId),
      rating,
      reviewMessage,
    });

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <input
        type="number"
        placeholder="Bike ID"
        className="border p-2 w-full"
        value={bikeId}
        onChange={(e) => setBikeId(e.target.value)}
      />

      <input
        type="number"
        placeholder="Booking ID"
        className="border p-2 w-full"
        value={bookingId}
        onChange={(e) => setBookingId(e.target.value)}
      />

      <input
        type="number"
        placeholder="Customer ID"
        className="border p-2 w-full"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
      />

      <RatingStars
        rating={rating}
        onRatingChange={setRating}
      />

      <textarea
        placeholder="Write Review"
        className="border p-2 w-full"
        value={reviewMessage}
        onChange={(e) => setReviewMessage(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>

    </form>

  );

};

export default ReviewForm;