# Booking Module User & Operation Manual

This guide describes operating procedures, page layout configurations, and user step guidelines for the Booking module.

---

## 1. Customer User Journey

### Step 1.1: Browse and Select a Bike
1. Log in to your Customer portal.
2. Navigate to **Rent a Bike** catalog (`/customer/book-bike`).
3. Set your rental dates (Pickup Date and Return Date) in the date panel at the top.
4. Browse available bikes. Note that estimated totals are previewed inside each card.
5. Click **Book Now** on your selected bike.

```text
[ Screenshot Placeholder: Rent Bike Catalog & Date Picker Dashboard ]
```

---

### Step 1.2: Checkout Billing
1. If verified, you will be redirected to the **Payment Checkout** page (`/customer/payment/:bookingId`).
2. Choose your payment method (Credit Card or UPI).
3. Input your details (for testing cards, use mock inputs).
4. Click **Pay Now**.
5. Once confirmed, you will be navigated to your Invoice receipt.

```text
[ Screenshot Placeholder: Payment Checkout Form & Methods Selector ]
```

---

### Step 1.3: Accessing Handover QR Code
1. Open the receipt view (`/customer/bookings/:id`) or navigate to **My Bookings**.
2. Locate your active booking and click **View Details**.
3. Show the generated QR Code to the bike owner during pickup.

```text
[ Screenshot Placeholder: Booking Receipt invoice and ZXing QR Code box ]
```

---

## 2. Owner User Journey

### Step 2.1: Scanning Customer QR
1. Log in to your Owner portal.
2. Open the **QR Scanner** page (`/owner/scan-booking`).
3. Scan the customer's QR code or paste/simulate the reference string (e.g., `BOOKING-REF: BK-X`).
4. Review the fetched booking details (dates, status, customer ID).
5. Click **Confirm Handover & Start Ride** to activate the rental.

```text
[ Screenshot Placeholder: QR Scanner simulator and retrieved details panel ]
```

---

## 3. Ride Completion & History
1. Once the ride ends, the bike owner marks the status as **Completed** (via dashboard bookings).
2. The ride state transitions to `COMPLETED`. The customer can review it inside **Booking History** (`/customer/booking-history`).

```text
[ Screenshot Placeholder: Customer Booking History log showing status chips ]
```
