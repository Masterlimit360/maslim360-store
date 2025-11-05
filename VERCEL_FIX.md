# Vercel Deployment Fix

## Important: Choose ONE of these options

### Option A: Root Directory NOT Set in Dashboard (Recommended)

**In Vercel Dashboard:**
- Settings → General → **Root Directory**: Leave EMPTY (or delete if set)
- Build Command: Leave empty (uses vercel.json)
- Output Directory: Leave empty (uses vercel.json)
- Install Command: Leave empty (uses vercel.json)

**Current vercel.json** is already configured correctly for this option.

### Option B: Root Directory Set to `apps/frontend`

**In Vercel Dashboard:**
- Settings → General → **Root Directory**: `apps/frontend`
- Build Command: `pnpm build` (or leave empty)
- Output Directory: `.next` (or leave empty)
- Install Command: `cd ../.. && pnpm install`

**Then update vercel.json to:**
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs"
}
```

## Recommended: Use Option A

1. **Make sure Root Directory is NOT set** in Vercel dashboard
2. **Current vercel.json** will work as-is
3. **Set environment variable** `NEXT_PUBLIC_API_URL` in Vercel dashboard
4. **Redeploy**

## If Build Still Fails:

Check the build logs in Vercel and look for:
- `pnpm: command not found` → Set Node.js version to 18+ in Vercel settings
- `Cannot find module` → Make sure `pnpm install` runs from root
- `Workspace not found` → Verify `pnpm-workspace.yaml` exists in root

## Test Locally First:

```bash
# From repository root
pnpm install
pnpm --filter frontend build
```

If this works locally, Option A should work on Vercel.

