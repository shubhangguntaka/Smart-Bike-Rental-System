package com.sssit.bikerental.modules.owner.service.serviceimpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.enums.Role;
import com.sssit.bikerental.common.exception.ResourceOwnershipException;
import com.sssit.bikerental.common.exception.ResourceNotFoundException;
import com.sssit.bikerental.common.security.SecurityUtils;
import com.sssit.bikerental.modules.bike.entity.Bike;
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
import com.sssit.bikerental.modules.booking.enums.BookingStatus;
import com.sssit.bikerental.modules.booking.repository.BookingRepository;
import com.sssit.bikerental.modules.payment.entity.Payment;
import com.sssit.bikerental.modules.payment.entity.PaymentStatus;
import com.sssit.bikerental.modules.payment.repository.PaymentRepository;
import com.sssit.bikerental.modules.verification.aadhaar.repository.AadhaarRepository;
import com.sssit.bikerental.modules.verification.bikedocument.repository.BikeDocumentRepository;
import com.sssit.bikerental.modules.booking.dto.BookingResponse;
import com.sssit.bikerental.modules.booking.service.BookingService;
import com.sssit.bikerental.modules.notification.entity.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OwnerServiceImpl implements OwnerService {

    private final UserRepository userRepository;
    private final BikeRepository bikeRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final AadhaarRepository aadhaarRepository;
    private final BikeDocumentRepository bikeDocumentRepository;
    private final BookingService bookingService;
    private final NotificationService notificationService;

    @Override
    public OwnerDTO getOwnerProfile(Long ownerId) {
        User user = userRepository.findById(ownerId).orElse(null);

        if (user == null) {
            log.warn("Owner profile requested for non-existent userId: {}", ownerId);
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

        int totalBikes = (int) bikeRepository.countByOwnerId(ownerId);
        int totalBookings = (int) bookingRepository.countBookingsByOwnerId(ownerId);
        BigDecimal totalEarnings = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerId(ownerId,PaymentStatus.SUCCESS)).orElse(BigDecimal.ZERO);
        boolean verificationStatus = checkAadhaarVerified(ownerId);

        return OwnerMapper.toDTO(user, totalBikes, totalBookings, totalEarnings, verificationStatus);
    }

    @Override
    public OwnerDTO updateOwner(Long ownerId, OwnerDTO dto) {
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        if (dto.getOwnerName() != null && !dto.getOwnerName().trim().isEmpty()) {
            user.setFullName(dto.getOwnerName().trim());
        }
        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            user.setEmail(dto.getEmail().trim());
        }
        userRepository.save(user);

        int totalBikes = (int) bikeRepository.countByOwnerId(ownerId);
        int totalBookings = (int) bookingRepository.countBookingsByOwnerId(ownerId);
        BigDecimal totalEarnings = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerId(ownerId,PaymentStatus.SUCCESS)).orElse(BigDecimal.ZERO);
        boolean verificationStatus = checkAadhaarVerified(ownerId);

        return OwnerMapper.toDTO(user, totalBikes, totalBookings, totalEarnings, verificationStatus);
    }

    @Override
    public List<OwnerDTO> getAllOwners() {
        return userRepository.findByRole(Role.OWNER)
                .stream()
                .map(user -> {
                    Long ownerId = user.getId();
                    int totalBikes = (int) bikeRepository.countByOwnerId(ownerId);
                    int totalBookings = (int) bookingRepository.countBookingsByOwnerId(ownerId);
                    BigDecimal totalEarnings = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerId(ownerId,PaymentStatus.SUCCESS)).orElse(BigDecimal.ZERO);
                    boolean verificationStatus = checkAadhaarVerified(ownerId);

                    return OwnerMapper.toDTO(user, totalBikes, totalBookings, totalEarnings, verificationStatus);
                })
                .collect(Collectors.toList());
    }

    @Override
    public OwnerDashboardDTO getDashboard(Long ownerId) {
        String ownerName = userRepository.findById(ownerId)
                .map(User::getFullName)
                .orElse("Owner");

        boolean aadhaarVerified = checkAadhaarVerified(ownerId);
        boolean rcVerified = checkRcVerified(ownerId);

        int totalBikes = (int) bikeRepository.countByOwnerId(ownerId);
        int availableBikes = (int) bikeRepository.countByOwnerIdAndStatus(ownerId, "AVAILABLE");
        int bookedBikes = (int) bikeRepository.countByOwnerIdAndStatus(ownerId, "BOOKED");

        int pendingBookings = (int) bookingRepository.countBookingsByOwnerIdAndStatus(ownerId, "PENDING");
        int completedBookings = (int) bookingRepository.countBookingsByOwnerIdAndStatus(ownerId, "COMPLETED");
        int totalBookings = (int) bookingRepository.countBookingsByOwnerId(ownerId);

        BigDecimal totalEarnings = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerId(ownerId,PaymentStatus.SUCCESS)).orElse(BigDecimal.ZERO);
        
        LocalDateTime todayStart = java.time.LocalDate.now().atStartOfDay();
        BigDecimal todayEarnings = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId,PaymentStatus.SUCCESS, todayStart)).orElse(BigDecimal.ZERO);
        BigDecimal weeklyEarnings = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId,PaymentStatus.SUCCESS, LocalDateTime.now().minusWeeks(1))).orElse(BigDecimal.ZERO);
        BigDecimal monthlyEarnings = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId,PaymentStatus.SUCCESS, LocalDateTime.now().minusMonths(1))).orElse(BigDecimal.ZERO);

        BigDecimal pendingPayments = Optional.ofNullable(bookingRepository.sumPendingRentalAmountByOwnerId(ownerId)).orElse(BigDecimal.ZERO);

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
        BigDecimal total = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerId(ownerId, PaymentStatus.SUCCESS)).orElse(BigDecimal.ZERO);
        LocalDateTime todayStart = java.time.LocalDate.now().atStartOfDay();
        BigDecimal today = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId,PaymentStatus.SUCCESS, todayStart)).orElse(BigDecimal.ZERO);
        BigDecimal weekly = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId,PaymentStatus.SUCCESS, LocalDateTime.now().minusWeeks(1))).orElse(BigDecimal.ZERO);
        BigDecimal monthly = Optional.ofNullable(paymentRepository.sumCompletedEarningsByOwnerIdAndPaymentDateAfter(ownerId,PaymentStatus.SUCCESS, LocalDateTime.now().minusMonths(1))).orElse(BigDecimal.ZERO);
        BigDecimal pendingPayments = Optional.ofNullable(bookingRepository.sumPendingRentalAmountByOwnerId(ownerId)).orElse(BigDecimal.ZERO);

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
        return checkAadhaarVerified(ownerId);
    }

    @Override
    public List<BookingRequestDTO> getBookingRequests(Long ownerId) {
        List<Booking> bookings = bookingRepository.findAllBookingsByOwnerId(ownerId);
        if (bookings == null) {
            return List.of();
        }

        return bookings.stream()
                .filter(bk -> bk != null)
                .map(bk -> {
                    String customerName = "Unknown Customer";
                    String customerEmail = "";
                    String customerPhone = "";
                    
                    if (bk.getCustomerId() != null) {
                        User customer = userRepository.findById(bk.getCustomerId()).orElse(null);
                        if (customer != null) {
                            customerName = customer.getFullName();
                            customerEmail = customer.getEmail();
                            customerPhone = customer.getPhoneNumber();
                        }
                    }

                    String bikeName = "Unknown Bike";
                    if (bk.getBikeId() != null) {
                        bikeName = bikeRepository.findById(bk.getBikeId())
                                .map(Bike::getBikeName)
                                .orElse("Unknown Bike");
                    }

                    LocalDateTime updateDt = bk.getUpdatedAt() != null ? bk.getUpdatedAt() : bk.getCreatedAt();
                    LocalDateTime createDt = bk.getCreatedAt() != null ? bk.getCreatedAt() : bk.getStartTime();

                    return BookingRequestDTO.builder()
                            .bookingId(bk.getId())
                            .customerName(customerName)
                            .customerEmail(customerEmail)
                            .customerPhone(customerPhone)
                            .bikeName(bikeName)
                            .pickupDate(bk.getStartTime() != null ? bk.getStartTime().toString() : "")
                            .returnDate(bk.getReturnTime() != null ? bk.getReturnTime().toString() : "")
                            .rentalAmount(bk.getRentalAmount())
                            .bookingStatus(bk.getStatus())
                            .updatedAt(updateDt != null ? updateDt.toString() : "")
                            .createdAt(createDt != null ? createDt.toString() : "")
                            .build();
                })
                .sorted((b1, b2) -> {
                    String dt1 = b1.getCreatedAt() != null && !b1.getCreatedAt().isEmpty() ? b1.getCreatedAt() : b1.getPickupDate();
                    String dt2 = b2.getCreatedAt() != null && !b2.getCreatedAt().isEmpty() ? b2.getCreatedAt() : b2.getPickupDate();
                    return (dt2 != null ? dt2 : "").compareTo(dt1 != null ? dt1 : "");
                })
                .collect(Collectors.toList());
    }

    private void validateBookingOwnerPermission(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        Bike bike = bikeRepository.findById(booking.getBikeId())
                .orElseThrow(() -> new ResourceNotFoundException("Bike not found with ID: " + booking.getBikeId()));
        
        User currentOwner = SecurityUtils.getCurrentUser();
        if (currentOwner != null && currentOwner.getRole() != Role.ADMIN && !bike.getOwnerId().equals(currentOwner.getId())) {
            throw new ResourceOwnershipException("You do not have permission to manage this booking");
        }
    }

  @Transactional
  @Override
  public void approveBooking(Long bookingId) {
      validateBookingOwnerPermission(bookingId);

      // Confirm booking: validates PENDING status, checks customer verification, sets payment to SUCCESS, sets status to CONFIRMED, generates QR code, updates bike status to BOOKED, and saves transactionally.
      BookingResponse response = bookingService.confirmBooking(bookingId);

      // Notify customer that the owner approved the booking
      try {
          if (response != null && response.getCustomerId() != null) {
              notificationService.bookingApproved(response.getCustomerId());
          }
      } catch (Exception e) {
          log.error(
                  "Failed to send booking approval notification for bookingId: {}",
                  bookingId,
                  e
          );
      }
  }

    @Transactional
