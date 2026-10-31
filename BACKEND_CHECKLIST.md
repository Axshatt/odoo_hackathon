# Brightloop Backend Architecture & Implementation Checklist

## 1. Project Overview & Architecture Standards

Based on the **Subscription Management System (Brightloop Software)** problem statement and your development architecture rules:

- **MongoDB Database**: Connected to MongoDB Atlas (`MONGODB_URI=mongodb+srv://codexade:adarsh@cluster0.kqusni.mongodb.net/Floxy`).
- **Separation of Concerns**: Controllers only handle HTTP requests/responses and validation; all database operations and business logic are isolated in the `services/` layer.
- **Async & Error Handling**: All controller functions wrapped with `asyncHandler` (second-order function). Standardized responses via `ApiResponse` and errors via `ApiError`.
- **Utilities**: `Constructors/` for `ApiResponse`, `ApiError`, `asyncHandler`; and `aiUtilities/` for text, audio, video, and file processing utilities.
- **RBAC Security**: Strict role enforcement (`Admin`, `Staff`, `Customer`) with JWT token authentication and role guards.
- **Idempotent Billing Engine**: Double-billing prevention via compound indexes and billing period validation.

---

## 2. Directory Structure

```text
backend/
├── config/
│   ├── db.js                     # MongoDB connection with Mongoose
│   └── env.js                    # Environment variable configurations
├── utils/
│   ├── Constructors/
│   │   ├── ApiResponse.js        # Standardized API response class
│   │   ├── ApiError.js           # Standardized API error class
│   │   └── asyncHandler.js       # Higher-order async wrapper
│   └── aiUtilities/
│       ├── textResponse.js       # AI utility for text processing/summaries
│       ├── audioResponse.js      # AI utility for audio transcripts
│       ├── videoResponse.js      # AI utility for video processing
│       └── fileResponse.js       # AI utility for file/invoice parsing
├── Modals/
│   ├── User.js                   # Users with roles: Admin, Staff, Customer
│   ├── Product.js                # Products with price, cost, variants
│   ├── Plan.js                   # Subscription plans (frequency, terms, limits)
│   ├── QuotationTemplate.js      # Reusable quotation templates
│   ├── Subscription.js           # Subscriptions with lifecycle status & lines
│   ├── Invoice.js                # Invoices with line items, tax, discounts
│   ├── Payment.js                # Payments recorded against invoices
│   ├── DiscountRule.js           # Admin discount rules & conditions
│   └── TaxRule.js                # Admin tax percentage & regional rules
├── services/
│   ├── authService.js            # User registration, login, JWT, staff creation
│   ├── productService.js         # Product CRUD & variant pricing
│   ├── planService.js            # Plan management & lifecycle policies
│   ├── quoteService.js           # Quotation templates & conversion
│   ├── subscriptionService.js    # Subscription state machine & renewal
│   ├── billingService.js         # Idempotent recurring invoice generator & tax/discount engine
│   ├── paymentService.js         # Payment recording & subscription billing advance
│   └── analyticsService.js       # MRR, ARR, overdue reports (<2s response time)
├── controller/
│   ├── authController.js
│   ├── productController.js
│   ├── planController.js
│   ├── quoteController.js
│   ├── subscriptionController.js
│   ├── billingController.js
│   ├── paymentController.js
│   └── analyticsController.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── planRoutes.js
│   ├── quoteRoutes.js
│   ├── subscriptionRoutes.js
│   ├── billingRoutes.js
│   ├── paymentRoutes.js
│   ├── analyticsRoutes.js
│   └── index.js
├── middlewares/
│   ├── authMiddleware.js         # JWT verify token
│   ├── roleMiddleware.js         # Role check (Admin, Staff, Customer)
│   └── errorMiddleware.js        # Global error catcher formatting ApiError
├── seed/
│   ├── seedRunner.js             # Script to populate MongoDB Atlas
├── app.js                        # Express app setup, CORS, JSON, routes
├── index.js                      # Server entry point
├── .env                          # Environment variables
└── package.json                  # Backend dependencies & scripts
```

---

## 3. Detailed Feature Checklist

