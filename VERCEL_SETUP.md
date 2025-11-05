# Vercel Deployment Setup Guide

## Option 1: Using Vercel Dashboard (Recommended)

1. **Go to your Vercel project settings**
   - Navigate to: Settings → General

2. **Configure the following:**
   - **Root Directory**: `apps/frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: Leave empty (or use `pnpm build`)
   - **Output Directory**: Leave empty (defaults to `.next`)
   - **Install Command**: `pnpm install` (from root)
   - **Node.js Version**: 18.x or 20.x

3. **Environment Variables:**
   Add these in Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
   ```
   (Replace with your actual backend URL)

4. **Redeploy**

## Option 2: Using vercel.json (Current Setup)

The `vercel.json` file is configured, but you still need to set the **Root Directory** in Vercel dashboard:

1. Go to Project Settings → General
2. Set **Root Directory** to: `apps/frontend`
3. Save and redeploy

## Common Issues and Fixes:

### Issue: "Cannot find module" or "pnpm: command not found"
**Fix**: 
- In Vercel Settings → General, make sure:
  - Install Command is set to: `pnpm install`
  - Node.js version is 18+ (check in Settings → General)

### Issue: "Build failed" or "No output directory found"
**Fix**:
- Make sure Root Directory is set to `apps/frontend` in Vercel dashboard
- The output directory should be `.next` (relative to rootDirectory)

### Issue: "Workspace not found"
**Fix**:
- Make sure `pnpm-workspace.yaml` exists in the root (it does)
- Make sure `package.json` in root has `workspaces` defined (it does)

## Quick Checklist:

- [ ] Root Directory set to `apps/frontend` in Vercel dashboard
- [ ] Install Command: `pnpm install`
- [ ] Build Command: Leave empty or `pnpm build` (when rootDirectory is set)
- [ ] Output Directory: Leave empty (defaults to `.next`)
- [ ] Environment variable `NEXT_PUBLIC_API_URL` is set
- [ ] Node.js version is 18+ in Vercel settings

## Testing Locally:

To test if the build works locally:
```bash
# From root directory
pnpm install
pnpm --filter frontend build
```

If this works locally, it should work on Vercel.

