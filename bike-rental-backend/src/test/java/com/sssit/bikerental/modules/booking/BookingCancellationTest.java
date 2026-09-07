package com.sssit.bikerental.modules.booking;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.booking.dto.CancelBookingRequest;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.enums.CancelledBy;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.booking.service.impl.BookingServiceImpl;
import com.sssit.bikerental.modules.gps.repository.RideRepository;
import com.sssit.bikerental.modules.notification.entity.NotificationService;
import com.sssit.bikerental.modules.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class BookingCancellationTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BikeRepository bikeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private RideRepository rideRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Booking testBooking;
    private Bike testBike;

    @BeforeEach
    void setUp() {
        testBike = Bike.builder()
                .bikeId(10L)
                .bikeName("Yamaha R15")
                .ownerId(200L)
                .bikeStatus(BikeStatus.BOOKED)
                .rentalPrice(new BigDecimal("500.00"))
                .hourlyRate(new BigDecimal("50.00"))
                .build();

        testBooking = Booking.builder()
                .customerId(100L)
                .bikeId(10L)
                .bookingStatus(BookingStatus.PENDING)
                .startTime(LocalDateTime.now().plusHours(2))
                .returnTime(LocalDateTime.now().plusHours(6))
                .rentalAmount(new BigDecimal("200.00"))
                .build();
        testBooking.setId(1L);
    }

    // ----------------------------------------------------
    // CUSTOMER CANCELLATION TESTS
    // ----------------------------------------------------

    @Test
    @DisplayName("1. Customer can cancel own PENDING booking with reason")
    void testCustomerCanCancelOwnPendingBooking() {
        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(100L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.CUSTOMER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

            CancelBookingRequest req = new CancelBookingRequest("Change of plans");
            BookingResponse response = bookingService.cancelBooking(1L, req);

            assertNotNull(response);
            assertEquals(BookingStatus.CANCELLED, testBooking.getBookingStatus());
            assertEquals("Change of plans", testBooking.getCancellationReason());
            assertEquals(CancelledBy.CUSTOMER, testBooking.getCancelledBy());
            assertNotNull(testBooking.getCancelledAt());
            assertEquals(BikeStatus.AVAILABLE, testBike.getBikeStatus());
            verify(bikeRepository).save(testBike);
        }
    }

    @Test
    @DisplayName("2. Customer can cancel own CONFIRMED booking")
    void testCustomerCanCancelOwnConfirmedBooking() {
        testBooking.setBookingStatus(BookingStatus.CONFIRMED);

        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(100L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.CUSTOMER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

            CancelBookingRequest req = new CancelBookingRequest("Found another bike");
            BookingResponse response = bookingService.cancelBooking(1L, req);

            assertNotNull(response);
            assertEquals(BookingStatus.CANCELLED, testBooking.getBookingStatus());
            assertEquals(CancelledBy.CUSTOMER, testBooking.getCancelledBy());
        }
    }

    @Test
    @DisplayName("3. Customer cannot cancel ACTIVE booking")
    void testCustomerCannotCancelActiveBooking() {
        testBooking.setBookingStatus(BookingStatus.ACTIVE);

        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(100L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.CUSTOMER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

            CancelBookingRequest req = new CancelBookingRequest("Emergency");
            IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                    bookingService.cancelBooking(1L, req));

            assertTrue(ex.getMessage().contains("Active bookings cannot be cancelled"));
        }
    }

    @Test
    @DisplayName("4. Customer cannot cancel COMPLETED booking")
    void testCustomerCannotCancelCompletedBooking() {
        testBooking.setBookingStatus(BookingStatus.COMPLETED);

        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(100L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.CUSTOMER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

            CancelBookingRequest req = new CancelBookingRequest("Refund request");
            IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                    bookingService.cancelBooking(1L, req));

            assertTrue(ex.getMessage().contains("Completed bookings cannot be cancelled"));
        }
    }

    @Test
    @DisplayName("5. Customer cannot cancel already CANCELLED booking")
    void testCustomerCannotCancelCancelledBooking() {
        testBooking.setBookingStatus(BookingStatus.CANCELLED);

        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(100L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.CUSTOMER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

            CancelBookingRequest req = new CancelBookingRequest("Cancel again");
            IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                    bookingService.cancelBooking(1L, req));

            assertTrue(ex.getMessage().contains("already cancelled"));
        }
    }

    @Test
    @DisplayName("6. Customer cannot cancel another customer's booking")
    void testCustomerCannotCancelAnotherCustomerBooking() {
        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(999L); // Different customer
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.CUSTOMER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

            CancelBookingRequest req = new CancelBookingRequest("Not my booking");
            AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                    bookingService.cancelBooking(1L, req));

            assertTrue(ex.getMessage().contains("not authorized"));
        }
    }

    @Test
    @DisplayName("7. Blank or null cancellation reason is rejected")
    void testBlankReasonRejected() {
        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(100L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.CUSTOMER);

            CancelBookingRequest reqNull = new CancelBookingRequest(null);
            assertThrows(IllegalArgumentException.class, () -> bookingService.cancelBooking(1L, reqNull));

            CancelBookingRequest reqBlank = new CancelBookingRequest("   ");
            assertThrows(IllegalArgumentException.class, () -> bookingService.cancelBooking(1L, reqBlank));
        }
    }

    // ----------------------------------------------------
    // OWNER CANCELLATION TESTS
    // ----------------------------------------------------

    @Test
    @DisplayName("11. Owner can cancel own-bike booking when allowed")
    void testOwnerCanCancelOwnBikeBooking() {
        testBooking.setBookingStatus(BookingStatus.CONFIRMED);

        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(200L); // Bike owner
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

            CancelBookingRequest req = new CancelBookingRequest("Bike maintenance required");
            BookingResponse response = bookingService.cancelBooking(1L, req);

            assertNotNull(response);
            assertEquals(BookingStatus.CANCELLED, testBooking.getBookingStatus());
            assertEquals("Bike maintenance required", testBooking.getCancellationReason());
            assertEquals(CancelledBy.OWNER, testBooking.getCancelledBy());
            assertNotNull(testBooking.getCancelledAt());
            assertEquals(BikeStatus.AVAILABLE, testBike.getBikeStatus());
        }
    }

    @Test
    @DisplayName("12. Owner cannot cancel booking for a bike they do not own")
    void testOwnerCannotCancelOtherOwnerBooking() {
        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(888L); // Different owner
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));

            CancelBookingRequest req = new CancelBookingRequest("Bike unavailable");
            AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                    bookingService.cancelBooking(1L, req));

            assertTrue(ex.getMessage().contains("do not own"));
        }
    }

    @Test
    @DisplayName("13. Owner cannot cancel ACTIVE booking")
    void testOwnerCannotCancelActiveBooking() {
        testBooking.setBookingStatus(BookingStatus.ACTIVE);

        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(200L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));

            CancelBookingRequest req = new CancelBookingRequest("Bike emergency");
            assertThrows(IllegalStateException.class, () -> bookingService.cancelBooking(1L, req));
        }
    }

    @Test
    @DisplayName("14. Owner cannot cancel COMPLETED booking")
    void testOwnerCannotCancelCompletedBooking() {
        testBooking.setBookingStatus(BookingStatus.COMPLETED);

        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(200L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));

            CancelBookingRequest req = new CancelBookingRequest("Completed already");
            assertThrows(IllegalStateException.class, () -> bookingService.cancelBooking(1L, req));
        }
    }

    // ----------------------------------------------------
    // ADMIN CANCELLATION TESTS
    // ----------------------------------------------------

    @Test
    @DisplayName("18. Admin can cancel any valid booking")
    void testAdminCanCancelAnyBooking() {
        testBooking.setBookingStatus(BookingStatus.APPROVED);

        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(9999L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.ADMIN);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

            CancelBookingRequest req = new CancelBookingRequest("Administrative cancellation due to policy");
            BookingResponse response = bookingService.cancelBooking(1L, req);

            assertNotNull(response);
            assertEquals(BookingStatus.CANCELLED, testBooking.getBookingStatus());
            assertEquals(CancelledBy.ADMIN, testBooking.getCancelledBy());
            assertEquals("Administrative cancellation due to policy", testBooking.getCancellationReason());
        }
    }

    @Test
    @DisplayName("19. Excessive cancellation reason > 500 characters is rejected")
    void testExcessiveReasonRejected() {
        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(100L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.CUSTOMER);

            String longReason = "A".repeat(501);
            CancelBookingRequest req = new CancelBookingRequest(longReason);
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                    bookingService.cancelBooking(1L, req));

            assertTrue(ex.getMessage().contains("cannot exceed 500 characters"));
        }
    }

    @Test
    @DisplayName("20. Cancellation does not set bike to AVAILABLE if another active booking exists")
    void testCancellationPreservesBookedStatusIfAnotherActiveBookingExists() {
        try (MockedStatic<SecurityUtils> sec = mockStatic(SecurityUtils.class)) {
            sec.when(SecurityUtils::getCurrentUserId).thenReturn(100L);
            sec.when(SecurityUtils::getCurrentRole).thenReturn(Role.CUSTOMER);

            Booking otherActiveBooking = Booking.builder()
                    .customerId(101L)
                    .bikeId(10L)
                    .bookingStatus(BookingStatus.ACTIVE)
                    .startTime(LocalDateTime.now().minusHours(1))
                    .returnTime(LocalDateTime.now().plusHours(3))
                    .build();
            otherActiveBooking.setId(2L);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
            when(bookingRepository.findByBikeId(10L)).thenReturn(java.util.List.of(testBooking, otherActiveBooking));

            CancelBookingRequest req = new CancelBookingRequest("Plans cancelled");
            bookingService.cancelBooking(1L, req);

            assertEquals(BikeStatus.BOOKED, testBike.getBikeStatus());
            verify(bikeRepository).save(testBike);
        }
    }
}
