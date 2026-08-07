package com.sssit.bikerental.modules.review.Entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sssit.bikerental.common.enums.OtpPurpose;
import com.sssit.bikerental.modules.user.User;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reviews")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
	public class Review {

	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long reviewId;

	    private Long bookingId;

	    private Long customerId;

	    private Long bikeId;

	    private Integer rating;

	    private String reviewMessage;

	    private LocalDate reviewDate;

	    private LocalDateTime createdAt;
	}


