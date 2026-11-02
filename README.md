# Digital Warranty Tracker

A complete, modern, and user-friendly web application designed to help consumers and businesses track, organize, and monitor product warranties with automatic expiration calculations and proactive alerts.

---

## 1. Project Structure

```text
digital-warranty-tracker/
├── .env                       # Local environment variables (JWT Secret, MongoDB URI, Initial User)
├── .env.example               # Template with configuration keys
├── index.html                 # HTML entry point with Plus Jakarta Sans & JetBrains Mono
├── metadata.json              # AI Studio application metadata
├── package.json               # Scripts and frontend + backend dependencies
├── server.ts                  # Express server entry point mounting Vite dev middleware & API
├── tsconfig.json              # TypeScript compilation configuration
├── vite.config.ts             # Vite bundler configuration
│
├── server/                    # Backend API and Database Engine
│   ├── auth.ts                # JWT authentication middleware and token signing
│   ├── db.ts                  # MongoDB client & persistent document store with auto-seeding
│   └── routes.ts              # REST API endpoints for auth, stats, and products CRUD
│
├── src/                       # Frontend React 19 Application (JSX)
│   ├── main.jsx               # React client root mount
│   ├── App.jsx                # App root handling auth, navigation, and state orchestration
│   ├── index.css              # Main stylesheet importing Tailwind and modular CSS files
│   │
│   ├── services/
│   │   └── api.js             # Centralized fetch API client & date/warranty calculation helpers
│   │
│   ├── components/
│   │   ├── LoginPage.jsx      # Secure login page with password toggle and quick demo fill
│   │   ├── Sidebar.jsx        # Navigation menu with responsive mobile drawer & logout
│   │   ├── Topbar.jsx         # Header bar with view breadcrumbs and primary action CTA
│   │   ├── DashboardView.jsx  # 4 summary KPI cards, upcoming alerts, & recent products
│   │   ├── MyProductsView.jsx # Search, category & status filters, sorting, grid/table views
│   │   ├── AddProductView.jsx # Form container for registering new warranties
│   │   ├── ProductForm.jsx    # Reusable form with live auto-calculating expiry preview
│   │   ├── StatusBadge.jsx    # Multi-color badges (Active, Expiring Soon, Expired)
│   │   ├── ProductDetailModal.jsx # Full product inspection modal with warranty progress bar
│   │   ├── EditProductModal.jsx   # Edit modal with automatic recalculations
│   │   └── DeleteConfirmModal.jsx # Confirmation dialog before deletion
│   │
│   └── styles/
│       ├── theme.css          # CSS variables (purple, light lavender, white, shadows)
│       ├── login.css          # Styles for the login form and ambient lighting
│       ├── dashboard.css      # KPI summary cards and alert notification styles
│       └── products.css       # Cards, data tables, forms, and modal styles
│
└── data/                      # Local persistent document store (when running standalone)
    └── warranty_db.json
```

---

## 2. Steps Required to Run the Application

### Prerequisites
- Node.js version 18+ (Node v22 installed)
- npm or yarn

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional — default `.env` is already created with secure defaults):
   ```bash
   cp .env.example .env
   ```

3. Start the application in development mode:
   ```bash
   npm run dev
   ```
   The development server starts on `http://localhost:3000` with hot module updates and Express backend API enabled.

4. Build for production:
   ```bash
   npm run build
   ```

5. Run in production:
   ```bash
   npm start
   ```

---

## 3. User Authentication & Sign Up

The application supports both **Sign In** and **Sign Up**:
- **Sign Up**: Users can register with their Full Name, Email, and Password (minimum 6 characters).
- **Sign In**: Registered users can sign in with their credentials.
- **Pre-seeded Demo Account**: A test account is also pre-seeded with hashed passwords:
  - **Email:** `demo@warrantytracker.com`
  - **Password:** `password123`
  - Includes a convenient **"Auto-fill credentials"** button for fast testing.

---

## 4. Key Features & Capabilities

1. **Secure Authentication & Registration**:
   - Integrated Sign In and Sign Up tabs with client & server validation
   - Password hashing with `bcryptjs`
   - Signed JSON Web Tokens (JWT)
   - User data isolation (each user manages only their own products)

2. **Smart Expiry Notifications & Alerts**:
   - **Expiring Today Alerts**: Products expiring today trigger urgent red badges, sound attention, and a prominent call-to-action to claim warranty service before midnight.
   - **Upcoming Alerts**: Products expiring within days (4 days, 10 days, 22 days, etc.) display countdown tags.
   - **Notification Bell Center**: Topbar bell button with unread counter badge and interactive dropdown listing all pending alerts.
   - **Floating Slide-in Toast**: Bottom-right notification toast notifying the user immediately upon entering the dashboard.
   - **Browser Desktop Notifications**: Integrated Web Notifications API to send desktop alerts when warranties are close to expiring.

2. **Automated Expiry Calculation**:
   - Calculates the exact warranty expiration date based on the purchase date and duration in months or years.
   - Live recalculation on both frontend previews and backend validation.

3. **Warranty Statuses & Badges**:
   - **Active** (Emerald green badge): Warranty is currently valid.
   - **Expiring Soon** (Amber badge): Warranty lapses within the next 30 days.
   - **Expired** (Rose red badge): Warranty period has passed.

4. **Dynamic Dashboard**:
   - Four KPI summary cards: Total Products, Active Warranties, Expiring Soon, Expired Warranties.
   - Upcoming warranty expiry notifications (e.g., *"Your Sony WH-1000XM5 warranty expires in 10 days."*).
   - Recently added items with quick detail inspection.
   - Statistics update automatically upon adding, editing, or deleting products.

5. **Search, Filter & Sort**:
   - Real-time search across product name, brand, serial number, and store name.
   - Filter by category (Electronics, Home Appliances, Audio, Computing, etc.).
   - Filter by warranty status (Active, Expiring Soon, Expired).
   - Sort by expiry date (soonest or furthest), purchase date, price, or name.
   - Switch between **Grid Card View** and **Compact Table View**.

6. **Full CRUD & Modals**:
   - View detailed product specifications, serial number copy button, and visual warranty timeline progress bar.
   - Edit any existing product details with automatic expiry date recalculation.
   - Confirmation dialog before deletion.

7. **Database Resilience**:
   - Supports external MongoDB connection via `MONGODB_URI`.
   - Automatically falls back to a persistent JSON document database in `./data/warranty_db.json` with MongoDB-compatible collections so the app works instantly without requiring external database setup.
