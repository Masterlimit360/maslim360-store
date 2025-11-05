# Backend Deployment Guide

## Current Backend URL

- **Local Development**: `http://localhost:4000/api`
- **Production**: Not deployed yet (you need to deploy it)

## Quick Deployment Steps

### Option 1: Railway (Recommended - Easiest)

1. **Sign up/Login**: Go to https://railway.app
2. **New Project**: Click "New Project" → "Deploy from GitHub"
3. **Select Repository**: Choose your `maslim360-store` repository
4. **Configure**:
   - **Root Directory**: `apps/backend`
   - Railway will auto-detect it's a Node.js project
5. **Set Environment Variables** in Railway dashboard:
   ```
   DATABASE_URL=postgresql://postgres:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   PORT=4000
   FRONTEND_URL=https://your-vercel-frontend.vercel.app
   NODE_ENV=production
   ```
6. **Get Your Backend URL**: After deployment, Railway will give you a URL like:
   ```
   https://your-project-name.railway.app
   ```
   Your API will be at: `https://your-project-name.railway.app/api`

### Option 2: Render

1. **Sign up**: Go to https://render.com
2. **New Web Service**: Connect your GitHub repo
3. **Configure**:
   - **Root Directory**: `apps/backend`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start:prod`
   - **Environment**: Node
4. **Set Environment Variables** (same as Railway)
5. **Get Your Backend URL**: `https://your-project-name.onrender.com/api`

### Option 3: Keep Local (Development Only)

If you want to keep backend local for now:
- Backend URL: `http://localhost:4000/api`
- **Note**: This won't work with Vercel frontend (Vercel can't access localhost)

## After Deploying Backend

1. **Update Vercel Environment Variable**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add/Update: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-url.railway.app/api` (or your actual backend URL)
   - Redeploy frontend

2. **Update Backend CORS**:
   - Make sure `FRONTEND_URL` in backend env points to your Vercel frontend URL
   - Example: `FRONTEND_URL=https://your-frontend.vercel.app`

## Database Setup

If using Railway:
- Railway provides PostgreSQL databases
- Create a new PostgreSQL service
- Railway will automatically set `DATABASE_URL` environment variable
- Run migrations: `pnpm prisma migrate deploy` (or set up in Railway)

## Testing Your Backend

Once deployed, test these endpoints:
- `https://your-backend-url/api/docs` - Swagger documentation
- `https://your-backend-url/api/products` - Products endpoint
- `https://your-backend-url/api/health` - Health check (if implemented)

## Current Status

✅ **Backend Code**: Ready to deploy
✅ **Railway Config**: Created (`apps/backend/railway.json`)
⏳ **Backend Deployment**: Not deployed yet
⏳ **Frontend Environment Variable**: Needs to be set after backend deployment

