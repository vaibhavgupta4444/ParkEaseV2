<div align="center">

# ParkEase

### Smart Parking & EV Charging Platform

A full-stack smart-city web application that eliminates the frustration of finding parking.  
Real-time slot availability, smart booking, digital payments, and EV charging — all in one place.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Modules](#modules)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## Overview

Urban drivers spend an average of **15–20 minutes** searching for parking, contributing to traffic congestion, fuel wastage, and air pollution. Simultaneously, EV owners struggle to locate available charging stations, limiting the adoption of electric vehicles.

**ParkEase** solves both problems through a single unified platform:

- Drivers can find, book, and pay for parking slots in real time
- EV owners can discover and reserve charging stations by charger type
- Parking operators and vendors can list and manage their facilities
- Admins can oversee the entire platform through a dedicated dashboard

Built as a B.Tech Final Year Major Project at **Kamla Nehru Institute of Technology, Sultanpur** under the Department of Computer Science & Engineering.

---

## Features

### User
- Interactive map with real-time parking and EV charging markers
- Search by location, landmark, or pincode with filters
- Advance slot booking with date and time selection
- Secure digital payments via Razorpay (UPI, card, net banking)
- QR code generation for booked slots
- Booking history with cancel, extend, and reschedule options
- In-app wallet with refund management
- Reviews and ratings for parking facilities
- Saved vehicles, saved places, and notification preferences

### Vendor
- Add and manage parking lots and EV charging stations
- Visual slot management grid per facility
- Real-time occupancy and revenue dashboard
- Booking management with CSV export
- Dynamic pricing — peak hours, weekends, overnight
- Coupon and discount management
- Vendor profile verification system

### Admin
- Platform-wide overview and analytics
- Manage all users, vendors, and facilities
- Approve or reject vendor verification requests
- Revenue and occupancy reports across all facilities
- Issue and support ticket management

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Tailwind CSS, Leaflet.js |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt, Google OAuth |
| Payments | Razorpay |
| Maps | Leaflet.js, OpenStreetMap |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| HTTP Client | Axios |
| Dev Tools | Nodemon, ESLint, Prettier |

---

## Repository Structure

```
parkease/
│
├── frontend/                         # User-facing React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                 # Images, icons, static files
│   │   ├── components/             # Reusable UI components
│   │   │   ├── common/             # Button, Input, Modal, Badge, etc.
│   │   │   ├── map/                # Map, Marker, BottomSheet
│   │   │   ├── booking/            # BookingCard, SlotGrid, etc.
│   │   │   └── layout/             # Navbar, Sidebar, Footer
│   │   ├── pages/                  # Route-level page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── FacilityDetail.jsx
│   │   │   ├── BookingConfirm.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── BookingSuccess.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Wallet.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Help.jsx
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── context/                # Auth, Theme context providers
│   │   ├── services/               # Axios API call functions
│   │   ├── utils/                  # Formatters, validators, constants
│   │   ├── constants/              # Colors, routes, regex patterns
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── vendor-client/                  # Vendor-facing React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── charts/             # Revenue, occupancy, bookings charts
│   │   │   ├── slots/              # Slot management grid
│   │   │   └── layout/             # VendorSidebar, VendorHeader
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ParkingLots.jsx
│   │   │   ├── EVStations.jsx
│   │   │   ├── SlotManagement.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── Coupons.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Express.js backend (shared)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # MongoDB connection
│   │   │   └── passport.js         # Google OAuth config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── facility.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── vendor.controller.js
│   │   │   ├── review.controller.js
│   │   │   └── admin.controller.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── ParkingFacility.js
│   │   │   ├── EVStation.js
│   │   │   ├── Slot.js
│   │   │   ├── Booking.js
│   │   │   ├── Payment.js
│   │   │   ├── Review.js
│   │   │   ├── Coupon.js
│   │   │   ├── Wallet.js
│   │   │   └── Notification.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── facility.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── vendor.routes.js
│   │   │   ├── review.routes.js
│   │   │   └── admin.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── role.middleware.js   # Role-based access
│   │   │   ├── validate.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── utils/
│   │   │   ├── sendEmail.js
│   │   │   ├── generateToken.js
│   │   │   ├── generateQR.js
│   │   │   └── razorpay.js
│   │   └── index.js                # Entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json                    # Root package.json for scripts
```

---

## Getting Started

### Prerequisites

Make sure the following are installed on your system:

- [Node.js](https://nodejs.org) v18 or higher
- [npm](https://npmjs.com) v9 or higher
- [MongoDB](https://mongodb.com) v7 locally **or** a [MongoDB Atlas](https://cloud.mongodb.com) connection string
- [Git](https://git-scm.com)

Verify your installations:

```bash
node --version
npm --version
mongod --version
git --version
```

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/parkease.git
cd parkease
```

**2. Install backend dependencies**

```bash
cd server
npm install
```

**3. Install user frontend dependencies**

```bash
cd ../client
npm install
```

**4. Install vendor frontend dependencies**

```bash
cd ../vendor-client
npm install
```

---

### Environment Variables

Each part of the monorepo has its own `.env` file. Copy the example files and fill in your values.

**Backend — `server/.env`**

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/parkease
# or Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/parkease

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Client URLs (for CORS)
CLIENT_URL=http://localhost:5173
VENDOR_CLIENT_URL=http://localhost:5174
```

**User Frontend — `client/.env`**

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Vendor Frontend — `vendor-client/.env`**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> Never commit `.env` files to GitHub. They are already covered by `.gitignore`.

---

### Running the Application

You need three terminals running simultaneously.

**Terminal 1 — Start the Backend**

```bash
cd server
npm run dev
```

Server runs at `http://localhost:5000`

**Terminal 2 — Start the User Frontend**

```bash
cd client
npm run dev
```

User app runs at `http://localhost:5173`

**Terminal 3 — Start the Vendor Frontend**

```bash
cd vendor-client
npm run dev
```

Vendor app runs at `http://localhost:5174`

---

**Optional — Run all three with one command**

Install `concurrently` at the root:

```bash
npm install -D concurrently
```

Add this to the root `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\" \"npm run dev --prefix vendor-client\"",
    "install:all": "npm install --prefix server && npm install --prefix client && npm install --prefix vendor-client"
  }
}
```

Then run everything with:

```bash
npm run dev
```

---

## API Reference

All API endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login with email and password | No |
| POST | `/api/auth/google` | Login with Google OAuth | No |
| POST | `/api/auth/forgot-password` | Send password reset email | No |
| POST | `/api/auth/reset-password/:token` | Reset password | No |
| POST | `/api/auth/verify-email/:token` | Verify email address | No |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get logged-in user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| POST | `/api/users/vehicles` | Add a saved vehicle | Yes |
| DELETE | `/api/users/vehicles/:id` | Remove a saved vehicle | Yes |
| GET | `/api/wallet` | Get wallet balance and transactions | Yes |

### Facilities

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/facilities` | Get nearby facilities (query: lat, lng, radius) | No |
| GET | `/api/facilities/:id` | Get facility detail with slots | No |
| GET | `/api/ev-stations` | Get nearby EV stations | No |
| GET | `/api/ev-stations/:id` | Get EV station detail | No |

### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create a new booking | Yes |
| GET | `/api/bookings/user` | Get all bookings for current user | Yes |
| GET | `/api/bookings/:id` | Get booking detail | Yes |
| PUT | `/api/bookings/:id/cancel` | Cancel a booking | Yes |
| PUT | `/api/bookings/:id/extend` | Extend booking duration | Yes |

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/create-order` | Create Razorpay order | Yes |
| POST | `/api/payments/verify` | Verify payment signature | Yes |
| GET | `/api/payments/receipt/:bookingId` | Get payment receipt | Yes |

### Vendor

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/vendor/dashboard` | Get vendor dashboard stats | Vendor |
| POST | `/api/vendor/parking` | Create parking lot | Vendor |
| GET | `/api/vendor/parking` | Get all vendor parking lots | Vendor |
| PUT | `/api/vendor/parking/:id` | Update parking lot | Vendor |
| DELETE | `/api/vendor/parking/:id` | Delete parking lot | Vendor |
| GET | `/api/vendor/parking/:id/slots` | Get slots for a facility | Vendor |
| POST | `/api/vendor/parking/:id/slots` | Add a slot | Vendor |
| PUT | `/api/vendor/parking/:id/slots/:slotId` | Update slot status | Vendor |
| GET | `/api/vendor/bookings` | Get all bookings for vendor | Vendor |
| GET | `/api/vendor/analytics` | Get revenue and occupancy data | Vendor |
| POST | `/api/vendor/coupons` | Create a coupon | Vendor |
| GET | `/api/vendor/coupons` | List all coupons | Vendor |

---

## Modules

### User Module
Complete driver experience — map-based discovery, slot booking, payment, booking management, wallet, reviews, and notifications.

### Vendor Module
Full facility management — parking lots, EV stations, slot grid management, booking overview, revenue analytics, dynamic pricing, and coupon creation.

### Admin Module (Pending)
Platform oversight — user and vendor management, verification approvals, revenue reports, and support ticket handling.

---


| Screen | Preview |
|--------|---------|
| Home Map | _coming soon_ |
| Facility Detail | _coming soon_ |
| Booking Flow | _coming soon_ |
| Vendor Dashboard | _coming soon_ |
| Analytics | _coming soon_ |

---

## Contributing

This is a final year academic project. Contributions from team members follow this workflow:

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: describe what you added"

# Push and open a pull request
git push origin feature/your-feature-name
```

**Commit message convention:**

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `ui:` | UI or styling change |
| `refactor:` | Code restructure without behavior change |
| `docs:` | Documentation update |
| `chore:` | Config, dependencies, tooling |

---

## License

This project is licensed under the [MIT License](LICENSE).

---