### [x] Phase A: Foundation & Setup
- [x] Initialize `backend/package.json` with dependencies (`express`, `mongoose`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`).
- [x] Configure `config/db.js` with connection to `Floxy` database.
- [x] Create `utils/Constructors/ApiResponse.js`: Standard format `{ statusCode, data, message, success: true }`.
- [x] Create `utils/Constructors/ApiError.js`: Standard format `{ statusCode, message, errors, stack, success: false }`.
- [x] Create `utils/Constructors/asyncHandler.js`: Second-order function wrapper.
- [x] Create `utils/aiUtilities/`: `textResponse.js`, `audioResponse.js`, `videoResponse.js`, and `fileResponse.js`.
- [x] Setup `app.js` with CORS (configured with `FRONTEND_URL`), JSON parser, URL encoding, health check, and global `errorMiddleware.js`.
- [x] Setup `index.js` as the server entry point listening on port `5000`.

---

### [x] Phase B: Authentication & RBAC (Role-Based Access Control)
- [x] **Data Model: `User.js`**: `name`, `email` (unique, indexed), `password` (bcrypt), `role` (`Admin`, `Staff`, `Customer`), `companyName`, `phone`.
- [x] Password validation: Min 8 chars, 1 uppercase, 1 lowercase, 1 special character.
- [x] **Services & Controllers**:
  - `handleRegister`: Public registration for customer accounts.
  - `handleLogin`: Email/password login returning JWT and user profile.
  - `handleForgotPassword` & `handleResetPassword`: Generates secure token and updates password.
  - `handleAddStaff`: Admin-only action to add staff members.
  - `handleGetProfile`: Fetch authenticated profile.
  - `handleListStaff`: Admin-only list of staff members.
- [x] **Middlewares**:
  - `verifyJWT`: Extracts and validates Bearer JWT.
  - `authorizeRoles`: Verifies role permissions (`Admin`, `Staff`, `Customer`).

---

### [x] Phase C: Products, Variants & Plans
- [x] **Data Model: `Product.js`**: `name`, `type`, `salesPrice`, `costPrice`, `notes`, `variants` (e.g. Brand: "Odoo" adds ₹560).
- [x] **Data Model: `Plan.js`**: `code`, `name`, `price`, `cycle` (`daily`, `weekly`, `Monthly`, `Yearly`), `minQuantity`, `allowEarlyClose`, `allowPause`, `allowRenewal`.
- [x] **Services & Controllers**:
  - Product CRUD with variant support.
  - Plan CRUD with lifecycle policy flags.
  - Plan listing accessible to all roles.

---

### [x] Phase D: Quotations & Subscription Lifecycle Engine
- [x] **Data Model: `QuotationTemplate.js`**: `name`, `planId`, `productLines` (`productId`, `variant`, `quantity`, `unitPrice`), `validityDays`.
- [x] **Data Model: `Subscription.js`**: `subscriptionNumber` (`SUB-XXXX`), `customerId`, `planId`, `seats`, `status`, `start`, `next`, `discount`, `lines`, `history`.
- [x] **Services & Controllers**:
  - Create subscription draft or customer subscription.
  - State machine transition: `Draft` → `Quotation` → `Confirmed` → `Active` → `Paused` / `Closed` / `Renewed`.
  - Scoped data access: Customers see only their subscriptions; Admin/Staff see all.

---

### [x] Phase E: Discounts & Tax Rules Engine
- [x] **Data Model: `DiscountRule.js`**: `code`, `discountType` (`fixed` | `percentage`), `value`, `minQuantity`, `appliesTo`.
- [x] **Data Model: `TaxRule.js`**: `name` (GST), `rate` (18%), `isDefault`.
- [x] **Services & Controllers**:
  - Admin tax rate configuration.
  - Admin discount rules engine.

---

### [x] Phase F: Invoicing & Automated Recurring Billing
- [x] **Data Model: `Invoice.js`**: `invoiceNumber` (`INV-XXXX`), `subscriptionId`, `customerId`, `period`, `due`, `lines`, `subtotal`, `discount`, `tax`, `total`, `status`.
- [x] Compound index `{ subscriptionId: 1, period: 1 }` preventing duplicate billing.
- [x] **Services & Controllers**:
  - `generateInvoiceForSubscription`: Generates draft invoice for active subscription.
  - `confirmInvoice`: Transitions to `Confirmed` status.
  - `cancelInvoice`: Transitions to `Cancelled` status.
  - `runRecurringBillingBatch`: Scans active subscriptions due for billing and generates invoices automatically.

---

### [x] Phase G: Payment Recording & Reconciliation
- [x] **Data Model: `Payment.js`**: `paymentNumber` (`PAY-XXXX`), `invoiceId`, `subscriptionId`, `customerId`, `amount`, `date`, `method`, `note`.
- [x] **Services & Controllers**:
  - `recordPayment`: Validates invoice, marks invoice as `Paid`, and advances subscription `next` billing date with month-end date clamping.
  - Payment history querying with role scoping.

---

### [x] Phase H: Finance Analytics & Reporting (<2s Response Time)
- [x] Fast aggregated analytics pipeline:
  - **MRR (Monthly Recurring Revenue)**: Sum of active subscriptions after discounts (yearly plans divided by 12).
  - **Active Subscriptions Count**.
  - **Collected Revenue**: Filterable by `this_month` or `all_time`.
  - **Outstanding Balance & Overdue Invoices**: Real-time comparison with `today()`.

---

### [x] Phase I: Mock Data Seeding (MongoDB Atlas)
- [x] **Seed Script (`backend/seed/seedRunner.js`)**:
  - Connected to MongoDB Atlas (`Floxy` database).
  - Seeded Users:
    - Admin: `adarshrpandey10@gmail.com`
    - Staff: `aakashsudan190@gmail.com`, `jamie@codevern.com`
    - Customer: `alex@codevern.com`, `business.stallers@gmail.com`, `support@codevern.com`
  - Seeded Products & Variants: Business Workspace (with Odoo Brand +₹560), Security Shield.
  - Seeded Plans: Starter (₹1,499), Growth (₹3,999), Scale (₹39,990).
  - Seeded Tax Rule (18% GST) & Discount Rule (10% Volume Discount).
  - Seeded 8 Subscriptions (`SUB-1041` to `SUB-1048`).
  - Seeded 6 Invoices (`INV-1049` to `INV-1054`).
  - Seeded 4 Payments (`PAY-201` to `PAY-204`).

---

## 4. Verification & Testing Completed
- [x] MongoDB Atlas connection verified and operational on Atlas cluster `cluster0.kqusni.mongodb.net/Floxy`.
- [x] Seeding script executed cleanly.
- [x] Health check endpoint `/api/health` verified.
- [x] End-to-end API test verified: Admin login, JWT generation, Analytics overview, Subscriptions list, and Invoices retrieval.
- [x] Concurrently script configured in root `package.json` (`npm run dev` starts both frontend and backend).
