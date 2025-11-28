# Cloudinary Image Storage Setup Guide

## Overview
The MasLim360 store now supports Cloudinary for image storage. Images can be stored either:
1. **Cloudinary** (Recommended) - Cloud-based image storage with CDN
2. **Local Storage** (Fallback) - Files stored on server filesystem

## Setup Instructions

### 1. Install Cloudinary Package

```bash
cd apps/backend
npm install cloudinary
# or
pnpm add cloudinary
```

### 2. Get Cloudinary Credentials

1. Sign up for a free account at [https://cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 3. Configure Environment Variables

Add these to your `apps/backend/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: Local storage fallback
UPLOAD_DIR=./uploads
API_URL=http://localhost:4000
```

### 4. How It Works

- **If Cloudinary is configured**: Images are uploaded directly to Cloudinary and URLs are returned
- **If Cloudinary is NOT configured**: Images are stored locally in the `uploads` folder

The system automatically detects which storage method to use based on whether `CLOUDINARY_CLOUD_NAME` is set.

### 5. Image Upload Endpoint

The upload endpoint remains the same:
- **POST** `/api/upload/image`
- Requires authentication (JWT token)
- Accepts multipart/form-data with `file` field

### 6. Benefits of Cloudinary

- ✅ CDN delivery for fast image loading
- ✅ Automatic image optimization
- ✅ Image transformations (resize, crop, etc.)
- ✅ No server storage space needed
- ✅ Scalable for production

### 7. Testing

After setup, test the upload:
1. Register/login as a seller
2. Go to Seller Dashboard
3. Try uploading a product image
4. Check the returned URL - it should be a Cloudinary URL (e.g., `https://res.cloudinary.com/...`)

## Troubleshooting

### Images not uploading
- Check that Cloudinary credentials are correct
- Verify the `cloudinary` package is installed
- Check server logs for errors

### Fallback to local storage
- If Cloudinary credentials are missing, the system automatically uses local storage
- Make sure the `uploads` folder exists and is writable

### Image URLs not working
- For local storage: Ensure `API_URL` is set correctly
- For Cloudinary: URLs should work automatically via CDN

