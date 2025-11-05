# Render Deployment Guide

## Fixed Dockerfile Issue

The Dockerfile has been updated to use **pnpm** instead of npm, which is required for your monorepo workspace.

## Render Configuration

### Option 1: Using Root Directory (Recommended)

1. **In Render Dashboard:**
   - **Root Directory**: Leave **EMPTY** (build from repository root)
   - **Dockerfile Path**: `Dockerfile` (uses root Dockerfile)
   - **Environment**: Docker

### Option 2: Using Backend Directory

1. **In Render Dashboard:**
   - **Root Directory**: `apps/backend`
   - **Dockerfile Path**: `Dockerfile` (uses apps/backend/Dockerfile)
   - **Environment**: Docker

## Environment Variables to Set in Render

Go to **Environment** tab in Render and add:

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
PORT=4000
FRONTEND_URL=https://your-vercel-frontend.vercel.app
NODE_ENV=production
```

## Database Setup on Render

1. **Create PostgreSQL Database:**
   - In Render dashboard, click "New" → "PostgreSQL"
   - Render will automatically provide a `DATABASE_URL`

2. **Run Migrations:**
   - After deployment, you can run migrations manually:
   ```bash
   # SSH into your Render service or use Render shell
   cd apps/backend
   pnpm prisma migrate deploy
   ```

   OR add a build command that runs migrations:
   ```bash
   pnpm install && cd apps/backend && pnpm prisma migrate deploy && pnpm build
   ```

## What Was Fixed

✅ **Changed from npm to pnpm** - The Dockerfile now uses pnpm which is required for your workspace
✅ **Multi-stage build** - Optimized for production with smaller final image
✅ **Workspace support** - Properly handles pnpm workspace structure
✅ **Prisma setup** - Generates Prisma client during build

## After Deployment

1. **Get your backend URL** from Render dashboard (e.g., `https://your-app.onrender.com`)
2. **Your API will be at**: `https://your-app.onrender.com/api`
3. **Update Vercel environment variable**:
   - `NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api`
4. **Update backend CORS**: Set `FRONTEND_URL` in Render to your Vercel frontend URL

## Testing

Once deployed, test:
- `https://your-app.onrender.com/api/docs` - Swagger documentation
- `https://your-app.onrender.com/api/products` - Products endpoint

