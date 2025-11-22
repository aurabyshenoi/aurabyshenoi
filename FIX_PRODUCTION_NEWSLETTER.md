# Fix Production Newsletter Subscription

## Problem
The newsletter subscription on the production site (Netlify) isn't working because the Netlify Function needs a MongoDB connection string.

## Solution: Add MongoDB URI to Netlify

### Option 1: Use MongoDB Atlas (Recommended - Free)

#### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a new cluster (M0 Free tier - no credit card required)
4. Wait for cluster to be created (2-3 minutes)

#### Step 2: Create Database User
1. In Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `aurabyshenoi`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

#### Step 3: Whitelist All IPs
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. IP Address: `0.0.0.0/0`
5. Click "Confirm"

#### Step 4: Get Connection String
1. Go to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 4.1 or later
4. Copy the connection string
5. It looks like: `mongodb+srv://aurabyshenoi:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Replace `<password>` with your actual password
7. Add database name: `mongodb+srv://aurabyshenoi:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/artist-portfolio?retryWrites=true&w=majority`

#### Step 5: Add to Netlify
1. Go to https://app.netlify.com
2. Select your site: "aurabyshenoi"
3. Go to "Site configuration" → "Environment variables"
4. Click "Add a variable"
5. Key: `MONGODB_URI`
6. Value: Paste your connection string (with password replaced)
7. Click "Create variable"

#### Step 6: Redeploy
1. Go to "Deploys" tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait for deployment to complete
4. Test newsletter subscription on your site!

---

### Option 2: Use Local MongoDB (Development Only)

For local testing with Netlify Dev:

1. Make sure MongoDB is running locally:
   ```bash
   mongod --dbpath /opt/homebrew/var/mongodb
   ```

2. Create `.env` file in `frontend/netlify/functions/`:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/artist-portfolio
   ```

3. Run Netlify Dev:
   ```bash
   cd frontend
   netlify dev
   ```

This will run the functions locally with your local MongoDB.

---

## Quick Commands

### Start Everything Locally
```bash
# Terminal 1: MongoDB
mongod --dbpath /opt/homebrew/var/mongodb

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Test Netlify Functions Locally
```bash
# Terminal 1: MongoDB
mongod --dbpath /opt/homebrew/var/mongodb

# Terminal 2: Netlify Dev
cd frontend
netlify dev
```

---

## Verification

After adding MONGODB_URI to Netlify and redeploying:

1. Visit https://aurabyshenoi.netlify.app
2. Scroll to newsletter section
3. Enter an email and click Subscribe
4. You should see: "Successfully subscribed to newsletter!"

---

## Current Status

✅ **Local Development**: Working
- MongoDB: Running on port 27017
- Frontend: Running on http://localhost:5173

❌ **Production**: Newsletter not working
- Needs: MONGODB_URI environment variable in Netlify
- Solution: Follow steps above to add MongoDB Atlas connection string

---

## Summary

The app uses **Netlify Functions** (serverless) instead of a traditional backend server. The newsletter function is at `frontend/netlify/functions/newsletter-subscribe.js` and needs a MongoDB connection string to work in production.

**Next Step**: Set up MongoDB Atlas (free) and add the connection string to Netlify environment variables.
