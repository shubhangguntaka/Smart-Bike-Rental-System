# Developer Guide: Security & Authorization Architecture

This document provides a reference for developers to integrate new modules (Bikes, Bookings, Payments, Reviews) into the "Smart Bike Rental System" backend while utilizing the shared security and authorization framework.

---

## 1. How JWT & Refresh Tokens Work

1. **Authentication (Login)**:
   - When a user posts credentials to `/api/auth/login`, `AuthServiceImpl` verifies the user's password.
   - An **Access Token (JWT)** is generated with a short expiration (typically 15-30 minutes), carrying claims (User ID, Email, Role).
   - A **Refresh Token** is generated, saved to the database, and returned to the client.
2. **Accessing Secured Routes**:
   - For every secured endpoint, the client must send the access token in the `Authorization` header: `Bearer <jwt_token>`.
   - `JwtFilter` intercepts the request, decodes and validates the signature of the token, and configures the `SecurityContextHolder` with user authentication details.
3. **Token Refreshing**:
   - When the Access Token expires (returning `401 Unauthorized`), the client calls POST `/api/auth/refresh-token` with the refresh token.
   - The server validates the token in the database, deletes the old token (or updates it), and issues a fresh Access Token.

---

## 2. Securing New Controllers

Every controller handling business resources should use request matchers in `SecurityConfig.java` and `@PreAuthorize` annotations at the class/method level.

### Route Patterns defined in `SecurityConfig.java`
- `/api/admin/**` (Strictly `ADMIN` only)
- `/api/owner/**` (Strictly `OWNER` only)
- `/api/customer/**` (Strictly `CUSTOMER` only)
- All general paths require authenticated users by default.

### Examples of Using Method-Level `@PreAuthorize`

#### Example: Admin-Only API
```java
@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {
    // Inherits ADMIN validation
}
```

#### Example: Mixed API (BikeController)
```java
@RestController
@RequestMapping("/api/bikes")
public class BikeController {

    // Public endpoint: open to everyone
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableBikes() { ... }

    // Customer endpoint
    @PostMapping("/{id}/book")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> bookBike(@PathVariable Long id) { ... }

    // Owner endpoint
    @PostMapping("/owner/register")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> registerBike(...) { ... }
}
```

---

## 3. Retrieving the Logged-in User

Avoid calling `SecurityContextHolder` directly inside your business logic. Instead, inject the **`CurrentUserService`**:

```java
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final CurrentUserService currentUserService;

    public void addReview(ReviewDTO dto) {
        User user = currentUserService.getCurrentUser();
        Long userId = currentUserService.getCurrentUserId();
        String userEmail = currentUserService.getCurrentUserEmail();
        
        // Use user details to save the review
    }
}
```

---

## 4. Resource Ownership & Permission Validation

To ensure users only manage their own data, inject **`AuthorizationService`** inside the **Service Layer** (not the controllers). This guarantees checks cannot be bypassed.

### Validation Methods Available:
- `validateCurrentUser(Long userId)`: Asserts the logged-in user is either an `ADMIN` or the matching `userId`. Throws `ResourceOwnershipException` if validation fails.
- `validateOwner(Long ownerId)`: Asserts the logged-in user is either an `ADMIN` or an `OWNER` matching `ownerId`. Throws `ResourceOwnershipException` if validation fails.
- `validateAdmin()`: Asserts the logged-in user has the `ADMIN` role.

### Service Ownership Validation Example (Booking Module)
```java
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final AuthorizationService authService;

    @Override
    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Validates that the logged-in user is the customer who made the booking, or an Admin
        authService.validateCurrentUser(booking.getCustomer().getId());

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
}
```

### Service Ownership Validation Example (Bike Module)
```java
@Service
@RequiredArgsConstructor
public class BikeServiceImpl implements BikeService {

    private final BikeRepository bikeRepository;
    private final AuthorizationService authService;

    @Override
    @Transactional
    public void deleteBike(Long bikeId) {
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> new ResourceNotFoundException("Bike not found"));

        // Validates that the logged-in user is the owner who registered this bike, or an Admin
        authService.validateOwner(bike.getOwner().getId());

        bikeRepository.delete(bike);
    }
}
```

---

## 5. Security Exceptions Handling

- **`ResourceOwnershipException`**: Throw this when a user attempts to operate on a resource they do not own. Returns `403 Forbidden` with:
  ```json
  {
    "success": false,
    "message": "Access Denied: You do not own this resource"
  }
  ```
- **`UnauthorizedOperationException`**: Throw when access credentials are missing or invalid. Returns `401 Unauthorized` with:
  ```json
  {
    "success": false,
    "message": "Unauthorized"
  }
  ```
