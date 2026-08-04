# Developer Guide: Securing Future Modules in Smart Bike Rental System

This document outlines the security architecture for the backend application and guides developers on securing future business modules (Bikes, Bookings, Payments, Reviews).

---

## 1. Request Matching in SecurityConfig

All HTTP routes should match standard patterns. Secure your request paths at the filter-chain level in [SecurityConfig.java](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-backend/src/main/java/com/sssit/bikerental/security/SecurityConfig.java):

- `/api/admin/**` (Restricted to `ADMIN`)
- `/api/owner/**` (Restricted to `OWNER`)
- `/api/customer/**` (Restricted to `CUSTOMER`)
- All other endpoints default to requiring authentication via `.anyRequest().authenticated()`.

---

## 2. Controller-Level Method Security (@PreAuthorize)

Protect controller classes or individual endpoint methods using Spring Security annotations:

### Example: Admin-Only Controller
```java
@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController { ... }
```

### Example: Mixed Access in BikeController
```java
@RestController
@RequestMapping("/api/bikes")
public class BikeController {

    // Public API
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableBikes() { ... }

    // Customer API
    @PostMapping("/{id}/book")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> bookBike(@PathVariable Long id) { ... }

    // Admin-only approval
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveBike(@PathVariable Long id) { ... }
}
```

---

## 3. Service-Layer Ownership Validation

Ownership and resource authorization checks should always be performed in the **Service Layer** rather than the Controller layer to prevent logic bypasses.

We provide a central [SecurityService](file:///e:/CMRM/SSSIT/Project/javaproject1/bike-rental-backend/src/main/java/com/sssit/bikerental/security/service/SecurityService.java) that handles common authorization assertions. Inject this service to validate actions:

### Example: Booking Ownership check
```java
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final SecurityService securityService;

    @Override
    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Validate that either the user owns the booking OR is an admin
        securityService.validateCurrentUser(booking.getCustomer().getId());

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
}
```

### Example: Bike Ownership check for Owner Role
```java
@Service
@RequiredArgsConstructor
public class BikeServiceImpl implements BikeService {

    private final BikeRepository bikeRepository;
    private final SecurityService securityService;

    @Override
    @Transactional
    public void updateBike(Long bikeId, BikeDTO bikeDTO) {
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> new ResourceNotFoundException("Bike not found"));

        // Validate that either the user is the owner of the bike OR is an admin
        securityService.validateOwner(bike.getOwner().getId());

        bike.setModel(bikeDTO.getModel());
        bikeRepository.save(bike);
    }
}
```

---

## 4. Reusable Exceptions

- Use `ResourceOwnershipException` when a user attempts to view or edit a resource belonging to someone else.
- Use `UnauthorizedOperationException` when an operation is invalid for the user's current session state.
- These will automatically return standard `403 Forbidden` response bodies with `"success": false` formatted by the `GlobalExceptionHandler`.
