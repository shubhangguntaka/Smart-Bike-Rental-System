package com.sssit.bikerental.modules.review.Entity;



import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    // Entity -> DTO
    public ReviewDTO toDTO(Review review) {

        if (review == null) {
            return null;
        }

        ReviewDTO dto = new ReviewDTO();

        dto.setReviewId(review.getReviewId());
        dto.setBookingId(review.getBookingId());
        dto.setCustomerId(review.getCustomerId());
        dto.setBikeId(review.getBikeId());
        dto.setRating(review.getRating());
        dto.setReviewMessage(review.getReviewMessage());

        return dto;
    }

    // DTO -> Entity
    public Review toEntity(ReviewDTO dto) {

        if (dto == null) {
            return null;
        }

        Review review = new Review();

        review.setReviewId(dto.getReviewId());
        review.setBookingId(dto.getBookingId());
        review.setCustomerId(dto.getCustomerId());
        review.setBikeId(dto.getBikeId());
        review.setRating(dto.getRating());
        review.setReviewMessage(dto.getReviewMessage());

        return review;
    }
}