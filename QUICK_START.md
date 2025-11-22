# Quick Start: Deploy to aurabyshenoi.com

## 🚀 Deploy in 3 Steps

### Step 1: Deploy to Vercel (2 minutes)

```bash
./deploy-vercel.sh
```

Or manually:
```bash
npm install -g vercel
cd frontend
vercel login
vercel --prod
```

### Step 2: Add Custom Domain in Vercel (1 minute)

1. Go to https://vercel.com/dashboard
2. Click your project
3. Settings → Domains
4. Add: `aurabyshenoi.com`
5. Add: `www.aurabyshenoi.com`

### Step 3: Configure DNS (5 minutes)

At your domain registrar (where you bought aurabyshenoi.com):

**Add A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Add CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Done!** Your site will be live at https://aurabyshenoi.com in 15-30 minutes.

---

## 🔧 Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/artist-portfolio
```

Get MongoDB URI from: https://mongodb.com/cloud/atlas (free tier)

---

## 📚 Detailed Guides

- **Full deployment options**: `DEPLOY_TO_CUSTOM_DOMAIN.md`
- **DNS setup help**: `DNS_SETUP_GUIDE.md`
- **Newsletter fix**: `FIX_PRODUCTION_NEWSLETTER.md`

---

## ✅ What's Included

- ✅ Vercel configuration (`frontend/vercel.json`)
- ✅ API routes for newsletter (`frontend/api/`)
- ✅ Deployment script (`deploy-vercel.sh`)
- ✅ Custom domain ready
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN

---

## 🆘 Need Help?

**DNS not working?**
- Wait 15-30 minutes for propagation
- Check: https://dnschecker.org

**Newsletter not working?**
- Add MONGODB_URI to Vercel environment variables
- See: `FIX_PRODUCTION_NEWSLETTER.md`

**Want different hosting?**
- See other options in: `DEPLOY_TO_CUSTOM_DOMAIN.md`
