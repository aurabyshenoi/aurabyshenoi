# Backend Deployment Guide

## Quick Deploy to Render.com

### Step 1: Set up MongoDB Atlas (Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Create a database user:
   - Username: `aurabyshenoi`
   - Password: (generate a secure password)
5. Add IP Access: `0.0.0.0/0` (allow from anywhere)
6. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://aurabyshenoi:<password>@cluster0.xxxxx.mongodb.net/artist-portfolio?retryWrites=true&w=majority`

### Step 2: Deploy Backend to Render

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `aurabyshenoi/aurabyshenoi`
4. Configure the service:
   - **Name**: `aurabyshenoi-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-random-secret-key>
   JWT_EXPIRES_IN=7d
   ADMIN_USERNAME=aurabyshenoi
   ADMIN_PASSWORD=<your-secure-admin-password>
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   ARTIST_EMAIL=aurabyshenoi@gmail.com
   CORS_ORIGIN=https://aurabyshenoi.netlify.app,https://aurabyshenoi.com
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. Click "Create Web Service"

### Step 3: Update Frontend Configuration

Once your backend is deployed, you'll get a URL like: `https://aurabyshenoi-backend.onrender.com`

Update `frontend/.env.production`:
```bash
VITE_API_URL=https://aurabyshenoi-backend.onrender.com
```

Then rebuild and redeploy the frontend:
```bash
cd frontend
npm run build
netlify deploy --prod
```

## Alternative: Quick Deploy with Railway

### Step 1: Deploy to Railway

1. Go to https://railway.app and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the backend
5. Add environment variables (same as above)
6. Railway will provide a URL

### Step 2: Add MongoDB

1. In Railway project, click "New" → "Database" → "Add MongoDB"
2. Railway will automatically set `MONGODB_URI` environment variable
3. No additional configuration needed!

## Testing the Deployment

Once deployed, test the backend:

```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Test newsletter subscription
curl -X POST https://your-backend-url.onrender.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Important Notes

- **Render Free Tier**: Service spins down after 15 minutes of inactivity (first request may be slow)
- **MongoDB Atlas Free Tier**: 512MB storage, sufficient for this application
- **Railway Free Tier**: $5 credit per month, includes MongoDB
- Remember to update CORS_ORIGIN to include your production domain
- Keep your JWT_SECRET and database passwords secure
