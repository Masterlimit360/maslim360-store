# Authentication Configuration Fix Guide

## Issues Found & Fixed ✅

### 1. **CORS Configuration Issue** ✅ FIXED
**Problem**: Backend CORS was only allowing a single origin from `FRONTEND_URL` env variable, causing "failed to fetch" errors during development.

**Solution**: Updated `apps/backend/src/main.ts` to allow multiple development origins:
- `http://localhost:3000`
- `http://localhost:3001` 
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`
- `FRONTEND_URL` environment variable (production)

**File Changed**: [apps/backend/src/main.ts](apps/backend/src/main.ts#L10-L22)

### 2. **Frontend API URL Mismatch** ⚠️ CRITICAL
**Problem**: `apps/frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://192.168.0.199:4000/api` which is a network IP.
- This works if your backend is running on that machine
- **FAILS** if you're accessing frontend from `localhost:3000` and backend is on `localhost:4000`
- CORS will block the request because origins don't match

**Solution**: Update frontend `.env.local` file with correct API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Or for network access (if needed):
```env
NEXT_PUBLIC_API_URL=http://192.168.0.199:4000/api
```

**File to Update**: `apps/frontend/.env.local`

### 3. **Unnecessary Files Removed** ✅ FIXED
Deleted:
- `apps/backend/console.log(data))` - Empty junk file
- `apps/backend/test-auth.js` - Test utility file
- `apps/backend/.env.local.example` - Duplicate config file
- `apps/frontend/.env.local.example` - Duplicate config file

## Quick Start - Authentication Flow

### Backend Configuration
The backend auth is correctly configured with:
- ✅ JWT authentication strategy
- ✅ Login endpoint: `POST /api/auth/login`
- ✅ Register endpoint: `POST /api/auth/register`
- ✅ Protected routes with `JwtAuthGuard`
- ✅ OAuth2 support (Google, Facebook)

### Frontend Configuration
The frontend auth is correctly configured with:
- ✅ Zustand store for auth state management
- ✅ Login/Register functions in `useAuth()` hook
- ✅ Token stored in localStorage
- ✅ Proper error handling

## Environment Variables Setup

### Backend (`apps/backend/.env`)
```env
# Critical for auth to work
JWT_SECRET=Peacemaker360Peacemaker360Peacemaker360
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:peacemaker360@localhost:5432/MasLim360DB?schema=public"

# Optional OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Frontend (`apps/frontend/.env.local`)
```env
# Critical for auth to work - must match your backend URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Optional
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_ALGOLIA_APP_ID=...
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=...
```

## Testing the Fix

### 1. Start Backend
```bash
cd apps/backend
pnpm dev
# Should see: 🚀 Server running on http://localhost:4000
```

### 2. Start Frontend
```bash
cd apps/frontend
pnpm dev
# Should see: ready on http://localhost:3000
```

### 3. Test Login/Signup
- Go to `http://localhost:3000/auth/login`
- Try signing in (should not show "failed to fetch")
- Check browser console for any errors
- Check network tab to see actual API responses

### 4. If Still Getting "Failed to Fetch"
Check these in browser DevTools:

**Console Tab:**
- Look for any error messages
- Check if fetch is being called to correct URL

**Network Tab:**
- Click on the `/api/auth/login` request
- Check "Status" column (should be 200 for success or 401 for invalid credentials)
- Look for CORS error messages
- Check "Response" tab for actual error message

**Common Issues:**
- ❌ CORS error: Backend CORS not allowing frontend origin
- ❌ 404 error: API endpoint doesn't exist
- ❌ Connection refused: Backend not running
- ❌ Invalid credentials: Email/password incorrect

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user (returns JWT) |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/facebook` | Facebook OAuth login |
| GET | `/api/auth/facebook/callback` | Facebook OAuth callback |

## Database Check

Make sure PostgreSQL database is running and has the tables:
```bash
# From backend folder
pnpm prisma studio  # Opens database GUI
```

Should see `User` and `VendorProfile` tables.

## Next Steps

1. ✅ Fix frontend `.env.local` API URL
2. ✅ Restart both backend and frontend
3. ✅ Test login/signup flows
4. ✅ Check browser DevTools for any remaining errors
5. 📝 Add proper error logging in auth pages if needed
6. 🔐 Update `JWT_SECRET` to a secure value before production

## Key Files Reference

- **Backend Auth Module**: [apps/backend/src/auth/auth.module.ts](apps/backend/src/auth/auth.module.ts)
- **Backend Auth Service**: [apps/backend/src/auth/auth.service.ts](apps/backend/src/auth/auth.service.ts)
- **Backend Auth Controller**: [apps/backend/src/auth/auth.controller.ts](apps/backend/src/auth/auth.controller.ts)
- **Frontend Auth Hook**: [apps/frontend/src/hooks/use-auth.ts](apps/frontend/src/hooks/use-auth.ts)
- **Frontend Login Page**: [apps/frontend/src/app/auth/login/page.tsx](apps/frontend/src/app/auth/login/page.tsx)
- **Frontend Register Page**: [apps/frontend/src/app/auth/register/page.tsx](apps/frontend/src/app/auth/register/page.tsx)

---

**Status**: Configuration audit complete. Main issue is likely the frontend API URL mismatch. Update it and test.
