package com.sssit.bikerental.modules.user.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.exception.ConflictException;
import com.sssit.bikerental.modules.auth.repository.OtpRepository;
import com.sssit.bikerental.modules.auth.repository.RefreshTokenRepository;
import com.sssit.bikerental.modules.auth.service.EmailService;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.gps.entity.RideStatus;
import com.sssit.bikerental.modules.gps.repository.RideRepository;
import com.sssit.bikerental.modules.notification.entity.NotificationRepository;
import com.sssit.bikerental.modules.payment.repository.BankAccountRepository;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.user.service.impl.UserServiceImpl;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.admin.repository.DocumentReviewRepository;
import com.sssit.bikerental.modules.verification.bikedocument.repository.BikeDocumentRepository;
import com.sssit.bikerental.modules.verification.drivinglicense.repository.DrivingLicenseRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RideRepository rideRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private BankAccountRepository bankAccountRepository;

    @Mock
    private AadhaarRepository aadhaarRepository;

    @Mock
    private DrivingLicenseRepository drivingLicenseRepository;

    @Mock
    private BikeDocumentRepository bikeDocumentRepository;

    @Mock
    private DocumentReviewRepository documentReviewRepository;

    @Mock
    private BikeRepository bikeRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserServiceImpl userService;

    private User customerUser;
    private User ownerUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        customerUser = User.builder()
                .firstName("Customer")
                .lastName("Rider")
                .email("customer@example.com")
                .phoneNumber("9876543210")
                .password("encoded_pass")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();
        customerUser.setId(10L);

        ownerUser = User.builder()
                .firstName("Owner")
                .lastName("Host")
                .email("owner@example.com")
                .phoneNumber("9876543211")
                .password("encoded_pass")
                .role(Role.OWNER)
                .enabled(true)
                .build();
        ownerUser.setId(20L);

        adminUser = User.builder()
                .firstName("Admin")
                .lastName("Super")
                .email("admin@example.com")
                .phoneNumber("9876543212")
                .password("encoded_pass")
                .role(Role.ADMIN)
                .enabled(true)
                .build();
        adminUser.setId(30L);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext(String email) {
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(email, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("deleteCurrentAccount - Customer successfully deletes account when no active bookings/rides exist")
    void testDeleteCurrentAccount_CustomerSuccess() {
        mockSecurityContext(customerUser.getEmail());
        when(userRepository.findByEmail(customerUser.getEmail())).thenReturn(Optional.of(customerUser));
        when(bookingRepository.findByCustomerId(customerUser.getId())).thenReturn(List.of(
                Booking.builder().bookingStatus(BookingStatus.COMPLETED).build()
        ));
        when(rideRepository.existsByCustomerIdAndStatus(customerUser.getId(), RideStatus.ACTIVE)).thenReturn(false);
        when(rideRepository.existsByCustomerIdAndStatus(customerUser.getId(), RideStatus.PAUSED)).thenReturn(false);

        assertDoesNotThrow(() -> userService.deleteCurrentAccount());

        verify(refreshTokenRepository, times(1)).deleteByUser(customerUser);
        verify(otpRepository, times(1)).deleteByUser(customerUser);
        verify(userRepository, times(1)).delete(customerUser);
        verify(emailService, times(1)).sendAccountDeletedEmail(customerUser.getEmail(), customerUser.getFullName());
    }

    @Test
    @DisplayName("deleteCurrentAccount - Owner successfully deletes account when no active bookings/rides exist")
    void testDeleteCurrentAccount_OwnerSuccess() {
        mockSecurityContext(ownerUser.getEmail());
        when(userRepository.findByEmail(ownerUser.getEmail())).thenReturn(Optional.of(ownerUser));
        when(bookingRepository.findAllBookingsByOwnerId(ownerUser.getId())).thenReturn(List.of(
                Booking.builder().bookingStatus(BookingStatus.COMPLETED).build()
        ));
        when(bikeRepository.findByOwnerId(ownerUser.getId())).thenReturn(List.of());

        assertDoesNotThrow(() -> userService.deleteCurrentAccount());

        verify(refreshTokenRepository, times(1)).deleteByUser(ownerUser);
        verify(otpRepository, times(1)).deleteByUser(ownerUser);
        verify(userRepository, times(1)).delete(ownerUser);
        verify(emailService, times(1)).sendAccountDeletedEmail(ownerUser.getEmail(), ownerUser.getFullName());
    }

    @Test
    @DisplayName("deleteCurrentAccount - Admin is rejected with AccessDeniedException")
    void testDeleteCurrentAccount_AdminRejected() {
        mockSecurityContext(adminUser.getEmail());
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));

        assertThrows(AccessDeniedException.class, () -> userService.deleteCurrentAccount());

        verify(userRepository, never()).delete(any());
        verify(refreshTokenRepository, never()).deleteByUser(any());
    }

    @Test
    @DisplayName("deleteCurrentAccount - Customer with active booking is rejected with ConflictException")
    void testDeleteCurrentAccount_CustomerActiveBookingRejected() {
        mockSecurityContext(customerUser.getEmail());
        when(userRepository.findByEmail(customerUser.getEmail())).thenReturn(Optional.of(customerUser));
        when(bookingRepository.findByCustomerId(customerUser.getId())).thenReturn(List.of(
                Booking.builder().bookingStatus(BookingStatus.CONFIRMED).build()
        ));

        assertThrows(ConflictException.class, () -> userService.deleteCurrentAccount());

        verify(userRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteCurrentAccount - Customer with active ride is rejected with ConflictException")
    void testDeleteCurrentAccount_CustomerActiveRideRejected() {
        mockSecurityContext(customerUser.getEmail());
        when(userRepository.findByEmail(customerUser.getEmail())).thenReturn(Optional.of(customerUser));
        when(bookingRepository.findByCustomerId(customerUser.getId())).thenReturn(List.of());
        when(rideRepository.existsByCustomerIdAndStatus(customerUser.getId(), RideStatus.ACTIVE)).thenReturn(true);

        assertThrows(ConflictException.class, () -> userService.deleteCurrentAccount());

        verify(userRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteCurrentAccount - Owner with active booking on bike is rejected with ConflictException")
    void testDeleteCurrentAccount_OwnerActiveBookingRejected() {
        mockSecurityContext(ownerUser.getEmail());
        when(userRepository.findByEmail(ownerUser.getEmail())).thenReturn(Optional.of(ownerUser));
        when(bookingRepository.findAllBookingsByOwnerId(ownerUser.getId())).thenReturn(List.of(
                Booking.builder().bookingStatus(BookingStatus.ACTIVE).build()
        ));

        assertThrows(ConflictException.class, () -> userService.deleteCurrentAccount());

        verify(userRepository, never()).delete(any());
    }
}
