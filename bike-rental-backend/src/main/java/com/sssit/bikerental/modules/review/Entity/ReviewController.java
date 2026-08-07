package com.sssit.bikerental.modules.review.Entity;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Add Review
    @PostMapping
    public Review addReview(@RequestBody Review review) {
        return reviewService.addReview(review);
    }

    // Get All Reviews
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    // Get Review By Id
    @GetMapping("/{reviewId}")
    public Review getReviewById(@PathVariable Long reviewId) {
        return reviewService.getReviewById(reviewId);
    }

    // Update Review
    @PutMapping("/{reviewId}")
    public Review updateReview(@PathVariable Long reviewId,
                               @RequestBody Review review) {
        return reviewService.updateReview(reviewId, review);
    }

    // Delete Review
    @DeleteMapping("/{reviewId}")
    public String deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return "Review deleted successfully.";
    }

    // Get Reviews By Bike
    @GetMapping("/bike/{bikeId}")
    public List<Review> getReviewsByBike(@PathVariable Long bikeId) {
        return reviewService.getReviewsByBike(bikeId);
    }

    // Get Reviews By Customer
    @GetMapping("/customer/{customerId}")
    public List<Review> getReviewsByCustomer(@PathVariable Long customerId) {
        return reviewService.getReviewsByCustomer(customerId);
    }
    
    @GetMapping("/bike/{bikeId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long bikeId) {

        return ResponseEntity.ok(reviewService.getAverageRating(bikeId));
    }
}