#!/bin/bash

echo "🚀 Deploying AuraByShenoi to Vercel with Custom Domain"
echo "======================================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel..."
    vercel login
fi

echo ""
echo "📁 Deploying from frontend directory..."
cd frontend

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps to add your custom domain:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Go to Settings → Domains"
echo "4. Add domain: aurabyshenoi.com"
echo "5. Add domain: www.aurabyshenoi.com"
echo ""
echo "🌐 DNS Configuration:"
echo "Add these records at your domain registrar:"
echo ""
echo "For aurabyshenoi.com:"
echo "  Type: A"
echo "  Name: @"
echo "  Value: 76.76.21.21"
echo ""
echo "For www.aurabyshenoi.com:"
echo "  Type: CNAME"
echo "  Name: www"
echo "  Value: cname.vercel-dns.com"
echo ""
echo "🔒 Don't forget to set environment variables in Vercel:"
echo "  MONGODB_URI=<your-mongodb-atlas-connection-string>"
echo ""
echo "Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
