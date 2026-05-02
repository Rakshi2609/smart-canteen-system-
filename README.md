# 🥗 SmartCanteen — AI-Powered Food Rescue Network

> **India's First AI-Powered Food Rescue Platform** — connecting surplus food from restaurants & hotels to verified NGOs and volunteers in real-time.

![SmartCanteen Banner](https://img.shields.io/badge/SmartCanteen-Food%20Rescue-3b82f6?style=for-the-badge&logo=leaflet&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=for-the-badge&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)

---

## 🌟 Overview

**SmartCanteen** is a full-stack, role-based food rescue management platform built with Next.js 15, TailwindCSS, and Framer Motion. It features three specialized portals (Admin, Donor, NGO), a live map powered by OpenStreetMap + Google Maps, a UPI QR payment system, and a real-time unified order state system persisted via `localStorage`.

---

## 🖥️ Live Demo Features

### 🔐 Portal System (`/portals`)
- Animated glassmorphic portal selection page with floating bubble background
- Three role-based portals with pre-filled credentials (no typing needed):
  - **Admin** — Passcode: `og123`
  - **Donor** — Email pre-filled, direct dashboard access
  - **NGO** — Email pre-filled, direct dashboard access
- Smooth Framer Motion modal transitions per portal
- Once logged in → goes directly to the role-specific dashboard, skipping any secondary login

---

### 🛡️ Admin Dashboard (`/admin?role=Admin`)
- **Overview Tab**: Live global stats (meals saved, active orders, expiry alerts)
- **Orders Tab**: Full global donation order management with status controls (`Waiting → Accepted → Delivered → Expired`)
- **Network Tab**: Verified partner list (Donors & NGOs) with approval/rejection controls
- **AI Insights Tab**: Simulated AI-powered analytics on route optimization and expiry hotspots
- Real-time toast notifications on order status changes
- **State Persisted**: All orders, audit logs, and user network data are saved to `localStorage` and survive portal switching

---

### 🥗 Donor Dashboard (`/admin?role=Donor`)
- **Donate Tab**: Form to list surplus food with name, type (Veg/Non-Veg), quantity, cooked time, and spoilage window
- **Active Donations Tab**: Live view of all listed food with countdown expiry timers, status badges, and edit/delete controls
- New donations are instantly written to the **global shared state** visible to Admin and NGO portals

---

### 🤝 NGO Dashboard (`/admin?role=NGO`)
- **Live Rescue Tab**: Live feed of all available donations from Donors with accept button
- **My Pickups Tab**: Accepted orders with a real OSRM-powered delivery route animation on the map
- **Delivery Map**: Route drawn on an embedded Google Map using the free OSRM routing engine; animated 🛵 emoji rides the route in real-time

---

### 🗺️ Live Map (`/map`)
**Restaurant Finder** — powered by **OpenStreetMap Overpass API** (free, no API key needed):
- Fetches real restaurants, cafes, fast food, and canteens within 2.5km of the user's location
- Falls back to curated mock data if outside mapped areas
- **Color-coded teardrop markers**:
  - 🔴 Red = High Priority
  - 🟠 Orange = Medium Priority
  - 🟢 Green = Available
- **Heatmap Toggle** 🔥: Toggling the Flame button activates a Google Maps Visualization heatmap overlay showing food density; toggling again fully removes it (imperative cleanup via `useRef`)
- **Interactive Sidebar**: Click any pin to see:
  - Open/Closed status
  - Cuisine type
  - Live crowd level (Low / Moderate / Busy)
  - Amenities (WiFi, Takeaway, Dine-in)
  - ⭐ Star rating widget (hover + click)
  - **Check In** button with success animation
  - **Copy Location** (copies Google Maps link to clipboard)
  - **Bookmark** (save places across session)
- Dark/Light map theme toggle

---

### ❤️ Support Page (`/support`)
- **Donate to NGOs**: Cards for Robin Hood Army, Feeding India, Bangalore Food Bank, No Food Waste
- **Tip Volunteers**: Quick tip presets (₹20, ₹50, ₹100) or custom amount
- **UPI QR Payment Flow**:
  1. Select amount → generates a **real UPI deep-link QR code** (`upi://pay?...`)
  2. Scan on phone → opens Google Pay / PhonePe directly
  3. Click "I've Paid, Verify Status" → 1.5s simulated API check → success screen

---

### 🏠 Landing Page (`/`)
Fully informational — **only the Explore button navigates**. Sections include:
- Hero with animated stats counter and floating bubble background
- **Three Portals Section**: Feature cards for Admin, Donor, and NGO with detailed bullet points
- **Live Map Section**: Feature overview + decorative animated map preview with pulsing pins
- **Support Section**: Feature cards + fake UPI QR preview card
- **Final CTA** at the bottom

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v3 |
| Animations | Framer Motion |
| Map (Display) | Google Maps API + `@react-google-maps/api` |
| Map (Restaurants) | OpenStreetMap Overpass API (FREE, no key) |
| Map (Routing) | OSRM (FREE, open routing engine) |
| Map (Heatmap) | Google Maps Visualization Library |
| QR Code | `react-qr-code` |
| Icons | Lucide React |
| State | React `useState` + `localStorage` persistence |
| Font | Inter (Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/Sharan-Sanadi/smart-canteen-system-.git
cd smart-canteen-system-

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Add your Google Maps API Key (optional — map tiles still load without it)
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

> ℹ️ The Google Maps key is **optional**. Map tiles and the restaurant finder (Overpass API) work without it. The key only enhances the Places API fallback.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Landing page (informational, Explore CTA only)
│   ├── portals/
│   │   └── page.tsx      # Portal selection with role modals
│   ├── admin/
│   │   └── page.tsx      # Unified dashboard (Admin / Donor / NGO)
│   ├── map/
│   │   └── page.tsx      # Food near me map page
│   └── support/
│       └── page.tsx      # UPI donation & volunteer tip page
└── components/
    └── LiveMap.tsx       # Google Maps + Overpass API + OSRM + Heatmap
```

---

## 🗺️ Roadmap / Next Steps

- [ ] **Firebase/Supabase integration** — replace `localStorage` with a real persistent database
- [ ] **NextAuth authentication** — real login instead of mock credentials
- [ ] **Razorpay/Stripe integration** — real webhook for UPI payment confirmation
- [ ] **Push notifications** — notify NGOs when new food is listed nearby
- [ ] **Mobile app** — React Native companion app for volunteers

---

## 👨‍💻 Author

**Sharan Sanadi**  
[GitHub](https://github.com/Sharan-Sanadi) · Full Stack Developer & AI Enthusiast

---

## 📄 License

MIT License — feel free to use, fork, and build upon this project.
