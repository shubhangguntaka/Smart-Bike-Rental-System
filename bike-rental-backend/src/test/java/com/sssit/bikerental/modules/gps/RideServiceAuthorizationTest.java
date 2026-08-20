package com.sssit.bikerental.modules.gps;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.sssit.bikerental.common.exception.ResourceOwnershipException;
import com.sssit.bikerental.common.security.AuthorizationService;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.gps.dto.RideDTO;
import com.sssit.bikerental.modules.gps.entity.GPSLocation;
import com.sssit.bikerental.modules.gps.entity.Ride;
import com.sssit.bikerental.modules.gps.entity.RideHistory;
import com.sssit.bikerental.modules.gps.entity.RideStatus;
import com.sssit.bikerental.modules.gps.repository.GPSRepository;
import com.sssit.bikerental.modules.gps.repository.RideHistoryRepository;
import com.sssit.bikerental.modules.gps.repository.RideRepository;
import com.sssit.bikerental.modules.gps.serviceimpl.RideServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RideServiceAuthorizationTest {

    @Mock
    private RideRepository rideRepository;

    @Mock
    private GPSRepository gpsRepository;

    @Mock
    private RideHistoryRepository rideHistoryRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private RideServiceImpl rideService;

    private Ride testRide;
    private Booking testBooking;

    @BeforeEach
    void setUp() {

        testBooking = new Booking();

        testBooking.setId(1L);
        testBooking.setCustomerId(100L);
        testBooking.setBikeId(10L);
        testBooking.setBookingStatus(BookingStatus.CONFIRMED);

        testRide = new Ride();

        testRide.setId(1L);
        testRide.setBookingId(1L);
        testRide.setBikeId(10L);
        testRide.setCustomerId(100L);
        testRide.setStatus(RideStatus.ACTIVE);
        testRide.setStartedAt(LocalDateTime.now());
        testRide.setTotalDistance(0.0);
        testRide.setTotalDuration(0L);
    }

    @Test
    void startRide_ShouldReject_WhenCustomerIdDoesNotBelongToCurrentUser() {

        Long customerId = 100L;

        doThrow(new ResourceOwnershipException(
                "Access Denied: You can only access your own data"))
                .when(authorizationService)
                .validateCurrentUser(customerId);

        assertThrows(
                ResourceOwnershipException.class,
                () -> rideService.startRide(1L, 10L, customerId)
        );

        verify(authorizationService, times(1))
                .validateCurrentUser(customerId);

        verifyNoInteractions(bookingRepository);
        verifyNoInteractions(rideRepository);
    }

    @Test
    void startRide_ShouldReject_WhenBookingBelongsToAnotherCustomer() {

        Long customerId = 100L;

        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(testBooking));

        testBooking.setCustomerId(999L);

        assertThrows(
                RuntimeException.class,
                () -> rideService.startRide(1L, 10L, customerId)
        );

        verify(authorizationService, times(1))
                .validateCurrentUser(customerId);

        verify(bookingRepository, times(1))
                .findById(1L);

        verify(rideRepository, never())
                .save(any(Ride.class));
    }

    @Test
    void startRide_ShouldReject_WhenBikeDoesNotMatchBooking() {

        Long customerId = 100L;

        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(testBooking));

        assertThrows(
                RuntimeException.class,
                () -> rideService.startRide(1L, 999L, customerId)
        );

        verify(authorizationService, times(1))
                .validateCurrentUser(customerId);

        verify(bookingRepository, times(1))
                .findById(1L);

        verify(rideRepository, never())
                .save(any(Ride.class));
    }

    @Test
    void getRide_ShouldReject_WhenRideBelongsToAnotherCustomer() {

        testRide.setCustomerId(100L);

        doThrow(new ResourceOwnershipException(
                "Access Denied: You can only access your own data"))
                .when(authorizationService)
                .validateCurrentUser(100L);

        when(rideRepository.findById(1L))
                .thenReturn(Optional.of(testRide));

        assertThrows(
                ResourceOwnershipException.class,
                () -> rideService.getRide(1L)
        );

        verify(authorizationService, times(1))
                .validateCurrentUser(100L);
    }

    @Test
    void getCustomerRides_ShouldReject_WhenCustomerIsNotCurrentUser() {

        Long customerId = 888L;

        doThrow(new ResourceOwnershipException(
                "Access Denied: You can only access your own data"))
                .when(authorizationService)
                .validateCurrentUser(customerId);

        assertThrows(
                ResourceOwnershipException.class,
                () -> rideService.getCustomerRides(customerId)
        );

        verify(authorizationService, times(1))
                .validateCurrentUser(customerId);

        verify(rideRepository, never())
                .findByCustomerIdOrderByStartedAtDesc(customerId);
    }

    @Test
    void getRideHistory_ShouldReject_WhenHistoryBelongsToAnotherCustomer() {

        RideHistory history = new RideHistory();

        history.setRideId(1L);
        history.setBookingId(1L);
        history.setBikeId(10L);
        history.setCustomerId(100L);
        history.setStartedAt(LocalDateTime.now().minusHours(2));
        history.setEndedAt(LocalDateTime.now());
        history.setTotalDistance(5.0);
        history.setTotalDuration(7200L);

        when(rideHistoryRepository.findByRideId(1L))
                .thenReturn(Optional.of(history));

        doThrow(new ResourceOwnershipException(
                "Access Denied: You can only access your own data"))
                .when(authorizationService)
                .validateCurrentUser(100L);

        assertThrows(
                ResourceOwnershipException.class,
                () -> rideService.getRideHistory(1L)
        );

        verify(rideHistoryRepository, times(1))
                .findByRideId(1L);

        verify(authorizationService, times(1))
                .validateCurrentUser(100L);
    }

    @Test
    void startRide_ShouldCreateRide_WhenCustomerIsAuthorized() {

        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(testBooking));

        when(rideRepository.existsByCustomerIdAndStatus(
                100L,
                RideStatus.ACTIVE
        )).thenReturn(false);

        when(rideRepository.existsByBookingIdAndStatus(
                1L,
                RideStatus.ACTIVE
        )).thenReturn(false);

        when(rideRepository.save(any(Ride.class)))
                .thenAnswer(invocation -> {

                    Ride ride = invocation.getArgument(0);
                    ride.setId(1L);
                    return ride;
                });

        RideDTO result =
                rideService.startRide(1L, 10L, 100L);

        assertNotNull(result);
        assertEquals(1L, result.getBookingId());
        assertEquals(10L, result.getBikeId());
        assertEquals(100L, result.getCustomerId());
        assertEquals(RideStatus.ACTIVE, result.getStatus());

        verify(authorizationService, times(1))
                .validateCurrentUser(100L);

        verify(bookingRepository, times(1))
                .findById(1L);

        verify(rideRepository, times(1))
                .save(any(Ride.class));
    }
}