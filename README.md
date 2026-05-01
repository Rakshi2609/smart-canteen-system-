# Smart Canteen System

A modern, AI-powered Smart Canteen System built with Next.js and React. It features a high-end charcoal-themed interface, live Google Maps tracking, dynamic AI-generated menus, and a robust admin dashboard.

## 🚀 Features

### 📍 Live Map & Navigation
- **Google Maps Integration**: Uses the Google Maps JS API with customized dark-mode styling.
- **Dynamic Canteen Tracking**: Pinpoints canteens around you using glowing colored beacons.
  - **Green**: Available & low wait times
  - **Yellow**: Moderate stock / moderate wait times
  - **Red**: High wait times / out of stock
- **Instant Menu Generation**: Clicking on any canteen instantly generates a randomized live menu from a pool of authentic dishes, complete with dynamic pricing and stock levels.

### 🧠 AI Assistant Integration
- **Local LLaMA 3 Powered**: The `/api/canteen/assistant` backend connects directly to local Ollama.
- **Predictive Analytics**: Analyzes current live orders and inventory to predict upcoming demand peaks.
- **Auto-Restock Alert**: Provides actionable insights for the canteen manager, suggesting which dishes to prepare next and alerting on low stock.

### ⚙️ Admin Control Center
- **Secure Access**: Protected via a passcode (`og123`).
- **Live Order Stream**: Simulated live order feed that updates in real-time with sleek Toast notifications.
- **Advanced Inventory Modal**: Easily edit item details (Name, Stock) with a seamless popup modal.
- **1-Click Auto Restock**: Allows administrators to simulate an automated supplier restock directly from AI recommendations.

## 🛠 Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Mapping**: `@react-google-maps/api`
- **AI/Backend Integration**: Ollama (LLaMA 3 model locally running)

## 📦 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file and add your Google Maps API Key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Access the App**
   - User Interface: `http://localhost:3000`
   - Map View: `http://localhost:3000/map`
   - Admin Dashboard: `http://localhost:3000/admin` (Passcode: og123)
