# Update Your GoDaddy DNS Records NOW

## ⚠️ Action Required: Update DNS Records

Vercel has provided new DNS records for your domain. You need to update them in GoDaddy.

---

## Quick Steps to Update

### 1. Go to GoDaddy DNS Management

1. Visit: https://dcc.godaddy.com/manage/aurabyshenoi.com/dns
2. Or: https://www.godaddy.com → Sign In → My Products → aurabyshenoi.com → DNS

### 2. Update the A Record

Find the existing A record for `@` and **EDIT** it (or delete and add new):

```
Type: A
Name: @
Value: 216.198.79.1  ← NEW VALUE
TTL: 1 Hour
```

**Old value was:** `76.76.21.21` (if you had this, replace it)

### 3. Update the CNAME Record

Find the existing CNAME record for `www` and **EDIT** it (or delete and add new):

```
Type: CNAME
Name: www
Value: b65634b8f144b946.vercel-dns-017.com  ← NEW VALUE
TTL: 1 Hour
```

**Old value was:** `cname.vercel-dns.com` (if you had this, replace it)

### 4. Save Changes

Click **Save** or **Save All Changes** at the bottom of the page.

---

## Your Final DNS Records

After updating, your DNS records should look exactly like this:

```
┌──────┬──────┬──────────────────────────────────────┬────────┐
│ Type │ Name │ Value                                │ TTL    │
├──────┼──────┼──────────────────────────────────────┼────────┤
│ A    │ @    │ 216.198.79.1                        │ 1 Hour │
│ CNAME│ www  │ b65634b8f144b946.vercel-dns-017.com │ 1 Hour │
└──────┴──────┴──────────────────────────────────────┴────────┘
```

---

## Why Update?

Vercel is expanding their IP range and has assigned your domain new, dedicated DNS records. The old records will continue to work, but the new ones are recommended for better performance and reliability.

---

## Verification

After updating (wait 5-10 minutes):

1. Go to: https://dnschecker.org
2. Enter: `aurabyshenoi.com`
3. You should see: `216.198.79.1`

Or check in terminal:
```bash
nslookup aurabyshenoi.com
```

---

## Timeline

- **DNS update in GoDaddy**: Immediate
- **Propagation**: 5-30 minutes
- **Vercel verification**: Automatic after propagation
- **SSL certificate**: Automatic (5-10 minutes after verification)

---

## After DNS Updates

Once DNS propagates:

1. Visit: https://aurabyshenoi.com
2. Your site should load with HTTPS 🔒
3. Check Vercel dashboard - should show "Valid Configuration" ✓

---

## Need Help?

**Can't find DNS settings?**
- Direct link: https://dcc.godaddy.com/manage/aurabyshenoi.com/dns

**DNS not updating?**
- Make sure you clicked "Save All Changes"
- Wait 15-30 minutes
- Clear browser cache

**Still showing old IP?**
- Check: https://dnschecker.org
- Some locations may take longer to update
- Wait up to 48 hours for full global propagation

---

## Summary

**What to do:**
1. Update A record: `@` → `216.198.79.1`
2. Update CNAME: `www` → `b65634b8f144b946.vercel-dns-017.com`
3. Save changes
4. Wait 15-30 minutes
5. Visit https://aurabyshenoi.com 🎉

**Your site is deployed and ready - just update these DNS records!**
