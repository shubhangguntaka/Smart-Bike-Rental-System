# Smart Bike Rental — Owner Mobile Application (`bike-rental-owner-app`)

Production-ready mobile application built for Bike Owners / Partners in the Smart Bike Rental System.

---

## Technical Stack

* **Core**: React Native 0.86, React 19, Expo SDK 57, TypeScript
* **Navigation**: React Navigation (Native Stack + Floating Bottom Tabs)
* **Styling**: NativeWind (Tailwind CSS) & Sage Garden Theme System matching `bike-rental-frontend/index.css`
* **Server State**: TanStack React Query v5 (automatic query invalidation on mutations)
* **Client State**: Zustand v5 (Auth role enforcement, Notifications)
* **API Client**: Axios with JWT Bearer Interceptors & Auto Refresh Token Queue
* **Hardware & Native**: Expo Camera (QR barcode scanning), Expo Location, React Native Maps (GPS Tracking), Expo Image Picker, Expo Document Picker, Expo Secure Store, Expo Notifications

---

## Application Structure

```text
bike-rental-owner-app/
├── App.tsx                              # App root, ThemeProvider, QueryClientProvider, Font loader
├── app.json                             # Expo app configuration (com.bikerental.owner)
├── tailwind.config.js                   # Sage Garden tokens & NativeWind preset
├── global.css                           # Light & Dark theme custom CSS variables
├── src/
│   ├── api/                             # Axios client & Backend API endpoints
│   │   ├── authApi.ts                   # Auth & OTP endpoints
│   │   ├── ownerApi.ts                  # /api/owner endpoints (Dashboard, Earnings, Bookings, Bank)
│   │   ├── bikeOwnerApi.ts              # /api/bikes endpoints (Fleet CRUD, RC checks)
│   │   ├── bookingOwnerApi.ts           # /api/bookings endpoints (Handover, Return, QR Scan, Live Tracking)
│   │   ├── paymentOwnerApi.ts           # /api/payments endpoints
│   │   ├── gpsOwnerApi.ts               # /api/rides GPS location & distance calculation
│   │   ├── verificationOwnerApi.ts      # Aadhaar & RC OCR validation endpoints
│   │   ├── reviewOwnerApi.ts            # Fleet reviews & ratings
│   │   └── notificationApi.ts           # Push notifications & unread counts
│   ├── components/
│   │   ├── common/                      # AppText, AppCard, AppButton, AppInput, AppHeader, AppBadge, AppModal, AppLoader, AppEmptyState, AppErrorState, ErrorBoundary
│   │   ├── navigation/                  # FloatingTabBar (5 Owner tabs), OwnerHeader (Avatar, KYC badge, Bell, Theme switch)
│   │   ├── cards/                       # BikeOwnerCard, BookingRequestCard, RentalCard, EarningStatCard, PaymentCard, ReviewCard
│   │   └── forms/                       # ImageUploader, DocumentUploader
│   ├── config/                          # env.ts (Dynamic host IP, Android emulator, iOS/Web baseURL)
│   ├── context/                         # ThemeContext (Light/Dark/System), TabBarAnimationContext
│   ├── hooks/                           # React Query hooks (useOwnerDashboard, useOwnerBikes, useOwnerBookings, useOwnerEarnings, useOwnerReviews, useOwnerNotifications, useCollapsibleTabBar)
│   ├── navigation/                      # RootNavigator, AuthNavigator, OwnerTabNavigator, OwnerMainNavigator
│   ├── screens/
│   │   ├── auth/                        # SplashScreen, LoginScreen, RegisterScreen, OtpVerificationScreen, ForgotPasswordScreen, ResetPasswordScreen
│   │   ├── dashboard/                   # OwnerDashboardScreen (Real KPIs, Quick Actions, Pending Requests, Active Rentals)
│   │   ├── bikes/                       # MyBikesScreen, AddBikeScreen, EditBikeScreen, BikeDetailsScreen
│   │   ├── bookings/                    # BookingRequestsScreen, BookingDetailsScreen, CurrentRentalsScreen, QRScannerScreen
│   │   ├── tracking/                    # TrackBikeScreen (React Native Maps, Polyline, Live Telemetry)
│   │   ├── earnings/                    # EarningsScreen, TransactionHistoryScreen, PaymentDetailsScreen
│   │   ├── reviews/                     # ReviewsScreen (Rating summary & customer feedback)
│   │   ├── notifications/               # NotificationsScreen (Filter unread, mark read, delete)
│   │   ├── profile/                     # ProfileScreen, EditProfileScreen, BankAccountScreen
│   │   ├── verification/                # VerificationScreen, DocumentsScreen (Aadhaar & RC verification)
│   │   └── settings/                    # SettingsScreen (Theme, notifications, cache, signout)
│   ├── services/                        # Token, ThemeStorage, and Domain Services
│   ├── store/                           # Zustand Auth & Notification stores with OWNER role enforcement
│   ├── theme/                           # Semantic tokens, typography, spacing, radius, shadows, dark mode
│   ├── types/                           # TypeScript DTOs matching backend models
│   └── utils/                           # Formatters (currency, date, time, masking) & helpers
```

---

## Running the Application

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Type check
npx tsc --noEmit
```
