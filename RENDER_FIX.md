# Render Deployment Fix - Choose One Option

## The Problem

Render is building from `apps/backend` directory, but the pnpm workspace files (`pnpm-lock.yaml`, `pnpm-workspace.yaml`) are in the root directory, outside the build context.

## Solution: Choose ONE Option

### Option 1: Build from Root (Recommended - Use Root Dockerfile)

**In Render Dashboard:**
1. Go to your service → Settings
2. **Root Directory**: Leave **EMPTY** or set to `/` (repository root)
3. **Dockerfile Path**: `Dockerfile` (uses the root Dockerfile)
4. **Environment**: Docker

This uses the `Dockerfile` in the root which has access to all workspace files.

**Redeploy** - This should work now!

---

### Option 2: Build from apps/backend (Use Standalone Dockerfile)

**In Render Dashboard:**
1. **Root Directory**: `apps/backend`
2. **Dockerfile Path**: `Dockerfile.standalone` (rename the file)
3. **Environment**: Docker

**Important**: This option uses `npm` instead of `pnpm` because it can't access workspace files. You'll need to:

1. Rename the standalone Dockerfile:
   ```bash
   # In your repo, rename:
   apps/backend/Dockerfile.standalone → apps/backend/Dockerfile
   ```

2. **OR** in Render, set Dockerfile Path to: `Dockerfile.standalone`

**Note**: This approach doesn't use pnpm workspace, so it installs dependencies directly from `apps/backend/package.json`.

---

## Recommended: Option 1

**Steps:**
1. In Render: Set **Root Directory** to **EMPTY** (or delete the value)
2. Set **Dockerfile Path** to: `Dockerfile`
3. Save and redeploy

The root `Dockerfile` is already configured to handle the monorepo structure correctly.

---

## Quick Checklist

- [ ] Root Directory in Render: **EMPTY** (not `apps/backend`)
- [ ] Dockerfile Path: `Dockerfile` (root level)
- [ ] Environment variables set (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Redeploy

---

## After Successful Build

1. Get your Render URL: `https://your-app.onrender.com`
2. API will be at: `https://your-app.onrender.com/api`
3. Update Vercel: Set `NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api`

