# Deploy with Netlify Functions (Everything on Netlify!)

## Overview

I've created Netlify serverless functions so **everything** (frontend + backend) is hosted on Netlify. No separate backend deployment needed!

## What I Created

1. **Netlify Functions** (in `netlify/functions/`):
   - `newsletter-subscribe.js` - Stores newsletter subscriptions in MongoDB
   - `contact-submit.js` - Stores contact submissions in MongoDB

2. **Configuration**:
   - `frontend/netlify.toml` - Routes API calls to functions
   - Updated `frontend/.env.production` - API URL points to same Netlify domain

## Setup Steps

### Step 1: Set up MongoDB Atlas (3 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (use Google/GitHub for speed)
3. Create a free cluster (M0):
   - Click "Build a Database"
   - Choose "M0 FREE"
   - Select region
   - Click "Create"
4. Create database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `aurabyshenoi`
   - Password: Click "Autogenerate Secure Password" → **COPY IT**
   - Click "Add User"
5. Allow network access:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
6. Get connection string:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Add database name: `mongodb+srv://aurabyshenoi:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/artist-portfolio?retryWrites=true&w=majority`
   - **SAVE THIS STRING**

### Step 2: Add MongoDB to Netlify (2 minutes)

1. Go to https://app.netlify.com
2. Go to your site: `aurabyshenoi`
3. Click "Site configuration" → "Environment variables"
4. Click "Add a variable"
5. Add:
   ```
   Key: MONGODB_URI
   Value: <paste your MongoDB connection string>
   ```
6. Click "Create variable"

### Step 3: Deploy (1 minute)

```bash
cd frontend
npm run build
netlify deploy --prod
```

That's it! Netlify will automatically deploy the functions along with your frontend.

## How It Works

When someone visits your site:
- Frontend: `https://aurabyshenoi.netlify.app`
- Newsletter API: `https://aurabyshenoi.netlify.app/api/newsletter/subscribe`
- Contact API: `https://aurabyshenoi.netlify.app/api/contact`

The API calls are automatically routed to Netlify Functions, which store data in MongoDB.

## Test It

After deployment, test the functions:

```bash
# Test newsletter subscription
curl -X POST https://aurabyshenoi.netlify.app/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"homepage"}'

# Test contact form
curl -X POST https://aurabyshenoi.netlify.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"This is a test message"}'
```

## Verify Data Storage

1. Go to MongoDB Atlas
2. Click "Database" → "Browse Collections"
3. You should see:
   - `newsletters` collection with subscriptions
   - `contacts` collection with contact submissions

## Benefits

✅ **Everything on Netlify** - No separate backend hosting
✅ **Serverless** - Functions only run when called (cost-effective)
✅ **Same Domain** - No CORS issues
✅ **Free Tier** - Netlify free tier includes 125k function invocations/month
✅ **Auto-scaling** - Handles traffic spikes automatically

## Troubleshooting

### Functions not working
- Check Netlify function logs: Site → Functions → View logs
- Verify MONGODB_URI environment variable is set correctly
- Make sure MongoDB Atlas allows access from anywhere (0.0.0.0/0)

### CORS errors
- Functions are on same domain, so no CORS issues
- If you see CORS errors, check browser console for actual error

### Database connection errors
- Verify MongoDB connection string format
- Check password is correct (no special characters that need encoding)
- Ensure MongoDB user has read/write permissions
