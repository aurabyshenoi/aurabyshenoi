#!/bin/bash

echo "🚀 Quick Backend Deployment to Railway"
echo "========================================"
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

echo ""
echo "📦 Deploying backend to Railway..."
cd backend

# Initialize project if not already done
if [ ! -f "railway.toml" ]; then
    echo "Initializing Railway project..."
    railway init
fi

# Add MongoDB if not already added
echo "Adding MongoDB..."
railway add

# Set environment variables
echo "Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_EXPIRES_IN=7d
railway variables set ADMIN_USERNAME=aurabyshenoi
railway variables set ARTIST_EMAIL=aurabyshenoi@gmail.com
railway variables set CORS_ORIGIN=https://aurabyshenoi.netlify.app

echo ""
echo "⚠️  IMPORTANT: Set your admin password manually:"
echo "railway variables set ADMIN_PASSWORD=YourSecurePassword"
echo ""

# Deploy
echo "Deploying..."
railway up

# Get domain
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your backend URL:"
railway domain

echo ""
echo "📝 Next steps:"
echo "1. Copy the backend URL above"
echo "2. Update frontend/.env.production with: VITE_API_URL=<your-backend-url>"
echo "3. Rebuild and redeploy frontend:"
echo "   cd ../frontend"
echo "   npm run build"
echo "   netlify deploy --prod"
