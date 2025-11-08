# Deploy FastAPI Backend to Render

## Step 1: Set up MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a new cluster:
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select a region (choose one close to you)
   - Click "Create"
4. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `aurabyshenoi`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"
5. Whitelist IP addresses:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
6. Get your connection string:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://aurabyshenoi:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://aurabyshenoi:<password>@cluster0.xxxxx.mongodb.net/artist-portfolio?retryWrites=true&w=majority`

## Step 2: Deploy to Render

1. Go to https://render.com
2. Sign up or login (use GitHub for easy integration)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository:
   - Click "Connect account" if needed
   - Select repository: `aurabyshenoi/aurabyshenoi`
5. Configure the service:
   - **Name**: `aurabyshenoi-api`
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: `fastapi-backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
6. Add Environment Variables:
   - Click "Advanced" → "Add Environment Variable"
   - Add:
     ```
     MONGODB_URI = <your-mongodb-atlas-connection-string>
     ```
7. Click "Create Web Service"
8. Wait for deployment (takes 2-5 minutes)
9. Once deployed, you'll get a URL like: `https://aurabyshenoi-api.onrender.com`

## Step 3: Test Your Backend

Once deployed, test it:

```bash
# Health check
curl https://aurabyshenoi-api.onrender.com/health

# Test newsletter subscription
curl -X POST https://aurabyshenoi-api.onrender.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"homepage"}'

# Test contact form
curl -X POST https://aurabyshenoi-api.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"This is a test message"}'
```

## Step 4: Update Frontend

Once your backend is deployed:

1. Copy your Render URL (e.g., `https://aurabyshenoi-api.onrender.com`)
2. Update `frontend/.env.production`:
   ```bash
   VITE_API_URL=https://aurabyshenoi-api.onrender.com
   ```
3. Rebuild and redeploy frontend:
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod
   ```

## Step 5: Verify Everything Works

1. Visit https://aurabyshenoi.netlify.app
2. Try subscribing to the newsletter
3. Try submitting a contact form
4. Check your MongoDB Atlas database to see the stored data:
   - Go to MongoDB Atlas → Database → Browse Collections
   - You should see `newsletters` and `contacts` collections

## Important Notes

- **Render Free Tier**: Service spins down after 15 minutes of inactivity
- **First Request**: May take 30-60 seconds to wake up the service
- **MongoDB Atlas Free Tier**: 512MB storage (plenty for this app)
- **CORS**: Already configured for your Netlify domain

## Troubleshooting

### Backend not responding
- Check Render logs: Dashboard → Your Service → Logs
- Verify MongoDB connection string is correct
- Make sure MongoDB Atlas IP whitelist includes 0.0.0.0/0

### CORS errors
- Make sure your Netlify URL is in the CORS origins in `main.py`
- Redeploy if you changed CORS settings

### Database connection errors
- Verify MongoDB Atlas user has correct permissions
- Check that password in connection string is correct
- Ensure network access allows all IPs (0.0.0.0/0)
