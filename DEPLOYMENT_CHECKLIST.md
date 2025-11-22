# Deployment Checklist for aurabyshenoi.com

## ✅ Complete Deployment Checklist

### Phase 1: Deploy to Vercel (10 minutes)

- [ ] **1.1** Run deployment script
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

- [ ] **1.2** Note your Vercel deployment URL
  - Example: `https://aurabyshenoi-abc123.vercel.app`

---

### Phase 2: Add Domain in Vercel (2 minutes)

- [ ] **2.1** Go to https://vercel.com/dashboard
- [ ] **2.2** Click on your project
- [ ] **2.3** Go to **Settings** → **Domains**
- [ ] **2.4** Click **Add Domain**
- [ ] **2.5** Enter: `aurabyshenoi.com` → Click **Add**
- [ ] **2.6** Click **Add Domain** again
- [ ] **2.7** Enter: `www.aurabyshenoi.com` → Click **Add**

Vercel will show: "Invalid Configuration" - This is normal! Continue to Phase 3.

---

### Phase 3: Configure GoDaddy DNS (5 minutes)

- [ ] **3.1** Go to https://www.godaddy.com and sign in
- [ ] **3.2** Click **My Products**
- [ ] **3.3** Find **aurabyshenoi.com** → Click **DNS**
- [ ] **3.4** Delete any existing A or CNAME records for @ and www
- [ ] **3.5** Click **Add** button
- [ ] **3.6** Add A Record:
  - Type: **A**
  - Name: **@**
  - Value: **76.76.21.21**
  - TTL: **1 Hour**
  - Click **Save**
- [ ] **3.7** Click **Add** button again
- [ ] **3.8** Add CNAME Record:
  - Type: **CNAME**
  - Name: **www**
  - Value: **cname.vercel-dns.com**
  - TTL: **1 Hour**
  - Click **Save**
- [ ] **3.9** Click **Save All Changes** at bottom

**See detailed guide:** `GODADDY_DNS_SETUP.md`

---

### Phase 4: Set Up MongoDB (10 minutes)

- [ ] **4.1** Go to https://www.mongodb.com/cloud/atlas/register
- [ ] **4.2** Create free account (M0 tier - no credit card needed)
- [ ] **4.3** Create new cluster (takes 2-3 minutes)
- [ ] **4.4** Create database user:
  - Username: `aurabyshenoi`
  - Password: (generate secure password - save it!)
- [ ] **4.5** Add IP whitelist: `0.0.0.0/0` (allow from anywhere)
- [ ] **4.6** Get connection string:
  - Click **Connect** → **Connect your application**
  - Copy connection string
  - Replace `<password>` with your password
  - Add database name: `/artist-portfolio`
  - Final format: `mongodb+srv://aurabyshenoi:PASSWORD@cluster0.xxxxx.mongodb.net/artist-portfolio?retryWrites=true&w=majority`

---

### Phase 5: Add Environment Variables (2 minutes)

- [ ] **5.1** Go to Vercel dashboard: https://vercel.com/dashboard
- [ ] **5.2** Click your project
- [ ] **5.3** Go to **Settings** → **Environment Variables**
- [ ] **5.4** Click **Add New**
- [ ] **5.5** Add variable:
  - Key: `MONGODB_URI`
  - Value: (paste your MongoDB connection string)
  - Environment: Select all (Production, Preview, Development)
  - Click **Save**
- [ ] **5.6** Redeploy:
  - Go to **Deployments** tab
  - Click ⋮ on latest deployment → **Redeploy**

---

### Phase 6: Verify Everything Works (15-30 minutes)

- [ ] **6.1** Wait 15-30 minutes for DNS propagation
- [ ] **6.2** Check DNS: https://dnschecker.org
  - Enter: `aurabyshenoi.com`
  - Should show: `76.76.21.21`
- [ ] **6.3** Check Vercel domain status:
  - Vercel dashboard → Settings → Domains
  - Should show: "Valid Configuration" ✓
- [ ] **6.4** Visit https://aurabyshenoi.com
  - Site should load
  - Should have HTTPS (🔒 padlock icon)
- [ ] **6.5** Test newsletter subscription:
  - Scroll to newsletter section
  - Enter test email
  - Click Subscribe
  - Should see: "Successfully subscribed!"

---

## 🎉 Success Criteria

Your deployment is complete when:

✅ https://aurabyshenoi.com loads your site
✅ https://www.aurabyshenoi.com redirects to main domain
✅ HTTPS/SSL is working (green padlock)
✅ Newsletter subscription works
✅ All images and assets load correctly

---

## 📊 Status Tracking

| Phase | Status | Time | Notes |
|-------|--------|------|-------|
| 1. Deploy to Vercel | ⬜ | 10 min | |
| 2. Add Domain | ⬜ | 2 min | |
| 3. Configure DNS | ⬜ | 5 min | |
| 4. Set Up MongoDB | ⬜ | 10 min | |
| 5. Environment Vars | ⬜ | 2 min | |
| 6. Verify | ⬜ | 15-30 min | |

**Total Time:** ~45-60 minutes

---

## 🆘 Troubleshooting

**Issue:** DNS not propagating
- **Solution:** Wait longer (up to 48 hours), check https://dnschecker.org

**Issue:** Newsletter not working
- **Solution:** Check MONGODB_URI is set in Vercel environment variables

**Issue:** Site shows 404
- **Solution:** Check Vercel deployment logs, ensure build succeeded

**Issue:** SSL certificate pending
- **Solution:** Wait 5-10 minutes after DNS verification, Vercel auto-provisions

---

## 📚 Detailed Guides

- **GoDaddy DNS:** `GODADDY_DNS_SETUP.md`
- **Quick Start:** `QUICK_START.md`
- **All Options:** `DEPLOY_TO_CUSTOM_DOMAIN.md`
- **DNS Help:** `DNS_SETUP_GUIDE.md`

---

## 🚀 Ready to Start?

Run this command to begin:
```bash
./deploy-vercel.sh
```

Then follow this checklist step by step!
