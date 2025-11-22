# Deploy to aurabyshenoi.com - Complete Guide

## Overview
You have the domain **aurabyshenoi.com** and want to host your website there. Here are the best options:

---

## Option 1: Vercel (Recommended - Easiest)

### Why Vercel?
- ✅ Free hosting with custom domain
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN
- ✅ Serverless functions support (for newsletter)
- ✅ Easy custom domain setup
- ✅ Automatic deployments from GitHub

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? aurabyshenoi
# - Directory? ./
# - Override settings? No
```

### Step 2: Add Custom Domain

1. Go to https://vercel.com/dashboard
2. Select your project "aurabyshenoi"
3. Go to Settings → Domains
4. Add domain: `aurabyshenoi.com`
5. Add domain: `www.aurabyshenoi.com`
6. Vercel will show you DNS records to add

### Step 3: Configure DNS (at your domain registrar)

Add these DNS records where you bought the domain:

**For apex domain (aurabyshenoi.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 4: Move Netlify Functions to Vercel

Vercel uses a different structure. I'll convert the functions for you.

---

## Option 2: Cloudflare Pages (Also Great)

### Why Cloudflare Pages?
- ✅ Free hosting
- ✅ Excellent performance
- ✅ Built-in DDoS protection
- ✅ Easy if domain is on Cloudflare

### Step 1: Deploy to Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Pages → Create a project
3. Connect to GitHub → Select repository
4. Build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`
5. Click "Save and Deploy"

### Step 2: Add Custom Domain

1. In Cloudflare Pages project → Custom domains
2. Add `aurabyshenoi.com`
3. Add `www.aurabyshenoi.com`
4. If domain is on Cloudflare, it auto-configures!

---

## Option 3: Traditional VPS (DigitalOcean/Linode)

### Why VPS?
- ✅ Full control
- ✅ Can run MongoDB on same server
- ✅ No serverless limitations
- ⚠️ Requires more setup

### Quick Setup with DigitalOcean

1. Create droplet (Ubuntu 22.04, $6/month)
2. SSH into server
3. Install Node.js, MongoDB, Nginx
4. Deploy app
5. Configure Nginx as reverse proxy
6. Set up SSL with Let's Encrypt

I can provide detailed VPS setup if you prefer this option.

---

## Option 4: Keep Netlify, Just Add Custom Domain

### If you want to keep using Netlify:

1. Go to https://app.netlify.com
2. Site settings → Domain management
3. Add custom domain: `aurabyshenoi.com`
4. Netlify will show DNS records
5. Add DNS records at your domain registrar:

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME  
Name: www
Value: aurabyshenoi.netlify.app
```

---

## My Recommendation: Vercel

**Best for your use case because:**
1. Easiest migration from Netlify
2. Similar serverless functions (easy to convert)
3. Excellent performance
4. Free tier is generous
5. Custom domain setup is simple

---

## Next Steps

**Tell me which option you prefer, and I'll:**
1. Convert your Netlify Functions to work with that platform
2. Set up MongoDB connection (Atlas for serverless, or local for VPS)
3. Create deployment scripts
4. Provide exact DNS settings for your domain registrar
5. Deploy your site

**Quick Start (Vercel):**
```bash
npm install -g vercel
cd frontend
vercel login
vercel
```

Then add your custom domain in the Vercel dashboard!
