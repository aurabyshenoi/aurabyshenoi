# DNS Setup for aurabyshenoi.com

## After Deploying to Vercel

### Step 1: Add Domain in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your project "aurabyshenoi"
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `aurabyshenoi.com` → Click **Add**
6. Enter: `www.aurabyshenoi.com` → Click **Add**

Vercel will show you the DNS records you need to add.

---

## DNS Records to Add

### At Your Domain Registrar (GoDaddy, Namecheap, etc.)

Go to your domain registrar's DNS management page and add these records:

### For Root Domain (aurabyshenoi.com)

**Option A: A Record (Recommended)**
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

**Option B: CNAME (if A record not supported)**
```
Type: CNAME
Name: @ (or leave blank)
Value: cname.vercel-dns.com
TTL: 3600
```

### For WWW Subdomain

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

## Domain Registrar Specific Instructions

### GoDaddy

1. Login to GoDaddy
2. Go to **My Products** → **Domains**
3. Click **DNS** next to aurabyshenoi.com
4. Click **Add** to add new records
5. Add the A and CNAME records above
6. Click **Save**

### Namecheap

1. Login to Namecheap
2. Go to **Domain List**
3. Click **Manage** next to aurabyshenoi.com
4. Go to **Advanced DNS** tab
5. Click **Add New Record**
6. Add the A and CNAME records above
7. Click **Save All Changes**

### Google Domains

1. Login to Google Domains
2. Click on aurabyshenoi.com
3. Go to **DNS** in left menu
4. Scroll to **Custom resource records**
5. Add the A and CNAME records above
6. Click **Add**

### Cloudflare

1. Login to Cloudflare
2. Select aurabyshenoi.com
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Add the A and CNAME records above
6. Make sure **Proxy status** is **Proxied** (orange cloud)
7. Click **Save**

---

## Verification

### Check DNS Propagation

After adding DNS records, check if they're working:

```bash
# Check A record
dig aurabyshenoi.com

# Check CNAME record
dig www.aurabyshenoi.com

# Or use online tool
# Visit: https://dnschecker.org
# Enter: aurabyshenoi.com
```

### Timeline

- **DNS propagation**: 5 minutes to 48 hours (usually 15-30 minutes)
- **SSL certificate**: Automatic after DNS is verified (5-10 minutes)

---

## After DNS is Set Up

1. Wait 15-30 minutes for DNS to propagate
2. Visit https://aurabyshenoi.com
3. Vercel will automatically provision SSL certificate
4. Your site will be live with HTTPS!

---

## Troubleshooting

### "Domain not verified" in Vercel

- Wait longer (DNS can take up to 48 hours)
- Double-check DNS records are correct
- Make sure there are no conflicting records

### "SSL certificate pending"

- This is normal, wait 5-10 minutes after DNS verification
- Vercel automatically provisions Let's Encrypt SSL

### Site not loading

- Clear browser cache
- Try incognito/private mode
- Check DNS propagation: https://dnschecker.org

---

## Environment Variables

Don't forget to set in Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `VITE_API_URL`: https://aurabyshenoi.com

---

## Quick Reference

**Your domains:**
- Main: https://aurabyshenoi.com
- WWW: https://www.aurabyshenoi.com

**Vercel Dashboard:**
- https://vercel.com/dashboard

**DNS Check:**
- https://dnschecker.org
