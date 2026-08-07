package com.sssit.bikerental.modules.review.Entity;

import java.util.List;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
	  List<Review> findByBikeId(Long bikeId);

	    List<Review> findByCustomerId(Long customerId);
	    boolean existsByBookingId(Long bookingId);
    
}
