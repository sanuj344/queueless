# Qzaam 🍽️💇‍♂️

Welcome to **Qzaam** (formerly QueueLess) — a premium, full-stack, hyper-responsive platform designed to eliminate waiting lines for food vendors, dine-in restaurants, and beauty salons through modern QR-code scanning, instant ordering, dynamic scheduling, and integrated digital wallets.

---

## 🌟 Platform Capabilities

### 1. Dine-In & Food Vendor Flow
- **QR-Code Menus**: Scan a table-specific or outlet-specific QR code to land instantly on a live, beautifully animated vendor menu.
- **Modern Share Sheet**: A custom share sheet on the menu page allowing customers to instantly share the menu link via:
  - 💬 **WhatsApp** (pre-filled message template)
  - ✈️ **Telegram** (formatted sharing)
  - 📤 **Native Web Share API** (for direct mobile sheets)
  - 🔗 **Direct Link Copy** (to paste anywhere)
- **Frictionless Cart & Checkout**: Real-time cart calculations, prep-time guidelines, and Razorpay-integrated checkouts.

### 2. Salon Booking & Scheduling Flow
- **Stylist Management**: Dynamic capacity checks and stylist availability tracking.
- **Time Slot Matrix**: Interactive booking grid for salon clients to secure slots with their preferred stylist, fully protecting against double-bookings.
- **Platform-Fee System**: Dynamic wallet deductions supporting platforms fees.

### 3. Unified Wallet & Referrals
- **Interactive Wallet**: Multi-functional digital currency ledger with secure deposit and platform refund integration.
- **Referral Pipeline**: Integrated referral program for both customers and vendors to earn platform rewards upon successful onboarding.

### 4. Admin Management Dashboard
- **Analytics & Metrics**: Real-time sales aggregation, active commission rates (10% flat rate), order ratios, and prep-time trends.
- **Vendor Approvals**: Oversight to verify, approve, or temporarily suspend incoming food and salon vendors.
- **Customer Support Hub**: Interactive helpdesks, FAQ libraries, and formal complaints logging.

---

## 🏷️ Rebranding: QueueLess ➡️ Qzaam

The application has undergone a comprehensive rebranding to **Qzaam**. All reference instances have been securely migrated:
- **Public Metadata**: Title tags, open-graph cards, and web manifest tags inside `index.html` and `manifest.json`.
- **Custom Split Logos**: Preserved the exact dynamic visual style, drop-shadows, and curated color palettes of the layout logos (`Qz` + `aam`) inside `Navbar`, `Footer`, and `AdminSidebar`.
- **Database & Administrative Seeders**: Mock emails and admin defaults shifted to `@qzaam.com` (e.g. `admin@qzaam.com`).
- **Support & Legal Layouts**: Help desk addresses updated to `qzaam4u@gmail.com` and `support@qzaam.com`.

---

## 🛡️ Administrative Authentication Security

We have retired direct, bypassed administrative sign-ins and replaced them with a robust, backend-verified credentials gateway:
- **Admin Verification Modal**: When a user clicks **Login as Admin**, a secure password validation dialog opens.
- **Premium User Interactions**: Contains custom circular badges with protective shield (`🛡️`) icons, password text boxes with **Show/Hide visibility toggles**, loading states, disabled buttons, and submit-on-Enter keypress handling.
- **Brute-Force Lockout Protection**: Client-side rate-limiter that locks access for **30 seconds** after 5 consecutive incorrect passwords, preventing automated credential dictionary attacks.
- **Backend Credentials Guard**: `POST /api/admin/login` handles secure matching against the administrative password (`admin@123`). If valid, the backend queries the database for the admin record, signs a legitimate JWT token with the `'admin'` role, and returns standard user session metadata.

---

## 💻 Tech Stack & Architecture

### Frontend
- **Framework**: React.js & React Router
- **Build Tool**: Vite (Rolldown minification)
- **Styling**: Harmony HSL Custom CSS variables & modern typography
- **State & Context**: React Context API (`AuthContext`, `ThemeContext`, `CartContext`)
- **HTTP client**: Axios (pre-configured Bearer token headers interceptor)

### Backend
- **Server**: Node.js & Express
- **Database ORM**: Prisma Client (PostgreSQL adapter)
- **Security**: JWT sessions & Bcrypt password hashing
- **Validation**: Schema-level Zod middlewares

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment keys in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/qzaam_db"
   JWT_SECRET="your_secure_jwt_secret_key"
   PORT=5000
   ```
4. Run Prisma Migrations & Generate client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
5. Seed Administrative Accounts:
   ```bash
   node scratch/seed_admin.js
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite bundler server:
   ```bash
   npm run dev
   ```
4. Compile the production bundle:
   ```bash
   npm run build
   ```

---

## 🔐 Credentials Guide

| Account Role | Mock Email Address | Mock Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@qzaam.com` | `admin@123` *(Modal verified)* |
| **Food Vendor** | `vendor@example.com` | `password123` |
| **Salon Vendor** | `salon@example.com` | `password123` |
| **Client Customer** | *Any mobile OTP sign-in* | *Standard verification* |
