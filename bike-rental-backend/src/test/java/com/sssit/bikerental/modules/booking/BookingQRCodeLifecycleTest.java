package com.sssit.bikerental.modules.booking;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
import org.springframework.security.access.AccessDeniedException;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.bike.entity.Bike;
import com.sssit.bikerental.modules.bike.enums.BikeStatus;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.enums.PaymentStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.booking.service.QRCodeService;
import com.sssit.bikerental.modules.booking.service.impl.BookingServiceImpl;
import com.sssit.bikerental.modules.booking.util.BookingCalculator;
import com.sssit.bikerental.modules.booking.validation.BookingValidator;
import com.sssit.bikerental.modules.notification.entity.Notification;
import com.sssit.bikerental.modules.notification.entity.NotificationService;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.verification.aadhaar.entity.AadhaarVerification;
import com.sssit.bikerental.modules.verification.aadhaar.service.AadhaarService;
import com.sssit.bikerental.modules.verification.drivinglicense.entity.DrivingLicense;
import com.sssit.bikerental.modules.verification.drivinglicense.service.DrivingLicenseService;

@ExtendWith(MockitoExtension.class)
class BookingQRCodeLifecycleTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BikeRepository bikeRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BookingValidator bookingValidator;
    @Mock
    private BookingCalculator bookingCalculator;
    @Mock
    private AadhaarService aadhaarService;
    @Mock
    private DrivingLicenseService drivingLicenseService;
    @Mock
    private QRCodeService qrCodeService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Bike testBike;
    private Booking testBooking;
    private User testCustomer;
    private User testOwner;

    @BeforeEach
    void setUp() {
        testBike = Bike.builder()
                .bikeId(10L)
                .ownerId(200L)
                .bikeName("Honda Activa")
                .registrationNumber("TS09AB1234")
                .rentalPrice(new BigDecimal("500.00"))
                .bikeStatus(BikeStatus.BOOKED)
                .build();

        testBooking = Booking.builder()
                .bikeId(10L)
                .customerId(100L)
                .startTime(LocalDateTime.now().minusHours(2))
                .returnTime(LocalDateTime.now().plusHours(2))
                .rentalAmount(new BigDecimal("500.00"))
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.SUCCESS)
                .qrCode("data:image/png;base64,TEST_QR_TOKEN_BK_1")
                .build();
        testBooking.setId(1L);

        testCustomer = User.builder()
                .firstName("Rahul")
                .lastName("Sharma")
                .email("rahul@example.com")
                .build();
        testCustomer.setId(100L);

        testOwner = User.builder()
                .firstName("Suresh")
                .lastName("Owner")
                .email("suresh@example.com")
                .build();
        testOwner.setId(200L);
    }

    @Test
    void testConfirmBooking_GeneratesQROnce() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(200L);
            security.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            Booking unconfirmed = Booking.builder()
                    .bikeId(10L)
                    .customerId(100L)
                    .startTime(LocalDateTime.now())
                    .returnTime(LocalDateTime.now().plusHours(3))
                    .rentalAmount(new BigDecimal("500.00"))
                    .bookingStatus(BookingStatus.PENDING)
                    .paymentStatus(PaymentStatus.PENDING)
                    .qrCode(null)
                    .build();
            unconfirmed.setId(2L);

            when(bookingRepository.findById(2L)).thenReturn(Optional.of(unconfirmed));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
            when(aadhaarService.getApprovedAadhaar(100L, "USER")).thenReturn(new AadhaarVerification());
            when(drivingLicenseService.getApprovedLicense(100L)).thenReturn(new DrivingLicense());
            when(qrCodeService.generateQRCode(anyString(), anyInt(), anyInt())).thenReturn("data:image/png;base64,GENERATED_QR");
            when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

            BookingResponse res = bookingService.confirmBooking(2L);

            assertNotNull(res);
            assertEquals(BookingStatus.CONFIRMED, res.getBookingStatus());
            assertEquals(PaymentStatus.SUCCESS, res.getPaymentStatus());
            assertEquals("data:image/png;base64,GENERATED_QR", res.getQrCode());
            verify(qrCodeService, times(1)).generateQRCode(anyString(), eq(250), eq(250));
        }
    }

    @Test
    void testOwnerScansQR_FirstScan_ConfirmedBooking() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(200L);
            security.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
            when(userRepository.findById(100L)).thenReturn(Optional.of(testCustomer));
            when(userRepository.findById(200L)).thenReturn(Optional.of(testOwner));

            BookingResponse res = bookingService.scanQRCode("BOOKING-REF: BK-1");

            assertNotNull(res);
            assertEquals(1L, res.getBookingId());
            assertEquals("Rahul Sharma", res.getCustomerName());
            assertEquals("Honda Activa", res.getBikeName());
            assertEquals("TS09AB1234", res.getRegistrationNumber());
            assertEquals(BookingStatus.CONFIRMED, res.getBookingStatus());
            assertEquals(PaymentStatus.SUCCESS, res.getPaymentStatus());
        }
    }

    @Test
    void testHandover_ChangesStatusToActive_AndSavesActualPickupTime_PreservesQR() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(200L);
            security.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(bookingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
            when(userRepository.findById(100L)).thenReturn(Optional.of(testCustomer));
            when(userRepository.findById(200L)).thenReturn(Optional.of(testOwner));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

            String originalQr = testBooking.getQrCode();

            BookingResponse res = bookingService.handoverBooking(1L);

            assertEquals(BookingStatus.ACTIVE, res.getBookingStatus());
            assertNotNull(res.getActualPickupTime());
            assertEquals(originalQr, res.getQrCode()); // QR code remains identical
            verify(qrCodeService, never()).generateQRCode(anyString(), anyInt(), anyInt());
        }
    }

    @Test
    void testOwnerScansQR_SecondScan_ActiveBooking() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(200L);
            security.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            testBooking.setBookingStatus(BookingStatus.ACTIVE);
            testBooking.setActualPickupTime(LocalDateTime.now().minusHours(1));

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
            when(userRepository.findById(100L)).thenReturn(Optional.of(testCustomer));
            when(userRepository.findById(200L)).thenReturn(Optional.of(testOwner));

            BookingResponse res = bookingService.scanQRCode("BOOKING-REF: BK-1");

            assertNotNull(res);
            assertEquals(BookingStatus.ACTIVE, res.getBookingStatus());
            assertNotNull(res.getActualPickupTime());
            assertNull(res.getActualReturnTime());
        }
    }

    @Test
    void testReturnBooking_ChangesStatusToCompleted_SavesReturnTime_FreesBike_SendsNotifications() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(200L);
            security.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            testBooking.setBookingStatus(BookingStatus.ACTIVE);
            testBooking.setActualPickupTime(LocalDateTime.now().minusHours(2));

            when(bookingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));
            when(userRepository.findById(100L)).thenReturn(Optional.of(testCustomer));
            when(userRepository.findById(200L)).thenReturn(Optional.of(testOwner));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

            BookingResponse res = bookingService.returnBooking(1L);

            assertEquals(BookingStatus.COMPLETED, res.getBookingStatus());
            assertNotNull(res.getActualReturnTime());
            assertEquals(BikeStatus.AVAILABLE, testBike.getBikeStatus());
            verify(bikeRepository, times(1)).save(testBike);

            // Verify notifications sent to owner and customer
            verify(notificationService, times(2)).sendNotification(any(Notification.class));
        }
    }

    @Test
    void testUnauthorizedOwner_ScanQRCode_RejectsAccess() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            // Other owner (userId 999) scanning bike owned by userId 200
            security.when(SecurityUtils::getCurrentUserId).thenReturn(999L);
            security.when(SecurityUtils::getCurrentRole).thenReturn(Role.OWNER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));

            AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
                bookingService.scanQRCode("BOOKING-REF: BK-1");
            });

            assertEquals("You are not authorized to manage this bike.", ex.getMessage());
        }
    }

    @Test
    void testUnauthorizedCustomer_GetBooking_RejectsAccess() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            // Other customer (userId 888) viewing booking of customer 100
            security.when(SecurityUtils::getCurrentUserId).thenReturn(888L);
            security.when(SecurityUtils::getCurrentRole).thenReturn(Role.CUSTOMER);

            when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
            when(bikeRepository.findById(10L)).thenReturn(Optional.of(testBike));

            AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
                bookingService.getBooking(1L);
            });

            assertEquals("You are not authorized to view this booking.", ex.getMessage());
        }
    }
}
