# 🍱 RescueFlow.ai — SaaS Food Rescue Logistics Platform

> **A city-wide food rescue management system that connects Hotels/Restaurants (Donors) with NGOs and Volunteers, powered by real-time logistics, live delivery tracking, and a public food locator.**

---

## 🌟 Live Features

### 🏠 Landing Screen — Role-Based Portal Selection
A stunning dark-mode landing page with animated floating background bubbles. Users can self-select their role to enter the appropriate portal:
- **Admin Portal** — Platform command center
- **Donor Portal** — For hotels, restaurants, and individuals with surplus food
- **NGO / Volunteer Portal** — For organizations rescuing and distributing food

---

### 🛡️ Admin Portal (`/admin` → Passcode: `og123`)
A **SaaS-grade logistics command center** with 5 dashboards:

| Tab | Description |
|-----|-------------|
| **Platform Overview** | Live KPIs: Active Operations, Total Meals Rescued, Network Size, Expiry Rate |
| **Global Operations** | Real-time log of all food rescue operations with Force Expire and Delete controls |
| **Partner Network** | User directory to Verify, Suspend, and Restore access for all Donors and NGOs |
| **Audit Logs** | Full immutable trail of every action across all portals |
| **AI Insights** | Analytics on Route Optimization and Expiry Hotspots |

---

### 🍲 Donor Portal
A multi-step workflow for food donors:
1. **Address Entry** — Powered by [Photon Autocomplete API](https://photon.komoot.io) for real-time address suggestions
2. **Food Listing** — Submit surplus food details (name, quantity, food type, expiry)
3. **History** — Track all submitted donations and their real-time status (Waiting → Pickup Assigned → Completed)
4. **Inbox** — Receive delivery confirmations when NGOs successfully collect food

---

### 🤝 NGO / Volunteer Portal
- Browse all available live food donations from across the city
- **Accept Pickup** → Enter delivery destination address
- **Track Delivery** → Opens a full-screen modal with:
  - Real road polyline from OSRM routing engine
  - Animated 🛵 delivery scooter moving along the actual road path
  - Estimated delivery time based on distance

---

### 📍 Live Map — "Find Food Near Me" (`/map`)
A **public food bank locator** accessible to anyone:
- Click glowing pins on the map to see active NGOs and Donors distributing food
- View real-time surplus food portions, types, and expiry windows
- **"Get Directions"** button opens Google Maps routing to the food bank instantly

---

### ❤️ Support Portal (`/support`)
A **portfolio-grade demo donation and tipping system**:
- **Donate to NGOs** — Grid of verified NGO cards (Robin Hood Army, Feeding India, etc.) with meal impact stats
- **Tip Volunteers** — Quick-tip (₹20, ₹50, ₹100) or custom amount after a successful delivery
- **Simulated QR Payment Flow** — Generates a live QR code (`react-qr-code`) encoding the payment string
- **Animated Modal** — 3-step flow: Amount → QR Scan → Success using Framer Motion

> ⚠️ Demo system only. No real payments are processed.

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | TailwindCSS v4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Map Tiles** | Google Maps JS API (`@react-google-maps/api`) |
| **Address Autocomplete** | [Photon by Komoot](https://photon.komoot.io) |
| **Road Routing** | [OSRM Open Source Routing Machine](https://router.project-osrm.org) |
| **QR Generation** | `react-qr-code` |
| **Language** | TypeScript |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Sharan-Sanadi/smart-canteen-system-.git
cd smart-canteen-system-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the project root with the following:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GEOCODING_API=https://nominatim.openstreetmap.org
NEXT_PUBLIC_AUTOCOMPLETE_API=https://photon.komoot.io
NEXT_PUBLIC_ROUTING_API=https://router.project-osrm.org
```

> **Note:** The Geocoding, Autocomplete, and Routing APIs are all **free and open-source**. Only Google Maps requires a paid API key for the base map tiles.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/          # Admin & role-based portals (Donor + NGO)
│   │   └── page.tsx    # Main unified application file
│   ├── map/            # Public food locator page
│   │   └── page.tsx
│   ├── support/        # Demo donation & tipping portal
│   │   └── page.tsx
│   ├── globals.css     # Global styles & design tokens
│   └── layout.tsx      # Root layout with Navbar
├── components/
│   ├── LiveMap.tsx     # Reusable Google Maps component with OSRM routing
│   └── Navbar.tsx      # Global navigation bar
└── lib/
    └── firebase.ts     # Firebase SDK config (for future DB integration)
```

---

## 🗺️ Application Flow

```
Landing (/) → Role Selection
    ↓
Admin (passcode: og123)    Donor                    NGO / Volunteer
    ↓                          ↓                           ↓
Platform Overview         Enter Address              Browse Available Food
Global Operations     →   List Surplus Food      →   Accept Pickup
Partner Network           Track Donations             Live Delivery Map (🛵)
Audit Logs                Inbox Notifications         Track ETA
AI Insights
```

---

## 🔮 Roadmap

- [ ] **Firebase Firestore Integration** — Persist all donation and delivery data across sessions
- [ ] **NextAuth / Firebase Auth** — Replace passcode-based Admin access with proper authentication
- [ ] **Push Notifications** — Alert NGOs when new food is available near them
- [ ] **Dynamic Animation Speed** — Tie delivery scooter speed to actual OSRM travel time
- [ ] **Real Payment Gateway** — Integrate Razorpay for the Support portal

---

## 🧑‍💻 Author

**Sharan Sanadi**  
Built with ❤️ as a SaaS portfolio project demonstrating full-stack logistics, real-time mapping, and modern UI/UX.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
