# Smart Bike Rental — Customer Mobile Application

An enterprise-grade, full-featured **React Native / Expo** mobile application for the **Smart Bike Rental System**. Built to offer seamless bike discovery, instant reservations, digital QR keyless check-in, real-time GPS telemetry tracking, automated Razorpay billing, and Aadhaar/Driving License KYC verification.

Designed with full visual parity to the web platform's curated **Sage Garden** design system, featuring seamless Light Mode, Dark Mode, and System Sync.

---

## Key Features

### 1. Fleet Discovery & Bike Specs
- **Live Catalog & Categories**: Browse Cruiser, Sports, Electric, Commuter, and Adventure bikes with real-time availability badges.
- **Search & Filter**: Filter by brand, engine capacity (CC), price range, and location.
- **Detailed Specifications**: Power, top speed, mileage, seat height, fuel capacity, and operating shift hours.
- **Map Fleet View**: Interactive map pinning nearby available bikes around rental hubs.

### 2. Instant Reservation & Digital Passes
- **Dynamic Booking Calculator**: Hourly and multi-day booking scheduling with real-time price estimation.
- **Digital QR Keyless Pass**: Instant QR code generation upon reservation confirmation for fast host handover and pickup.
- **Reservation Lifecycle Management**: Track booking status (`CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`) with cancellation reasons and audit history.

### 3. Live GPS Ride Telemetry & Tracking
- **Real-Time Ride Monitoring**: Track live GPS routes on interactive maps with real-time speed (km/h), elapsed time, and server-calculated distance (km).
- **Ride Controls**: Pause, Resume, and Complete ride sessions with live telemetry sync to backend APIs.
- **Ride History**: Complete log of all past trips with route maps, durations, and timestamps.

### 4. Seamless Checkout & Tax Invoices
- **Automated Bill Generation**: Base fares, late return surcharges, platform fees, and GST taxes calculated directly by backend services.
- **Razorpay Payment Gateway**: Integrated checkout with payment signature verification.
- **Tax Invoices**: Formal printable/shareable invoices (`PAID IN FULL`) with GSTIN, customer details, and itemized breakdown.

### 5. Identity & KYC Verification
- **Aadhaar & Driving License OCR**: Upload and auto-verify documents for instant rental approval.
- **Real-time Status Tracking**: Instant visual badges indicating verification state across the app.

### 6. Sage Garden Design System & Theme Engine
- **Full Parity with Web Theme**:
  - **Light Mode**: Warm natural parchment canvas (`#FBFBF9`), elevated card surfaces (`#FFFFFF`), muted borders (`#E8E6E1`), forest sage primary (`#2E3D32`).
  - **Dark Mode**: Deep low-light canvas (`#141416`), dark card surfaces (`#1E1E22`), subtle borders (`#36363A`), high-contrast text (`#F4F4F5` / `#A1A1AA`), sage highlights (`#7C9082`).
- **Dynamic Theme Mode Switching**: Switch instantly between Light, Dark, and System Sync via Preferences.
- **Custom Typography**: Handcrafted typography pairing Google Font **Antic** for headings/body and **JetBrains Mono** for pricing and numerical metrics.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native (0.86.3) with Expo (SDK ~57) |
| **Language** | TypeScript (Strict Mode) |
| **Navigation** | React Navigation 7 (Native Stack, Bottom Tabs) |
| **Styling** | NativeWind / TailwindCSS + Semantic CSS Variables |
| **State Management** | Zustand (Auth, Notifications, Settings) |
| **Networking** | Axios with Auth Interceptors & Token Service |
| **Maps & Location** | `react-native-maps`, `expo-location` |
| **Media & Docs** | `expo-image-picker`, `expo-document-picker` |
| **Icons & Visuals** | `lucide-react-native`, `expo-font` |
| **Security** | `expo-secure-store` |

---

## Directory Structure

```text
bike-rental-customer-app/
├── assets/                  # App icons, splash screens, and static images
├── src/
│   ├── api/                 # Axios clients and API route modules
│   │   ├── axios.ts         # Base axios instance with JWT interceptors
│   │   ├── authApi.ts       # Login, register, OTP, password reset
│   │   ├── bikeApi.ts       # Bike catalog, filtering, and specs
│   │   ├── bookingApi.ts    # Reservations, receipts, cancellations
│   │   ├── paymentApi.ts    # Razorpay orders, payments, invoices
│   │   └── notificationApi.ts
│   ├── components/          # Reusable UI components
│   │   ├── cards/           # BikeCard, BookingCard, PaymentCard, ReviewCard, NotificationCard
│   │   ├── common/          # AppText, AppButton, AppHeader, AppInput, AppModal, AppScreen, AppBadge
│   │   ├── forms/           # CancelBookingModal, ReviewForm
│   │   └── payment/         # RazorpayCheckoutModal
│   ├── config/              # App environment configuration & defaults
│   ├── context/             # ThemeContext (light / dark / system)
│   ├── hooks/               # useCollapsibleTabBar, useTabScrollToTop
│   ├── navigation/          # RootNavigator, AuthNavigator, MainNavigator (Bottom Tabs)
│   ├── screens/             # Application screens
│   │   ├── auth/            # Login, Register, ForgotPassword, OtpVerification, ResetPassword
│   │   ├── bikes/           # ExploreBikesScreen, BikeDetailsScreen
│   │   ├── booking/         # BookingsScreen, BookingScreen, BookingDetailsScreen, BookingQRCodeScreen
│   │   ├── home/            # HomeScreen
│   │   ├── maps/            # MapExploreScreen, LiveTrackingScreen, RideHistoryScreen
│   │   ├── notifications/   # NotificationsScreen
│   │   ├── payment/         # PaymentScreen, PaymentHistoryScreen, InvoiceScreen, PaymentSuccessScreen, PaymentFailedScreen
│   │   ├── profile/         # ProfileScreen, EditProfileScreen, ChangePasswordScreen
│   │   ├── reviews/         # ReviewsScreen
│   │   ├── settings/        # SettingsScreen (Theme, Defaults, Preferences)
│   │   └── verification/    # VerificationScreen (KYC Aadhaar & DL)
│   ├── services/            # Business services & async wrappers
│   ├── store/               # Zustand state stores (auth, notifications)
│   ├── theme/               # Semantic color tokens, darkColors, and typographies
│   └── types/               # TypeScript interfaces & DTO definitions
├── App.tsx                  # Root application entry point
├── global.css               # NativeWind semantic CSS root & dark theme variables
├── tailwind.config.js       # Tailwind configuration mapped to Sage Garden theme
└── tsconfig.json            # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Expo Go** app on your physical device or an Android Emulator / iOS Simulator.
- **Backend API Server** running (Spring Boot backend on port `8080`).

### Installation

1. Navigate to the customer app directory:
   ```bash
   cd bike-rental-customer-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in `bike-rental-customer-app/`:
   ```env
   EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8080/api
   EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TU4lU75r4fP9AF
   ```
   > **Note:** For Android Emulator, you can use `http://10.0.2.2:8080/api`. For physical devices on the same Wi-Fi, use your machine's local IP address (e.g. `http://192.168.1.50:8080/api`).

4. Start the Expo development server:
   ```bash
   npm start
   ```

5. Run on your platform:
   - **Android**: Press `a` or run `npm run android`
   - **iOS**: Press `i` or run `npm run ios`
   - **Web**: Press `w` or run `npm run web`

---

## Type Checking & Quality Assurance

Run TypeScript type verification:
```bash
npx tsc --noEmit
```
*(Clean compilation with 0 errors)*

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
