package com.sssit.bikerental.modules.review.Entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sssit.bikerental.exception.BookingNotCompletedException;
import com.sssit.bikerental.exception.DuplicateReviewException;
import com.sssit.bikerental.exception.ReviewNotFoundException;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public Review addReview(Review review) {

        // 1. Booking ID validation
        if (review.getBookingId() == null) {
            throw new RuntimeException("Booking ID is required.");
        }

        // 2. Rating validation
        if (review.getRating() == null ||
            review.getRating() < 1 ||
            review.getRating() > 5) {

            throw new RuntimeException("Rating must be between 1 and 5.");
        }

        // 3. Review message validation
        if (review.getReviewMessage() == null ||
            review.getReviewMessage().trim().isEmpty()) {

            throw new RuntimeException("Review message cannot be empty.");
        }

        if (reviewRepository.existsByBookingId(review.getBookingId())) {
            throw new DuplicateReviewException("Review already submitted for this booking.");
        }

        // 5. Ride completion validation
        Booking booking = bookingRepository.findById(review.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"COMPLETED".equalsIgnoreCase(booking.getStatus())) {
            throw new BookingNotCompletedException("You can review only after ride completion.");
        }
        // 6. Set dates
        review.setReviewDate(LocalDate.now());
        review.setCreatedAt(LocalDateTime.now());

        // 7. Save review
        return reviewRepository.save(review);
    }
    @Override
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @Override
    public Review getReviewById(Long reviewId) {
    	Review review = reviewRepository.findById(reviewId)
    	        .orElseThrow(() ->
    	            new ReviewNotFoundException("Review not found with id : " + reviewId));
    	   return review;
    }

    private void validateReviewOwnership(Review review) {
        com.sssit.bikerental.modules.user.User currentUser = com.sssit.bikerental.common.security.SecurityUtils.getCurrentUser();
        if (currentUser != null && currentUser.getRole() != com.sssit.bikerental.common.enums.Role.ADMIN) {
            if (review.getCustomerId() != null && !review.getCustomerId().equals(currentUser.getId())) {
                throw new com.sssit.bikerental.common.exception.ResourceOwnershipException("Access denied: You can only modify or delete your own reviews");
            }
        }
    }

    @Override
    public Review updateReview(Long reviewId, Review updatedReview) {

    	Review review = reviewRepository.findById(reviewId)
    	        .orElseThrow(() ->
    	            new ReviewNotFoundException("Review not found with id : " + reviewId));

        validateReviewOwnership(review);

        review.setRating(updatedReview.getRating());
        review.setReviewMessage(updatedReview.getReviewMessage());
        review.setReviewDate(LocalDate.now());

        return reviewRepository.save(review);
    }

    @Override
    public void deleteReview(Long reviewId) {
    	Review review = reviewRepository.findById(reviewId)
    	        .orElseThrow(() ->
    	            new ReviewNotFoundException("Review not found with id : " + reviewId));
        validateReviewOwnership(review);
        reviewRepository.delete(review);
    }

    @Override
    public List<Review> getReviewsByBike(Long bikeId) {

        return reviewRepository.findByBikeId(bikeId);
    }

    @Override
    public List<Review> getReviewsByCustomer(Long customerId) {

        return reviewRepository.findByCustomerId(customerId);
    }
    @Override
    public Double getAverageRating(Long bikeId) {

        List<Review> reviews = reviewRepository.findByBikeId(bikeId);

        if (reviews.isEmpty()) {
            return 0.0;
        }

        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }
}