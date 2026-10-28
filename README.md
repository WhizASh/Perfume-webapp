# I.K.K Perfume — Modern Royal Perfume Storefront

A responsive React + Vite + Tailwind CSS v4 perfume e-commerce web application with **Firebase backend (Firestore & Storage)** and **Direct WhatsApp Ordering** (no customer auth required).

---

## Features

- **Modern Royal Aesthetic**: Burgundy, ivory, champagne, and antique gold styling.
- **Dynamic Catalog (Cloud Firestore)**: Live product inventory loaded from Firestore with seamless local catalog fallback.
- **Image Hosting (Firebase Storage)**: Upload and serve perfume photography directly from Firebase Storage.
- **Frictionless Customer Checkout (WhatsApp)**:
  - Customers browse and add items to bag with zero authentication barriers.
  - Generates unique reference code (`#IKK-XXXX`) and logs the order in Firestore `orders` collection.
  - Redirects customer to the owner's WhatsApp number with pre-formatted product list, sizes, quantities, and subtotal.
- **Secure Admin Portal (`/admin`)**:
  - Email/Password authentication powered by Firebase Auth (encrypted via TLS and salted with Firebase scrypt).
  - Add new perfumes with direct file upload to Firebase Storage.
  - View real-time customer WhatsApp orders and order references.
  - One-click sample catalog seeder.

---

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your Firebase project settings and WhatsApp phone number:
```env
# Firebase Configuration (From Firebase Console > Project Settings)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Store Owner WhatsApp Number (country code + number, e.g. 919876543210)
VITE_WHATSAPP_NUMBER=919876543210
```

> **Note**: If `.env` is unconfigured, the store automatically runs in offline demo mode using the default perfume catalog, allowing you to preview the storefront immediately.

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## Admin Portal

Visit `/admin` in your browser.
1. Enable **Email/Password** in Firebase Console under **Authentication > Sign-in method**.
2. Add an admin user in Firebase Console under **Authentication > Users**.
3. Sign in at `/admin` to upload new fragrance photos to Firebase Storage and view orders.
