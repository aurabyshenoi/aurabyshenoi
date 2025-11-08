# Deploy Backend NOW - Step by Step

## Option 1: Railway (Recommended - Easiest with MongoDB included)

### Step 1: Login to Railway
```bash
railway login
```
This will open a browser window. Login with GitHub.

### Step 2: Initialize and Deploy
```bash
cd backend
railway init
# Select: "Create new project"
# Name it: aurabyshenoi-backend

# Add MongoDB
railway add
# Select: MongoDB

# Deploy
railway up
```

### Step 3: Set Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_EXPIRES_IN=7d
railway variables set ADMIN_USERNAME=aurabyshenoi
railway variables set ADMIN_PASSWORD=YourSecurePassword123
railway variables set ARTIST_EMAIL=aurabyshenoi@gmail.com
railway variables set CORS_ORIGIN=https://aurabyshenoi.netlify.app
```

### Step 4: Get Your Backend URL
```bash
railway domain
```
Copy the URL (e.g., `https://aurabyshenoi-backend-production.up.railway.app`)

### Step 5: Update Frontend
```bash
cd ../frontend
# Edit .env.production and change VITE_API_URL to your Railway URL
npm run build
netlify deploy --prod
```

---

## Option 2: Render (Free, but requires MongoDB Atlas)

### Step 1: Set up MongoDB Atlas
1. Go to https://mongodb.com/cloud/atlas/register
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string

### Step 2: Deploy to Render
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo: `aurabyshenoi/aurabyshenoi`
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables (see below)
6. Create Web Service

### Environment Variables for Render:
```
NODE_ENV=production
PORT=3001
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-random-32-char-string>
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=aurabyshenoi
ADMIN_PASSWORD=<your-secure-password>
ARTIST_EMAIL=aurabyshenoi@gmail.com
CORS_ORIGIN=https://aurabyshenoi.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Option 3: Quick Test with Ngrok (Temporary)

If you just want to test quickly:

```bash
# Terminal 1: Make sure MongoDB and backend are running
mongod --dbpath /opt/homebrew/var/mongodb

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Expose with ngrok
ngrok http 5001
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

Update frontend:
```bash
cd frontend
# Temporarily change .env.production VITE_API_URL to ngrok URL
npm run build
netlify deploy --prod
```

**Note**: Ngrok URLs expire when you close the terminal!

---

## After Backend is Deployed

### Test the Backend
```bash
# Replace with your actual backend URL
BACKEND_URL="https://your-backend-url.com"

# Health check
curl $BACKEND_URL/health

# Test newsletter
curl -X POST $BACKEND_URL/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Update Frontend and Redeploy
```bash
cd frontend
# Update .env.production with your backend URL
npm run build
netlify deploy --prod
```

---

## Recommended: Railway

Railway is the easiest because:
- ✅ Includes MongoDB (no separate setup needed)
- ✅ Automatic HTTPS
- ✅ Simple CLI deployment
- ✅ $5/month free credit
- ✅ No credit card required for trial

Just run:
```bash
railway login
cd backend
railway init
railway add  # Select MongoDB
railway up
railway domain  # Get your URL
```

Then update frontend and redeploy!
