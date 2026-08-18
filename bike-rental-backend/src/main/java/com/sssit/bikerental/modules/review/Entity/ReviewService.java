package com.sssit.bikerental.modules.review.entity;

import java.util.List;

public interface ReviewService {

    Review addReview(Review review);

    List<Review> getAllReviews();

    Review getReviewById(Long id);

    Review updateReview(Long id, Review review);

    void deleteReview(Long id);

    List<Review> getReviewsByBike(Long bikeId);

    List<Review> getReviewsByCustomer(Long customerId);
    
    Double getAverageRating(Long bikeId);
    
}	