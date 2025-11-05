# Deployment Guide

## Vercel Deployment

### Configuration
The project includes a `vercel.json` file that configures Vercel to:
- Build from the `apps/frontend` directory
- Use pnpm for package management
- Use Next.js framework

### Steps to Deploy on Vercel:

1. **Connect your GitHub repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project Settings:**
   - **Root Directory**: `apps/frontend` (or leave empty if using vercel.json)
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm --filter frontend build` (or leave default)
   - **Output Directory**: `.next` (or leave default)
   - **Install Command**: `pnpm install` (or leave default)

3. **Set Environment Variables:**
   Go to Project Settings → Environment Variables and add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
   ```
   (Replace with your actual backend URL)

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your frontend

### Troubleshooting Vercel Build Issues:

1. **If build fails with "Cannot find module":**
   - Make sure `installCommand` is set to `pnpm install`
   - Check that `pnpm-workspace.yaml` is in the root

2. **If build fails with "Command not found: pnpm":**
   - In Vercel project settings, make sure Node.js version is 18+
   - Add `engines` in package.json (already done)

3. **If build fails with missing dependencies:**
   - Clear Vercel cache and rebuild
   - Check that all dependencies are in `apps/frontend/package.json`

## GitHub Pages Deployment

### Option 1: Use GitHub Actions (Recommended)
The project includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that will:
- Build the frontend automatically on push to `main`
- Deploy to GitHub Pages

**Setup:**
1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. The workflow will run automatically on push

**Note:** GitHub Pages serves static files, so this requires your Next.js app to be configured for static export. Currently, the app uses client-side rendering which should work, but API calls will need your backend to be accessible.

### Option 2: Manual Static Export
If you want to export static files for GitHub Pages:

1. Update `apps/frontend/next.config.js`:
```js
const nextConfig = {
  output: 'export',
  // ... rest of config
}
```

2. Build and export:
```bash
cd apps/frontend
pnpm build
```

3. The `out` directory will contain static files to deploy

### Important Notes:

- **GitHub Pages points to root**: The workflow is configured to build from `apps/frontend` and deploy the `.next` output
- **Backend URL**: Make sure to set `NEXT_PUBLIC_API_URL` in your environment variables or GitHub Secrets
- **Static Export Limitations**: If using static export, dynamic routes and API routes won't work

## Backend Deployment

For the backend, you can deploy to:
- **Railway**: [railway.app](https://railway.app)
- **Render**: [render.com](https://render.com)
- **Heroku**: [heroku.com](https://heroku.com)
- **Vercel**: Can also deploy backend (with serverless functions)

Make sure to set all environment variables in your backend deployment platform.

