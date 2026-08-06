package com.sssit.bikerental.modules.owner.service.serviceimpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.exception.ResourceNotFoundException;
import com.sssit.bikerental.modules.owner.dto.OwnerDTO;
import com.sssit.bikerental.modules.owner.dto.OwnerDashboardDTO;
import com.sssit.bikerental.modules.owner.dto.BookingRequestDTO;
import com.sssit.bikerental.modules.owner.dto.EarningsDTO;
import com.sssit.bikerental.modules.owner.mapper.OwnerMapper;
import com.sssit.bikerental.modules.owner.service.OwnerService;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.bike.repository.BikeRepository;
import com.sssit.bikerental.modules.booking.entity.Booking;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.bikedocument.repository.BikeDocumentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OwnerServiceImpl implements OwnerService {

    private final UserRepository userRepository;
    private final BikeRepository bikeRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final AadhaarRepository aadhaarRepository;
    private final BikeDocumentRepository bikeDocumentRepository;

    @Override
    public OwnerDTO getOwnerProfile(Long ownerId) {
        User user = null;
        try {
            user = userRepository.findById(ownerId).orElse(null);
        } catch (Exception e) {
            // Safe fallback if user table does not exist or has issues
        }

        if (user == null) {
            return OwnerDTO.builder()
                    .ownerId(ownerId)
                    .ownerName("Unknown Owner")
                    .email("")
                    .totalBikes(0)
                    .totalBookings(0)
                    .totalEarnings(BigDecimal.ZERO)
                    .verificationStatus(false)
                    .build();
        }

        int totalBikes = 0;
        try {
            totalBikes = (int) bikeRepository.countByOwnerId(ownerId);
        } catch (Exception e) {}

        int totalBookings = 0;
        try {
            totalBookings = (int) bookingRepository.countBookingsByOwnerId(ownerId);
        } catch (Exception e) {}

        BigDecimal totalEarnings = BigDecimal.ZERO;
        try {
            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerId(ownerId);
            if (res != null) {
                totalEarnings = res;
            }
        } catch (Exception e) {}

        boolean verificationStatus = false;
        try {
            verificationStatus = checkAadhaarVerified(ownerId);
        } catch (Exception e) {}

        return OwnerMapper.toDTO(user, totalBikes, totalBookings, totalEarnings, verificationStatus);
    }

    @Override
    public OwnerDTO updateOwner(Long ownerId, OwnerDTO dto) {
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        user.setFullName(dto.getOwnerName());
        user.setEmail(dto.getEmail());
        userRepository.save(user);

        int totalBikes = 0;
        try {
            totalBikes = (int) bikeRepository.countByOwnerId(ownerId);
        } catch (Exception e) {}

        int totalBookings = 0;
        try {
            totalBookings = (int) bookingRepository.countBookingsByOwnerId(ownerId);
        } catch (Exception e) {}

        BigDecimal totalEarnings = BigDecimal.ZERO;
        try {
            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerId(ownerId);
            if (res != null) {
                totalEarnings = res;
            }
        } catch (Exception e) {}

        boolean verificationStatus = false;
        try {
            verificationStatus = checkAadhaarVerified(ownerId);
        } catch (Exception e) {}

        return OwnerMapper.toDTO(user, totalBikes, totalBookings, totalEarnings, verificationStatus);
    }

    @Override
    public List<OwnerDTO> getAllOwners() {
        try {
            return userRepository.findByRole(com.sssit.bikerental.common.enums.Role.OWNER)
                    .stream()
                    .map(user -> {
                        Long ownerId = user.getId();
                        int totalBikes = 0;
                        try {
                            totalBikes = (int) bikeRepository.countByOwnerId(ownerId);
                        } catch (Exception e) {}

                        int totalBookings = 0;
                        try {
                            totalBookings = (int) bookingRepository.countBookingsByOwnerId(ownerId);
                        } catch (Exception e) {}

                        BigDecimal totalEarnings = BigDecimal.ZERO;
                        try {
                            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerId(ownerId);
                            if (res != null) {
                                totalEarnings = res;
                            }
                        } catch (Exception e) {}

                        boolean verificationStatus = false;
                        try {
                            verificationStatus = checkAadhaarVerified(ownerId);
                        } catch (Exception e) {}

                        return OwnerMapper.toDTO(user, totalBikes, totalBookings, totalEarnings, verificationStatus);
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public OwnerDashboardDTO getDashboard(Long ownerId) {
        String ownerName = "Unknown Owner";
        try {
            User user = userRepository.findById(ownerId).orElse(null);
            if (user != null) {
                ownerName = user.getFullName();
            }
        } catch (Exception e) {}

        boolean aadhaarVerified = false;
        try {
            aadhaarVerified = checkAadhaarVerified(ownerId);
        } catch (Exception e) {}

        boolean rcVerified = false;
        try {
            rcVerified = checkRcVerified(ownerId);
        } catch (Exception e) {}

        int totalBikes = 0;
        try {
            totalBikes = (int) bikeRepository.countByOwnerId(ownerId);
        } catch (Exception e) {}

        int availableBikes = 0;
        try {
            availableBikes = (int) bikeRepository.countByOwnerIdAndStatus(ownerId, "AVAILABLE");
        } catch (Exception e) {}

        int bookedBikes = 0;
        try {
            bookedBikes = (int) bikeRepository.countByOwnerIdAndStatus(ownerId, "BOOKED");
        } catch (Exception e) {}

        int pendingBookings = 0;
        try {
            pendingBookings = (int) bookingRepository.countBookingsByOwnerIdAndStatus(ownerId, "PENDING");
        } catch (Exception e) {}

        int completedBookings = 0;
        try {
            completedBookings = (int) bookingRepository.countBookingsByOwnerIdAndStatus(ownerId, "COMPLETED");
        } catch (Exception e) {}

        int totalBookings = 0;
        try {
            totalBookings = (int) bookingRepository.countBookingsByOwnerId(ownerId);
        } catch (Exception e) {}

        BigDecimal totalEarnings = BigDecimal.ZERO;
        try {
            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerId(ownerId);
            if (res != null) {
                totalEarnings = res;
            }
        } catch (Exception e) {}

        BigDecimal todayEarnings = BigDecimal.ZERO;
        try {
            LocalDateTime todayStart = java.time.LocalDate.now().atStartOfDay();
            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId, todayStart);
            if (res != null) {
                todayEarnings = res;
            }
        } catch (Exception e) {}

        BigDecimal weeklyEarnings = BigDecimal.ZERO;
        try {
            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId, LocalDateTime.now().minusWeeks(1));
            if (res != null) {
                weeklyEarnings = res;
            }
        } catch (Exception e) {}

        BigDecimal monthlyEarnings = BigDecimal.ZERO;
        try {
            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId, LocalDateTime.now().minusMonths(1));
            if (res != null) {
                monthlyEarnings = res;
            }
        } catch (Exception e) {}

        BigDecimal pendingPayments = BigDecimal.ZERO;
        try {
            BigDecimal res = bookingRepository.sumPendingRentalAmountByOwnerId(ownerId);
            if (res != null) {
                pendingPayments = res;
            }
        } catch (Exception e) {}

        return OwnerDashboardDTO.builder()
                .ownerId(ownerId)
                .ownerName(ownerName)
                .totalBikes(totalBikes)
                .availableBikes(availableBikes)
                .bookedBikes(bookedBikes)
                .pendingBookings(pendingBookings)
                .completedBookings(completedBookings)
                .totalBookings(totalBookings)
                .totalEarnings(totalEarnings)
                .todayEarnings(todayEarnings)
                .weeklyEarnings(weeklyEarnings)
                .monthlyEarnings(monthlyEarnings)
                .pendingPayments(pendingPayments)
                .aadhaarVerified(aadhaarVerified)
                .rcVerified(rcVerified)
                .build();
    }

    @Override
    public EarningsDTO getOwnerEarnings(Long ownerId) {
        BigDecimal total = BigDecimal.ZERO;
        try {
            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerId(ownerId);
            if (res != null) {
                total = res;
            }
        } catch (Exception e) {}

        BigDecimal today = BigDecimal.ZERO;
        try {
            LocalDateTime todayStart = java.time.LocalDate.now().atStartOfDay();
            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId, todayStart);
            if (res != null) {
                today = res;
            }
        } catch (Exception e) {}

        BigDecimal weekly = BigDecimal.ZERO;
        try {
            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId, LocalDateTime.now().minusWeeks(1));
            if (res != null) {
                weekly = res;
            }
        } catch (Exception e) {}

        BigDecimal monthly = BigDecimal.ZERO;
        try {
            BigDecimal res = paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId, LocalDateTime.now().minusMonths(1));
            if (res != null) {
                monthly = res;
            }
        } catch (Exception e) {}

        BigDecimal pendingPayments = BigDecimal.ZERO;
        try {
            BigDecimal res = bookingRepository.sumPendingRentalAmountByOwnerId(ownerId);
            if (res != null) {
                pendingPayments = res;
            }
        } catch (Exception e) {}

        return EarningsDTO.builder()
                .total(total)
                .today(today)
                .weekly(weekly)
                .monthly(monthly)
                .pendingPayments(pendingPayments)
                .build();
    }

    @Override
    public Boolean getVerificationStatus(Long ownerId) {
        try {
            return checkAadhaarVerified(ownerId);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<BookingRequestDTO> getBookingRequests(Long ownerId) {
        try {
            List<Booking> bookings = bookingRepository.findAllBookingsByOwnerId(ownerId);
            if (bookings == null) {
                return List.of();
            }
            return bookings.stream()
                    .map(bk -> {
                        String customerName = "Unknown Customer";
                        String customerEmail = "";
                        String customerPhone = "";
                        try {
                            User customer = userRepository.findById(bk.getCustomerId()).orElse(null);
                            if (customer != null) {
                                customerName = customer.getFullName();
                                customerEmail = customer.getEmail();
                                customerPhone = customer.getPhoneNumber();
                            }
                        } catch (Exception e) {}

                        String bikeName = "Unknown Bike";
                        try {
                            bikeName = bikeRepository.findById(bk.getBikeId())
                                    .map(b -> b.getName())
                                    .orElse("Unknown Bike");
                        } catch (Exception e) {}

                        return BookingRequestDTO.builder()
                                .bookingId(bk.getId())
                                .customerName(customerName)
                                .customerEmail(customerEmail)
                                .customerPhone(customerPhone)
                                .bikeName(bikeName)
                                .pickupDate(bk.getPickupDate() != null ? bk.getPickupDate().toLocalDate().toString() : "")
                                .returnDate(bk.getReturnDate() != null ? bk.getReturnDate().toLocalDate().toString() : "")
                                .rentalAmount(bk.getRentalAmount())
                                .bookingStatus(bk.getStatus())
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }

    @Transactional
    @Override
    public void approveBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        booking.setStatus("APPROVED");
        bookingRepository.save(booking);
    }

    @Transactional
    @Override
    public void rejectBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        booking.setStatus("REJECTED");
        bookingRepository.save(booking);
    }

    private boolean checkAadhaarVerified(Long ownerId) {
        try {
            return aadhaarRepository.findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(ownerId, "APPROVED").isPresent();
        } catch (Exception e) {
            return false;
        }
    }

    private boolean checkRcVerified(Long ownerId) {
        try {
            return bikeDocumentRepository.findByOwnerId(ownerId).stream()
                    .anyMatch(doc -> "APPROVED".equals(doc.getStatus()));
        } catch (Exception e) {
            return false;
        }
    }
}
