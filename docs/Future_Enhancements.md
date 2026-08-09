# Future Enhancements Roadmap

This document outlines architectural recommendations to build on the existing Booking module of the Bike Rental system.

---

## 1. Live GPS Ride Tracking
*   **Context**: Active tracking is currently simulated using placeholders.
*   **Enhancement**: 
    - Integrate a live GPS tracking module inside `RideTracking.tsx` using **Mapbox GL JS** or **Leaflet**.
    - Expose a WebSocket client connection endpoint using **Spring WebSockets / STOMP** to pull live latitude and longitude shifts from the moving vehicle.

---

## 2. Dynamic Pricing Engine
*   **Context**: Rentals currently use static daily pricing rates.
*   **Enhancement**:
    - Implement a demand-based dynamic pricing algorithm.
    - Factors to evaluate: high-demand hours, holiday weekends, and local weather forecasts.
    - Calculate multipliers dynamically inside `BookingCalculator.java`.

---

## 3. Maintenance Prediction & Blockades
*   **Context**: Bike status must be manually set to `UNDER_MAINTENANCE` by owners or admins.
*   **Enhancement**:
    - Build automated maintenance warning triggers.
    - Check total rental days and cumulative mileage.
    - Auto-transition bike status to `MAINTENANCE` once mileage thresholds are crossed, preventing bookings until resolved.

---

## 4. Offline QR Handover Validation
*   **Context**: Scanner requires an active internet connection to query the DB and confirm handover.
*   **Enhancement**:
    - Encode cryptographic booking payload signatures (using **HMAC-SHA256**) directly inside the QR code data.
    - Renter's identity can be verified by the owner's app offline by decoding and validating signatures using shared secret keys.
