package com.sssit.bikerental.modules.owner.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.exception.ResourceOwnershipException;
import com.sssit.bikerental.modules.booking.exception.VerificationRequiredException;
import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.enums.PaymentStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.booking.service.BookingService;
import com.sssit.bikerental.modules.booking.service.QRCodeService;
import com.sssit.bikerental.modules.booking.service.impl.BookingServiceImpl;
import com.sssit.bikerental.modules.booking.util.BookingCalculator;
import com.sssit.bikerental.modules.booking.validation.BookingValidator;
import com.sssit.bikerental.modules.notification.entity.NotificationService;
import com.sssit.bikerental.modules.owner.service.serviceimpl.OwnerServiceImpl;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.aadhaar.service.AadhaarService;
import com.sssit.bikerental.modules.verification.bikedocument.repository.BikeDocumentRepository;
import com.sssit.bikerental.modules.verification.drivinglicense.entity.DrivingLicense;
import com.sssit.bikerental.modules.verification.drivinglicense.service.DrivingLicenseService;

@ExtendWith(MockitoExtension.class)
class OwnerApprovalBookingLifecycleTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private BikeRepository bikeRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private AadhaarRepository aadhaarRepository;
    @Mock
    private BikeDocumentRepository bikeDocumentRepository;
    @Mock
    private BookingService bookingService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OwnerServiceImpl ownerService;

    private Bike testBike;
    private Booking testPendingBooking;
    private User testOwner;
    private User testCustomer;

    @BeforeEach
    void setUp() {
        testOwner = User.builder()
                .firstName("Suresh")
                .lastName("Owner")
                .email("suresh@example.com")
                .role(Role.OWNER)
                .build();
        testOwner.setId(200L);

        testCustomer = User.builder()
                .firstName("Rahul")
                .lastName("Customer")
                .email("rahul@example.com")
                .role(Role.CUSTOMER)
                .build();
        testCustomer.setId(100L);

        testBike = Bike.builder()
                .bikeId(10L)
                .ownerId(200L)
                .bikeName("Royal Enfield Classic 350")
                .registrationNumber("TS09AB1234")
                .rentalPrice(new BigDecimal("1000.00"))
                .bikeStatus(BikeStatus.AVAILABLE)
                .build();

        testPendingBooking = Booking.builder()
                .bikeId(10L)
                .customerId(100L)
                .startTime(LocalDateTime.now().plusDays(1))
                .returnTime(LocalDateTime.now().plusDays(3))
                .rentalAmount(new BigDecimal("2000.00"))
                .bookingStatus(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .qrCode(null)
                .build();
        testPendingBooking.setId(1L);
    }

    @Test
    void testApproveBooking_Success_ConfirmsBooking_AndSendsNotification() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUser).thenReturn(testOwner);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(200L);
            security.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testPendingBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));

            BookingResponse confirmedResponse = BookingResponse.builder()
                    .bookingId(1L)
                    .customerId(100L)
                    .bikeId(10L)
                    .bookingStatus(BookingStatus.CONFIRMED)
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .qrCode("data:image/png;base64,GENERATED_QR_CODE")
                    .build();

            when(bookingService.confirmBooking(1L)).thenReturn(confirmedResponse);

            ownerService.approveBooking(1L);

            verify(bookingService, times(1)).confirmBooking(1L);
            verify(notificationService, times(1)).bookingApproved(100L);
        }
    }

    @Test
    void testApproveBooking_UnverifiedCustomer_ThrowsVerificationRequiredException() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUser).thenReturn(testOwner);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(200L);
            security.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testPendingBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));

            when(bookingService.confirmBooking(1L))
                    .thenThrow(new VerificationRequiredException("Customer must be verified before confirming booking."));

            VerificationRequiredException ex = assertThrows(VerificationRequiredException.class, () -> {
                ownerService.approveBooking(1L);
            });

            assertEquals("Customer must be verified before confirming booking.", ex.getMessage());
            verify(notificationService, never()).bookingApproved(anyLong());
        }
    }

    @Test
    void testApproveBooking_UnauthorizedOwner_ThrowsResourceOwnershipException() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            User otherOwner = User.builder()
                    .role(Role.OWNER)
                    .build();
            otherOwner.setId(999L);

            security.when(SecurityUtils::getCurrentUser).thenReturn(otherOwner);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(999L);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testPendingBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));

            assertThrows(ResourceOwnershipException.class, () -> {
                ownerService.approveBooking(1L);
            });

            verify(bookingService, never()).confirmBooking(anyLong());
            verify(notificationService, never()).bookingApproved(anyLong());
        }
    }
}
