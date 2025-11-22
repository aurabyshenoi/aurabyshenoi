# GoDaddy DNS Setup for aurabyshenoi.com

## Step-by-Step Guide with Screenshots Instructions

### Step 1: Access GoDaddy DNS Management

1. Go to https://www.godaddy.com
2. Click **Sign In** (top right)
3. Enter your GoDaddy username and password
4. Click **My Products** in the top menu
5. Find **Domains** section
6. You should see **aurabyshenoi.com** listed
7. Click the **DNS** button next to aurabyshenoi.com
   - Or click the three dots ⋮ → **Manage DNS**

### Step 2: Remove Conflicting Records (Important!)

Before adding new records, you need to remove any existing A or CNAME records for @ and www:

1. Look for existing records with:
   - Type: **A** and Name: **@**
   - Type: **CNAME** and Name: **www**
   - Type: **A** and Name: **www**
2. Click the **pencil icon** (edit) or **trash icon** (delete) next to each
3. Delete or disable these records

**Common records to remove:**
- A record pointing to GoDaddy's parking page (usually 184.168.x.x)
- CNAME for www pointing to @

### Step 3: Add A Record for Root Domain

1. Scroll to **DNS Records** section
2. Click **Add** button (or **Add New Record**)
3. Fill in:
   - **Type**: Select **A**
   - **Name**: Type **@** (this means root domain)
   - **Value**: Type **76.76.21.21**
   - **TTL**: Select **1 Hour** (or leave as default)
4. Click **Save**

### Step 4: Add CNAME Record for WWW

1. Click **Add** button again
2. Fill in:
   - **Type**: Select **CNAME**
   - **Name**: Type **www**
   - **Value**: Type **cname.vercel-dns.com**
   - **TTL**: Select **1 Hour** (or leave as default)
3. Click **Save**

### Step 5: Save All Changes

1. Look for a **Save** or **Save All Changes** button at the bottom
2. Click it to apply all DNS changes
3. You should see a confirmation message

---

## Your Final DNS Records Should Look Like This:

```
Type    Name    Value                   TTL
----    ----    -----                   ---
A       @       76.76.21.21            1 Hour
CNAME   www     cname.vercel-dns.com   1 Hour
```

---

## Visual Guide

### What You'll See in GoDaddy:

**DNS Management Page:**
```
┌─────────────────────────────────────────┐
│ DNS Management for aurabyshenoi.com     │
├─────────────────────────────────────────┤
│                                         │
│ [Add] button                            │
│                                         │
│ Type │ Name │ Value          │ TTL     │
│──────┼──────┼────────────────┼─────────│
│  A   │  @   │ 76.76.21.21    │ 1 Hour  │
│ CNAME│ www  │ cname.vercel...│ 1 Hour  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Verification

### Check if DNS is Working

After saving, wait 5-10 minutes, then check:

**Option 1: Online Tool**
1. Go to https://dnschecker.org
2. Enter: `aurabyshenoi.com`
3. Select: **A**
4. Click **Search**
5. You should see **76.76.21.21** in results

**Option 2: Command Line**
```bash
# Check A record
nslookup aurabyshenoi.com

# Check CNAME record
nslookup www.aurabyshenoi.com
```

---

## Timeline

- **DNS changes save**: Immediate in GoDaddy
- **DNS propagation**: 5 minutes to 48 hours (usually 15-30 minutes)
- **SSL certificate**: Automatic after DNS verified (5-10 minutes)

---

## Troubleshooting

### "Can't find DNS settings"

1. Make sure you're logged into GoDaddy
2. Go to: https://dcc.godaddy.com/manage/aurabyshenoi.com/dns
3. Or: My Products → Domains → aurabyshenoi.com → DNS

### "Record already exists" error

- You need to delete the existing record first
- Click the trash icon next to the old record
- Then add the new one

### "Invalid value" error

- Make sure there are no extra spaces
- For A record: exactly `76.76.21.21`
- For CNAME: exactly `cname.vercel-dns.com`
- No http:// or https:// prefix

### DNS not propagating

- Clear your browser cache
- Try incognito/private mode
- Wait longer (can take up to 48 hours)
- Check: https://dnschecker.org

---

## After DNS is Set Up

1. Wait 15-30 minutes
2. Go to Vercel dashboard: https://vercel.com/dashboard
3. Your project → Settings → Domains
4. Vercel should show "Valid Configuration" ✓
5. Visit https://aurabyshenoi.com
6. Your site is live! 🎉

---

## Quick Reference

**GoDaddy DNS Management:**
- Direct link: https://dcc.godaddy.com/manage/aurabyshenoi.com/dns

**Records to add:**
```
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

**Check DNS:**
- https://dnschecker.org

**Vercel Dashboard:**
- https://vercel.com/dashboard

---

## Need Help?

If you get stuck:
1. Take a screenshot of your GoDaddy DNS page
2. Check that records match exactly as shown above
3. Wait 30 minutes and try again
4. Contact GoDaddy support if DNS won't save
