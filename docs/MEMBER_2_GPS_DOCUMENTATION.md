# Member-2 (Gnaneshwar) Task: GPS & Live Ride Tracking Module Documentation

## 1. Architecture Overview

The Member-2 GPS & Live Ride Tracking module provides end-to-end real-time location telemetry for the Smart Bike Rental System.

```
+-----------------------------------------------------------------------------------+
|                                CUSTOMER CLIENT                                    |
|   navigator.geolocation.watchPosition() -> useGPS -> useRideTracking               |
|   Live Leaflet Map (MapContainer, GPSMarker, RouteMap)                            |
+------------------------------------------+----------------------------------------+
                                           | POST /api/rides/{rideId}/location (every ~5s)
                                           v
+-----------------------------------------------------------------------------------+
|                                SPRING BOOT BACKEND                                |
|   RideController -> RideService / GPSService -> AuthorizationService              |
|   - Flexible ISO-8601 LocalDateTime Deserializer (UTC & Offset safe)             |
|   - Haversine Distance Engine                                                     |
|   - State Transitions: NOT_STARTED -> ACTIVE <-> PAUSED -> COMPLETED              |
+------------------------------------------+----------------------------------------+
                                           | JPA / Hibernate / MySQL
                                           v
+-----------------------------------------------------------------------------------+
|                                  DATABASE                                         |
|   - rides (id, booking_id, bike_id, customer_id, status, started_at, ended_at,...) |
|   - gps_locations (id, ride_id, latitude, longitude, timestamp, accuracy)         |
|   - ride_history (id, ride_id, booking_id, bike_id, customer_id, distance,...)    |
+------------------------------------------+----------------------------------------+
                                           | GET /api/rides/{rideId}/location (polled 4s)
                                           v
+-----------------------------------------------------------------------------------+
|                                  OWNER CLIENT                                     |
|   Owner Bookings -> [ Track My Bike ] -> /owner/track-bike/:rideId               |
|   - Leaflet Map with real-time customer/bike marker                               |
|   - Dynamic travelled polyline route                                              |
|   - Speed, distance covered, elapsed duration, accuracy telemetry                 |
|   - In-App Notifications on pause, resume, and return completion                  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Ride Lifecycle & State Machine

```
[ CONFIRMED Booking ]
        |
        | Owner scans Pickup QR Code (handover)
        v
    [ ACTIVE ] <-----------------+
        |                        |
        | Customer pauses        | Customer resumes
        v                        |
    [ PAUSED ] ------------------+
        |
        | Owner scans Return QR Code
        v
   [ COMPLETED ] -> Final distance & duration calculated, RideHistory stored
```

---

## 3. Customer GPS Flow

1. **Activation**: When owner scans handover QR, booking becomes `ACTIVE` and an active `Ride` is created.
2. **Location Streaming**: Customer's browser uses `watchPosition()` to stream GPS telemetry with coordinates, timestamp, and accuracy.
3. **Session Recovery**: On browser reload/refresh:
   - `useRideTracking` queries `GET /api/rides/customer?customerId=...` or `GET /api/rides/booking/{bookingId}`.
   - Restores existing ride state, loads historical checkpoints, displays the route, and resumes streaming if `ACTIVE`.
4. **Pause/Resume Control**: Customer can pause and resume broadcast at will; owner is notified in real time.
5. **Return & Stop**: To complete the ride, customer presents their Booking QR code to the owner for return scan verification.

---

## 4. Owner Track My Bike Flow

1. **Access**: Owner opens `/owner/bookings` and clicks **[ Track My Bike ]** on any active booking.
2. **Navigation**: Routes to `/owner/track-bike/:rideId`.
3. **Telemetry Polling**:
   - Fetches ride details from `GET /api/rides/{rideId}`.
   - Fetches coordinates history from `GET /api/rides/{rideId}/location` every 4 seconds.
   - Calculates distance covered via `GET /api/rides/{rideId}/distance`.
4. **Visual Rendering**:
   - If no GPS points exist yet: Displays `"Waiting for customer GPS location..."` banner without crashing.
   - As points arrive: Places `GPSMarker` at latest coordinate, auto-recenters view, and extends the `RouteMap` Polyline.
   - When customer pauses: Shows amber `PAUSED` indicator.
   - When completed: Halts polling and renders `RideSummaryCard`.

---

## 5. GPS REST APIs
|---------------------------------------------------------------------------------------------------------------------|
| Method  | Endpoint                          | Access                  | Description                                 |
|---------|-----------------------------------|-------------------------|---------------------------------------------|
| `POST`  | `/api/rides/start`                | Customer                | Starts a ride session for confirmed booking |
| `GET`   | `/api/rides/{rideId}`             | Customer, Owner, Admin  | Retrieves ride details by ID                |
| `GET`   | `/api/rides/booking/{bookingId}`  | Customer, Owner,Admin   | Retrieves ride by booking ID                |
| `POST`  | `/api/rides/{rideId}/location`    | Customer                | Persists a single GPS checkpoint            |
| `GET`   | `/api/rides/{rideId}/location`    | Customer, Owner, Admin  | Retrieves all GPS checkpoints for a ride    |
| `POST`  | `/api/rides/{rideId}/pause`       | Customer                | Pauses live tracking & notifies owner       |
| `POST`  | `/api/rides/{rideId}/resume`      | Customer                | Resumes live tracking & notifies owner      |
| `POST`  | `/api/rides/{rideId}/end`         | Customer                | Manually completes a ride session           |
| `GET`   | `/api/rides/customer?customerId={id}` | Customer, Admin     | Retrieves customer's ride history           |
| `GET`   | `/api/rides/{rideId}/distance`    | Customer, Owner, Admin  | Computes total distance via Haversine       |
| `GET`   | `/api/rides/{rideId}/history`     | Customer, Owner, Admin  | Retrieves finalized ride history summary    |

---

## 6. Distance & Duration Calculation

### Haversine Formula (GPSServiceImpl)
$$\Delta\sigma = 2 \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
$$d = R \cdot \Delta\sigma$$
*(Where $R = 6371\text{ km}$)*

Distance is computed sequentially between consecutive chronological GPS checkpoints where coordinates differ.

### Duration
Computed from `Duration.between(startedAt, endedAt).getSeconds()`.

---

## 7. Security & Authorization

- **Spring Security & JWT**: Standard Bearer token authentication on all endpoints.
- **Resource Ownership**:
  - `validateCurrentUser(customerId)` ensures customers can only write to and manipulate their own rides.
  - `validateRideAccess(ride)` allows only authorized parties (the customer who booked, the bike owner, or administrators) to read telemetry.
- `@PreAuthorize` annotations strictly guard all Controller methods.

---

## 8. How to Test Locally

1. **Backend**:
   ```bash
   cd bike-rental-backend
   .\mvnw.cmd test
   ```
2. **Frontend**:
   ```bash
   cd bike-rental-frontend
   npm run build
   ```
3. **Manual Simulation**:
   - Log in as Customer (`customer@example.com` / `Customer@123`).
   - Book a bike and have owner approve/confirm.
   - Show QR code on Customer Booking page -> Owner scans pickup QR.
   - Start GPS location on Customer side -> Open Owner **[ Track My Bike ]** in another tab to observe real-time marker and polyline movement.