@Override
public void rejectBooking(Long bookingId) {
    validateBookingOwnerPermission(bookingId);

    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Booking not found with ID: " + bookingId));

    if (booking.getBookingStatus() != BookingStatus.PENDING) {
        throw new IllegalStateException(
                "Only PENDING bookings can be rejected.");
    }

    booking.setBookingStatus(BookingStatus.REJECTED);
    bookingRepository.save(booking);

    // Notify customer that the owner rejected the booking
    try {
        if (booking.getCustomerId() != null) {
            notificationService.bookingRejected(booking.getCustomerId());
        }
    } catch (Exception e) {
        log.error(
                "Failed to send booking rejection notification for bookingId: {}",
                bookingId,
                e
        );
    }
}

    @Override
    public List<com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO> getOwnerPayments(Long ownerId, String status) {
        List<Payment> payments;
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
            try {
                PaymentStatus paymentStatus = PaymentStatus.valueOf(status.trim().toUpperCase());
                payments = paymentRepository.findPaymentsByOwnerIdAndStatus(ownerId, paymentStatus);
            } catch (IllegalArgumentException e) {
                payments = paymentRepository.findAllPaymentsByOwnerId(ownerId);
            }
        } else {
            payments = paymentRepository.findAllPaymentsByOwnerId(ownerId);
        }

        if (payments == null) {
            return List.of();
        }

        return payments.stream()
                .map(this::toOwnerPaymentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO getOwnerPaymentById(Long ownerId, Long paymentId) {
        Payment payment = paymentRepository.findPaymentByOwnerIdAndPaymentId(ownerId, paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found or you do not have permission to view payment ID: " + paymentId));

        return toOwnerPaymentDTO(payment);
    }

    @Override
    public com.sssit.bikerental.modules.owner.dto.OwnerEarningsSummaryDTO getOwnerEarningsSummary(Long ownerId) {
        List<Payment> allPayments = paymentRepository.findAllPaymentsByOwnerId(ownerId);
        if (allPayments == null) {
            allPayments = List.of();
        }

        BigDecimal totalEarnings = BigDecimal.ZERO;
        BigDecimal totalCustomerPaid = BigDecimal.ZERO;
        BigDecimal totalPlatformFees = BigDecimal.ZERO;
        BigDecimal totalRentalAmount = BigDecimal.ZERO;
        BigDecimal totalLateCharges = BigDecimal.ZERO;
        long totalSuccessful = 0;
        long totalPending = 0;

        for (Payment p : allPayments) {
            if (p.getPaymentStatus() == PaymentStatus.SUCCESS) {
                totalSuccessful++;
                BigDecimal base = p.getBaseRentalAmount() != null ? p.getBaseRentalAmount() : BigDecimal.ZERO;
                BigDecimal late = p.getLateCharge() != null ? p.getLateCharge() : BigDecimal.ZERO;
                BigDecimal platform = p.getPlatformFeeAmount() != null ? p.getPlatformFeeAmount() : BigDecimal.ZERO;
                BigDecimal finalAmt = p.getFinalAmount() != null ? p.getFinalAmount() : base.add(late).add(platform);

                totalRentalAmount = totalRentalAmount.add(base);
                totalLateCharges = totalLateCharges.add(late);
                totalPlatformFees = totalPlatformFees.add(platform);
                totalCustomerPaid = totalCustomerPaid.add(finalAmt);
                // Authoritative owner net earnings is base rental amount + late charge
                totalEarnings = totalEarnings.add(base.add(late));
            } else if (p.getPaymentStatus() == PaymentStatus.PENDING || p.getPaymentStatus() == PaymentStatus.READY_FOR_PAYMENT || p.getPaymentStatus() == PaymentStatus.PROCESSING) {
                totalPending++;
            }
        }

        return com.sssit.bikerental.modules.owner.dto.OwnerEarningsSummaryDTO.builder()
                .totalEarnings(totalEarnings)
                .totalCustomerPaid(totalCustomerPaid)
                .totalPlatformFees(totalPlatformFees)
                .totalRentalAmount(totalRentalAmount)
                .totalLateCharges(totalLateCharges)
                .totalSuccessfulPayments(totalSuccessful)
                .totalPendingPayments(totalPending)
                .build();
    }

    private com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO toOwnerPaymentDTO(Payment p) {
        String customerName = "Unknown Customer";
        String customerEmail = "";
        String customerPhone = "";
        if (p.getCustomerId() != null) {
            User customer = userRepository.findById(p.getCustomerId()).orElse(null);
            if (customer != null) {
                customerName = customer.getFullName();
                customerEmail = customer.getEmail();
                customerPhone = customer.getPhoneNumber();
            }
        }

        Long bikeId = null;
        String bikeName = "Unknown Bike";
        String bikeModel = "";
        String bikeReg = "";
        LocalDateTime rentalStart = null;
        LocalDateTime scheduledReturn = null;
        LocalDateTime actualPickup = null;
        LocalDateTime actualReturn = null;
        long durationDays = 1;

        if (p.getBookingId() != null) {
            Booking bk = bookingRepository.findById(p.getBookingId()).orElse(null);
            if (bk != null) {
                bikeId = bk.getBikeId();
                rentalStart = bk.getStartTime();
                scheduledReturn = bk.getReturnTime();
                actualPickup = bk.getActualPickupTime();
                actualReturn = bk.getActualReturnTime();

                if (rentalStart != null && scheduledReturn != null) {
                    long hours = java.time.Duration.between(rentalStart, scheduledReturn).toHours();
                    durationDays = Math.max(1, (long) Math.ceil(hours / 24.0));
                }

                if (bikeId != null) {
                    Bike bike = bikeRepository.findById(bikeId).orElse(null);
                    if (bike != null) {
                        bikeName = bike.getBikeName();
                        bikeModel = bike.getModel();
                        bikeReg = bike.getRegistrationNumber();
                    }
                }
            }
        }

        BigDecimal base = p.getBaseRentalAmount() != null ? p.getBaseRentalAmount() : BigDecimal.ZERO;
        BigDecimal late = p.getLateCharge() != null ? p.getLateCharge() : BigDecimal.ZERO;
        BigDecimal eligible = p.getEligibleTransactionAmount() != null ? p.getEligibleTransactionAmount() : base.add(late);
        BigDecimal platformPercent = p.getPlatformFeePercent() != null ? p.getPlatformFeePercent() : BigDecimal.ZERO;
        BigDecimal platformAmount = p.getPlatformFeeAmount() != null ? p.getPlatformFeeAmount() : BigDecimal.ZERO;
        BigDecimal tax = p.getTaxAmount() != null ? p.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal finalAmt = p.getFinalAmount() != null ? p.getFinalAmount() : eligible.add(platformAmount).add(tax);
        BigDecimal ownerEarnings = p.getOwnerShareAmount() != null ? p.getOwnerShareAmount() : base.add(late);
        BigDecimal adminShare = p.getAdminShareAmount() != null ? p.getAdminShareAmount() : platformAmount.add(tax);

        return com.sssit.bikerental.modules.owner.dto.OwnerPaymentDTO.builder()
                .paymentId(p.getPaymentId())
                .bookingId(p.getBookingId())
                .customerId(p.getCustomerId())
                .invoiceNumber(p.getInvoiceNumber() != null ? p.getInvoiceNumber() : String.format("INV-%d-%d", p.getBookingId(), p.getPaymentId()))
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .bikeId(bikeId)
                .bikeName(bikeName)
                .bikeModel(bikeModel)
                .bikeRegistrationNumber(bikeReg)
                .rentalStart(rentalStart)
                .scheduledReturn(scheduledReturn)
                .actualPickup(actualPickup)
                .actualReturn(actualReturn)
                .rentalDurationDays(durationDays)
                .baseRentalAmount(base)
                .lateCharge(late)
                .eligibleTransactionAmount(eligible)
                .platformFeePercent(platformPercent)
                .platformFeeAmount(platformAmount)
                .taxAmount(tax)
                .finalAmount(finalAmt)
                .ownerEarnings(ownerEarnings)
                .adminShareAmount(adminShare)
                .ownerBankName(p.getOwnerBankName())
                .ownerAccountNumber(p.getOwnerAccountNumber())
                .ownerIfscCode(p.getOwnerIfscCode())
                .ownerUpiId(p.getOwnerUpiId())
                .payoutUtr(p.getOwnerPayoutUtr())
                .payoutStatus(p.getPayoutStatus() != null ? p.getPayoutStatus() : "SETTLED")
                .payoutSettledAt(p.getPayoutSettledAt() != null ? p.getPayoutSettledAt() : p.getPaidAt())
                .paymentStatus(p.getPaymentStatus())
                .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod() : "Razorpay Online")
                .transactionId(p.getTransactionId())
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .paidAt(p.getPaidAt() != null ? p.getPaidAt() : p.getPaymentDate())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private boolean checkAadhaarVerified(Long ownerId) {
        try {
            return aadhaarRepository.findFirstByCustomerIdAndStatusOrderByVerifiedAtDesc(ownerId, "APPROVED").isPresent();
        } catch (Exception e) {
            log.warn("Aadhaar verification check error for ownerId {}: {}", ownerId, e.getMessage());
            return false;
        }
    }

    private boolean checkRcVerified(Long ownerId) {
        try {
            return bikeDocumentRepository.findByOwnerId(ownerId).stream()
                    .anyMatch(doc -> "APPROVED".equals(doc.getStatus()));
        } catch (Exception e) {
            log.warn("RC verification check error for ownerId {}: {}", ownerId, e.getMessage());
            return false;
        }
    }
}
