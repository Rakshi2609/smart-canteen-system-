# RBAC Implementation Guide - Smart Canteen System

## Problem Fixed

### ❌ Before (Your Current Design)
```
User Login → Portal Selection (AGAIN) → Dashboard
                    ↓
        User sees all portals, can switch roles
```
**Issues:**
- Confusing UX (users don't know where they are)
- Weak role separation (anyone can access any portal)
- Security risk (role switching without verification)

### ✅ After (Production-Grade RBAC)
```
User Registration → Role Selection → JWT Token (with role) → Auto-Redirect → Dashboard
                                            ↓
User sees only their role's features. No re-selection possible.
```

## What Was Implemented

### 1. **Server-Side Route Middleware** (`src/middleware.ts`)
Automatically protects all routes:
- Validates JWT token on every request
- Redirects unauthenticated users to `/login`
- Redirects logged-in users away from `/portals`
- Auto-redirects to appropriate dashboard based on user role

### 2. **Enhanced Authentication Context** (`src/contexts/AuthContext.tsx`)
- Stores JWT in browser cookie (for server-side access)
- Adds `hasRole()` helper for permission checks
- Adds `loading` state for proper hydration
- Type-safe user roles

### 3. **API Authentication Utilities** (`src/lib/apiAuth.ts`)
Protects API endpoints:
```typescript
export async function requireAuth(request, ["Admin", "Donor"]) {
  // Only Admin and Donor can call this endpoint
}
```

### 4. **Protected Route Component** (`src/components/ProtectedRoute.tsx`)
For client-side route protection:
```tsx
<ProtectedRoute allowedRoles={["Admin"]}>
  <AdminPanel />
</ProtectedRoute>
```

### 5. **Role-Based Routing Helpers** (`src/lib/roleBasedRouting.ts`)
- `getDashboardPath(role)` - Returns correct dashboard URL
- `hasRoutePermission(role, allowedRoles)` - Checks access
- `getRedirectPath(role, path)` - Determines redirect

### 6. **Auto-Redirect After Login/Register**
Updated both `/login` and `/register` pages:
```typescript
// Auto-redirect based on role
const dashboardPaths = {
  "Admin": "/admin",
  "Donor": "/admin?role=Donor",
  "NGO": "/admin?role=NGO"
};
router.push(dashboardPaths[user.role]);
```

### 7. **Smart Portals Page** (`src/app/portals/page.tsx`)
- **Unauthenticated**: Shows informational cards → Links to `/register`
- **Authenticated**: Auto-redirects to user's dashboard

### 8. **Navbar Navigation** (`src/components/Navbar.tsx`)
- Shows role-specific link (no "Choose Portal" option)
- Different icons/labels for each role
- One-click access to user's dashboard

## Security Features

### ✅ Token-Based Auth
User role is embedded in JWT, not in URL:
```javascript
// JWT Payload
{
  "userId": "65abc...",
  "email": "user@example.com",
  "role": "Donor",  // ← Can't be changed in browser
  "status": "Verified"
}
```

### ✅ No URL-Based Role Override
Before: `/admin?role=Admin` ← Anyone could try this
After: Role comes from database via JWT token ← Secure

### ✅ Middleware Protection
Every route checked at the server level:
- HTTP request → Middleware validates token → Route or Redirect

### ✅ API Route Protection
```typescript
// API routes can require specific roles
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req, ["Admin"]);
  if (error) return error; // 403 Forbidden
}
```

## How to Use in Your Code

### Checking User Role in Components
```typescript
"use client";
import { useAuth } from "@/contexts/AuthContext";

export function DonorFeature() {
  const { user, hasRole } = useAuth();
  
  if (!hasRole("Donor")) return <AccessDenied />;
  
  return <DonorContent />;
}
```

### Protecting Routes
```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

### Protecting API Endpoints
```typescript
import { requireAuth } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req, ["Admin", "Donor"]);
  if (error) return error;
  
  // user is now guaranteed to be Admin or Donor
}
```

## User Flows

### 🆕 New Donor Registration
1. Visit `/register`
2. Fill form, select "Donor (Donate Food)"
3. Submit → Backend creates user with role="Donor"
4. JWT token created with role embedded
5. Auto-redirect to `/admin?role=Donor`
6. Dashboard shows Donor features only

### 🔑 Returning User Login
1. Visit `/login`
2. Enter credentials
3. JWT token returned with role
4. Auto-redirect to correct dashboard
5. Trying `/portals` or `/login` again → Auto-redirects to dashboard

### 🚫 Security Scenario
1. Attacker tries `/admin?role=Admin`
2. Middleware checks JWT token (role is Donor)
3. Request blocked → 403 Forbidden or redirect
4. Role can't be changed without database update

## Testing the Implementation

### Test 1: Login Auto-Redirect
```
1. Go to /login
2. Use credentials for Donor account
3. Should redirect to /admin?role=Donor
4. Try visiting /login again → Redirects to dashboard
```

### Test 2: Portal Protection
```
1. Log out
2. Visit /admin
3. Should redirect to /login
4. Login again
5. Visit /portals
6. Should redirect to your dashboard (not show portal selection)
```

### Test 3: Role Isolation
```
1. Donor user visits /admin?role=NGO
2. Should either redirect or show donor dashboard
3. Role from JWT (database) takes precedence over URL param
```

## Database Schema

User already has this structure:
```javascript
{
  name: "Shari",
  email: "shari@gmail.com",
  passwordHash: "hashed...",
  role: "Donor",  // "Admin" | "Donor" | "NGO"
  status: "Verified",  // "Pending Approval" | "Verified" | "Rejected"
  totalImpact: 150,
  createdAt: Date
}
```

## Files Modified

✅ `src/middleware.ts` - **NEW** (Route protection)
✅ `src/contexts/AuthContext.tsx` - Enhanced
✅ `src/components/ProtectedRoute.tsx` - **NEW** (Client-side protection)
✅ `src/lib/apiAuth.ts` - **NEW** (API protection)
✅ `src/lib/roleBasedRouting.ts` - **NEW** (Routing helpers)
✅ `src/app/login/page.tsx` - Auto-redirect logic
✅ `src/app/register/page.tsx` - Auto-redirect logic
✅ `src/app/portals/page.tsx` - Smart redirect
✅ `src/app/admin/page.tsx` - Use context role
✅ `src/components/Navbar.tsx` - Role-based navigation

## Next Steps

1. **Test the flow**: Register as Donor/NGO, login, verify redirects
2. **Add role-based UI**: Show/hide features based on user role
3. **Protect API routes**: Add `requireAuth()` to sensitive endpoints
4. **Admin panel**: Add user management and role changes
5. **Notifications**: Show status when "Pending Approval"

## Industry Best Practices Implemented

✅ JWT tokens with embedded role
✅ Server-side middleware for route protection
✅ Client-side components for UI protection
✅ API endpoint authentication
✅ Cookie + header support for tokens
✅ Automatic redirects (no manual selection)
✅ Type-safe role handling
✅ Hydration-aware components

Your app now follows the same patterns as:
- **Banking apps** 🏦 (role-based dashboards)
- **Admin panels** 📊 (access control)
- **SaaS platforms** ☁️ (user isolation)
