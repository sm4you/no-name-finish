# No Name — Luxury Modest Wear E-Commerce Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

An enterprise-ready, boutique e-commerce web application tailored for luxury modest fashion. Built with modern full-stack TypeScript, React 18, Express, Tailwind CSS, and Supabase cloud persistence.

---

## ✨ Key Features

### 🛍️ Storefront & Customer Experience
- **Dual Visual Themes:**
  - **Classic Boutique:** Warm beige tones (`#f4f2e9`), Times New Roman display typography, horizontal collection carousels, and high-fashion aesthetic.
  - **Modern Editorial:** Minimalist high-contrast layout, clean grid galleries, and sleek dark accent styling.
- **Dynamic Categories Navigation:** Real-time synchronized browsing for all collections:
  - *New Collection*
  - *Sets (الأطقم)*
  - *Skirts / pants (التنانير والبناطيل)*
  - *Blouses / shirts (البلوزات والقمصان)*
  - *Denims (الجينز)*
  - *Dresses (الفساتين)*
  - *Custom categories added dynamically via Admin.*
- **Animated Announcement Marquee:** Continuous, smooth-scrolling banner ticker with pause-on-hover supporting both RTL (Arabic) and LTR (English).
- **Bilingual Experience:** Seamless Arabic (RTL) & English (LTR) language switching with instant localization across all catalog items and store content.
- **Local Payment Gateways:**
  - **Instapay** transfer verification with receipt upload.
  - **Vodafone Cash & Mobile Wallets** with receipt upload.
  - **Cash on Delivery (COD)** with optional "Try Before You Buy" inspection on delivery.

### 🛡️ Admin Dashboard & Control Center
- **Multi-Role Admin Management (RBAC):**
  - Granular permissions: `canManageOrders`, `canManageProducts`, `canManageCategories`, `canManageContent`, `canManageTheme`, `canManageCoupons`, and `canManageAdmins`.
  - Built-in roles: **Super Admin** (`super_admin`), **Store Manager** (`manager`), **Content Editor** (`editor`), and **Orders Specialist** (`orders_only`).
  - Active/inactive account toggling and secure credential hashing.
- **Dynamic Category Management:**
  - Create new product categories with custom slugs, Arabic/English names, descriptions, and cover images.
  - Toggle category visibility in storefront navigation and reorder display sequence.
  - Delete or archive categories with active product association tracking.
- **Product & Stock Matrix Engine:**
  - Multi-variant management (Color × Size combinations) with automated matrix generation.
  - Low-stock visual alerts and real-time inventory tracking.
- **Order Lifecycle & Receipt Review:**
  - Comprehensive order fulfillment workflow (New ➔ Processing ➔ Shipped ➔ Delivered / Cancelled).
  - High-resolution modal viewer for customer payment receipts with instant approval / rejection controls.
  - WhatsApp direct customer contact links pre-populated with order reference numbers.
- **Content & CMS Management:**
  - Real-time editing for Hero banners, Editorial sections, Video reels ("Discover Your Style"), About Us, Shipping & Returns, and Contact pages.
  - Promo code & coupon management with percentage discounts and expiry validation.

---

## 🔒 Supabase Architecture & Security

The project integrates Supabase for PostgreSQL database storage and secure object storage buckets.

### Database Tables
| Table | Description | RLS Policy |
| :--- | :--- | :--- |
| `products` | Product catalog, pricing, variants, and stock | Public Read, Authenticated Admin Write |
| `categories` | Store categories, slugs, images, and sort order | Public Read (active), Authenticated Admin Write |
| `orders` | Customer checkout orders and fulfillment state | Public Insert, Authenticated Admin Read/Write |
| `admin_users` | Admin credentials, roles, and granular permissions | Authenticated Admin Only |
| `coupons` | Promo codes, discounts, and usage limits | Public Read (validation), Admin Write |
| `site_settings` | Global store configuration, announcement text, and theme | Public Read, Authenticated Admin Write |

### Secure Storage Policies (`payment-receipts`)
To protect customer privacy and financial data:
- **Bucket Visibility:** `public = false` (Private bucket).
- **Insert Policy (Public):** Allows all customers to upload payment receipt images during checkout.
- **Select / Read Policy (Restricted):** Strictly restricted to authenticated admin users (`auth.role() = 'authenticated'`). Unauthorized visitors cannot view, enumerate, or download transaction receipts.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- `pnpm` (recommended) or `npm` / `bun`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/no-name-boutique.git
   cd no-name-boutique
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Run Database Migrations:**
   - Open your [Supabase Dashboard](https://supabase.com/dashboard).
   - Navigate to the **SQL Editor**.
   - Copy and paste the contents of `supabase_schema.sql` and run the script.
   - Run `seed-supabase.ts` (optional) to seed initial catalog data:
     ```bash
     pnpm tsx seed-supabase.ts
     ```

5. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Project Structure

```
├── client/                   # React Frontend (SPA)
│   ├── components/           # UI Components & Store Layout
│   │   ├── store/            # StoreLayout, ProductCard, CollectionShelf, etc.
│   │   └── ui/               # Reusable UI component library (Buttons, Dialogs, Badges)
│   ├── pages/                # Page Routes
│   │   ├── Index.tsx         # Storefront Homepage
│   │   ├── Shop.tsx          # Catalog & Filter Page
│   │   ├── ProductDetail.tsx # Product page with color/size selector
│   │   ├── Checkout.tsx      # Multi-step checkout & payment receipt upload
│   │   ├── Admin.tsx         # Admin Dashboard (Orders, Products, Categories, Admins)
│   │   ├── AdminLogin.tsx    # Secure Admin authentication
│   │   └── ...               # Static CMS Pages (About, Shipping, Contact)
│   ├── index.css             # Tailwind CSS & custom animation styles
│   └── App.tsx               # App routing and Provider setup
│
├── server/                   # Express API Backend
│   ├── index.ts              # API routes, middleware, and Supabase handlers
│   └── store.ts              # In-memory store fallback and data sync
│
├── shared/                   # Shared TypeScript Interfaces
│   └── api.ts                # Order, Product, Category, AdminUser type contracts
│
├── supabase_schema.sql       # Supabase database schema, RLS policies, & storage rules
├── seed-supabase.ts          # Database seed script
└── package.json              # Project dependencies & scripts
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the integrated Express backend and Vite development server |
| `pnpm build` | Compiles frontend assets and bundles the backend server into `dist/` |
| `pnpm start` | Launches the production build |
| `pnpm lint` | Runs ESLint code quality checks |

---

## 👥 Contributors & Credits

- **Boutique Concept & Fashion Design:** No Name Modest Wear Team
- **Engineering & Development:** Developed by **Casper.Dev**

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
