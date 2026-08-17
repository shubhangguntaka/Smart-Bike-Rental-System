# 🚲 Bike Rental System – Frontend

A modern, scalable frontend for the **Smart Bike Rental System** built using **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

# 📖 Project Overview

The Smart Bike Rental System is a full-stack web application that enables bike owners to rent out their bikes while allowing customers to easily discover, book, and track bikes online.

The frontend is responsible for delivering a responsive, secure, and user-friendly experience for all user roles.

---

# 👥 User Roles

* 👤 Customer
* 🏍️ Bike Owner
* 🛡️ Admin

---

# 🛠️ Tech Stack

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React 19         | Frontend Library        |
| TypeScript       | Type Safety             |
| Vite             | Build Tool              |
| Tailwind CSS v4  | Styling                 |
| React Router     | Routing                 |
| Redux Toolkit    | State Management        |
| Axios            | API Communication       |
| React Query      | Server State Management |
| React Hook Form  | Form Handling           |
| Yup              | Form Validation         |
| React Hot Toast  | Notifications           |
| Framer Motion    | Animations              |
| Day.js           | Date Handling           |
| React Icons      | Icons                   |
| Google Maps API  | Maps Integration        |
| Socket.IO Client | Real-time Updates       |

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone <repository-url>
```

---

## 2. Navigate to Frontend

```bash
cd bike-rental-frontend
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Frontend Environment Setup

### 4.1 Copy Example Configuration

Create a local environment file from the template:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

### 4.2 Required Environment Variables

| Variable | Description | Required | Default / Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend Spring Boot API base URL | Yes | `http://localhost:8888/api` |
| `VITE_APP_NAME` | Application display title | No | `Bike Rental System` |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional Google Maps API browser key | No | `your_google_maps_api_key` |
| `VITE_RAZORPAY_KEY_ID` | Optional Razorpay client key | No | `rzp_test_...` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Optional Cloudinary cloud name | No | `your_cloud_name` |

> ⚠️ **Security Reminder:** Never commit `.env` or `.env.*.local` files containing real API credentials to Git. Environment changes require restarting the Vite development server (`npm run dev`).

---

## 5. Run Development Server

```bash
npm run dev
```

---

## 6. Build Project

```bash
npm run build
```

---

## 7. Preview Production Build

```bash
npm run preview
```

---

# 📂 Folder Structure

```
bike-rental-frontend/
│
├── public/
│
├── src/
│
│   ├── api/
│   │
│   ├── assets/
│   │   ├── css/
│   │   ├── fonts/
│   │   ├── icons/
│   │   ├── images/
│   │   └── videos/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── auth/
│   │   ├── bike/
│   │   ├── booking/
│   │   ├── payment/
│   │   ├── map/
│   │   ├── verification/
│   │   ├── notification/
│   │   ├── review/
│   │   ├── owner/
│   │   └── admin/
│   │
│   ├── config/
│   │
│   ├── constants/
│   │
│   ├── context/
│   │
│   ├── hooks/
│   │
│   ├── layouts/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   ├── customer/
│   │   ├── owner/
│   │   ├── admin/
│   │   ├── maps/
│   │   ├── verification/
│   │   └── errors/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── store/
│   │
│   ├── styles/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .github/
│
├── .vscode/
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── jsconfig.json
├── package.json
├── vite.config.js
├── README.md
└── index.html
```

> Feature folders and modules will be created by respective team members during development.

---

# 🌿 Git Workflow

### Branches

```
main
│
└── develop
     ├── feature/authentication
     ├── feature/customer
     ├── feature/owner
     ├── feature/admin
     ├── feature/bike
     ├── feature/booking
     ├── feature/maps
     ├── feature/payment
     ├── feature/gps
     ├── feature/review
     └── feature/notifications
```

---

## Branch Rules

* Never develop directly on `main`.
* Create feature branches from `develop`.
* Submit a Pull Request before merging.
* Resolve merge conflicts before approval.
* Ensure the project builds successfully before pushing.

---

# 📋 Coding Guidelines

## File Naming

### Components

```
PascalCase

Example:

BikeCard.tsx
OwnerDashboard.tsx
```

---

### Hooks

```
useAuthentication.ts
useBooking.ts
```

---

### Utilities

```
dateUtils.ts

storage.ts

validators.ts
```

---

### Constants

```
apiEndpoints.ts

roles.ts

routes.ts
```

---

### Types

```
User.ts

Bike.ts

Booking.ts
```

---

# 📌 General Rules

* Use TypeScript for every component.
* Keep components reusable.
* Avoid duplicate code.
* Follow ESLint rules.
* Format code before committing.
* Use meaningful variable and function names.
* Remove unused imports before pushing.
* Never commit secrets or API keys.

---

# 📝 Commit Message Convention

Examples

```
feat: add customer login page

feat: implement booking module

fix: resolve login validation issue

style: improve dashboard layout

refactor: optimize bike card component

docs: update README
```

---

# 📦 Important Commands

Install dependencies

```bash
npm install
```

Start development

```bash
npm run dev
```

Build

```bash
npm run build
```

Preview

```bash
npm run preview
```

Lint

```bash
npm run lint
```

---

# 🚧 Development Modules

The project will be developed module-wise.

* Authentication
* Customer Module
* Owner Module
* Admin Module
* Bike Module
* Booking Module
* Google Maps
* GPS Tracking
* Payments
* Notifications
* Reviews
* Reports & Analytics

Each module should be developed in its own feature branch.

---

# 🤝 Team Responsibilities

* Follow the agreed folder structure.
* Use common coding conventions.
* Do not modify another developer's module without discussion.
* Keep Pull Requests focused on a single feature.
* Test your changes before creating a Pull Request.

---

# 📄 License

This project is developed as part of the **SSSIT Institute Major Project**.

All contributors should follow the team's development standards and Git workflow.

---

## Happy Coding! 🚀
