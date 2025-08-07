# Vercel Deployment Guide

## Option 1: Using Environment Variables (Recommended)

1. Deploy your backend to Render/Railway/Heroku first
2. Get your backend URL (e.g., https://your-app.onrender.com)
3. In Vercel Dashboard:
   - Go to Settings → Environment Variables
   - Add: NEXT_PUBLIC_API_URL = https://your-backend-url.onrender.com
   - Select all environments (Production, Preview, Development)
4. Redeploy your frontend

## Option 2: Using Vercel CLI with Secrets

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add secret (replace with your actual backend URL)
vercel secrets add whatsapp-api-url "https://your-backend-url.onrender.com"

# Deploy
vercel --prod
```

Then restore the original vercel.json content if you prefer using secrets.

## Backend Deployment URLs

Common backend deployment platforms:
- **Render**: https://your-app.onrender.com
- **Railway**: https://your-app.up.railway.app  
- **Heroku**: https://your-app.herokuapp.com

## Troubleshooting

If you still get the error:
1. Check that the environment variable is set in Vercel dashboard
2. Make sure you've redeployed after setting the variable
3. Verify the backend URL is accessible
4. Check browser console for network errors
