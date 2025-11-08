# Quick Setup Guide - Get Backend Running in 10 Minutes

## What You Need

1. MongoDB Atlas account (free) - for database
2. Render account (free) - for hosting backend

## Step-by-Step (Copy & Paste)

### 1. MongoDB Atlas Setup (3 minutes)

**Go to:** https://www.mongodb.com/cloud/atlas/register

1. Sign up with Google/GitHub (fastest)
2. Click "Build a Database" → Choose "M0 FREE"
3. Click "Create"
4. Create user:
   - Username: `aurabyshenoi`
   - Password: Click "Autogenerate Secure Password" → **COPY THIS PASSWORD**
   - Click "Create User"
5. Network Access:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Click "Confirm"
6. Get connection string:
   - Click "Connect" → "Drivers"
   - Copy the connection string
   - Replace `<password>` with your password from step 4
   - Add `/artist-portfolio` before the `?`
   - Final format: `mongodb+srv://aurabyshenoi:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/artist-portfolio?retryWrites=true&w=majority`
   - **SAVE THIS STRING**

### 2. Render Deployment (5 minutes)

**Go to:** https://render.com

1. Sign up with GitHub
2. Click "New +" → "Web Service"
3. Click "Connect account" → Authorize GitHub
4. Find and select: `aurabyshenoi/aurabyshenoi`
5. Fill in:
   ```
   Name: aurabyshenoi-api
   Region: Oregon (US West)
   Branch: main
   Root Directory: fastapi-backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```
6. Click "Advanced" → "Add Environment Variable":
   ```
   Key: MONGODB_URI
   Value: <paste your MongoDB connection string from step 1>
   ```
7. Click "Create Web Service"
8. Wait 2-3 minutes for deployment
9. **COPY YOUR URL** (looks like: `https://aurabyshenoi-api.onrender.com`)

### 3. Update Frontend (2 minutes)

```bash
# Open terminal in your project folder
cd frontend

# Edit .env.production file
# Change VITE_API_URL to your Render URL from step 2
# Example: VITE_API_URL=https://aurabyshenoi-api.onrender.com

# Rebuild and deploy
npm run build
netlify deploy --prod
```

### 4. Test It! (1 minute)

Visit: https://aurabyshenoi.netlify.app

1. Scroll to newsletter section
2. Enter your email and subscribe
3. Go to MongoDB Atlas → Database → Browse Collections
4. You should see your email in the `newsletters` collection!

## Done! 🎉

Both contact form and newsletter now store data in your MongoDB database.

## Quick Test Commands

```bash
# Replace with your actual Render URL
BACKEND_URL="https://aurabyshenoi-api.onrender.com"

# Test health
curl $BACKEND_URL/health

# Test newsletter
curl -X POST $BACKEND_URL/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Need Help?

If something doesn't work:
1. Check Render logs: Dashboard → aurabyshenoi-api → Logs
2. Verify MongoDB connection string has correct password
3. Make sure MongoDB allows access from anywhere (0.0.0.0/0)
