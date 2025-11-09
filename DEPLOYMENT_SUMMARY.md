# Deployment Summary - November 9, 2025

## Deployment Ature

**Platform**: Netlify (All-in-On)
- Frontend: Static React app
nctions
- Database: Mud)

## Live URLs

- **Production Site*fy.app
- **Admin Dashboard**: https://app.netlifyi

## Features Deployed

### 1. Newsletter Subscription ✓

- **Functionality**: Stores email addresses tabase
- **Endpoint**: `/api/newsletter/subscribe` → Netlify Function

- **Status**:onal

### 2. Contact Form ✓
- **Location**: Contact page
- **Functionality**: Sends emails via FormSubmit.co toom

- **Database**: Nted)
- **Stal

### 3. Gallery & Artwork Display ✓
- **Location**: Gallery page and hoon

- **Images**: Hosted in `/frontend/public/` directory
- *

## Configuration

### Environment Variabl
```
MONGODB_URI=mongodb+srv://aurabyshenoi:Niveority
NODE_VERSION=18
```

### MongoDB Atlas Setup
- **Cluster**: cnet
- **Database**: artist-portfolio
- **Collections**: 
  - `newsletters` - Email suns


unctions
Located in `frontend/netlify/functions/`:
1. `newsletter-subscribe.js` - Handles newsletter subscriptions
2. `contact-submit.js` - Backup contact  used)

## Files Cleaned Up

Rem
- ❌ `backend/`ons)
- ❌ `fastapi-backend/` - FastAPI backend (not needed)
- ❌ `nginx/` - Nginx configurat
- ❌ `docker-compose.yml` - Docker se
- ❌ed)

- ❌ Various deployment documenta

## How It Works

### Newsletter Subs
1. mepage
ibe`
3. Netlify redire`
4. Funccates
5. Stores email in MongoDB Atlas
6. Returns success/error response

### Contact Form Flow
1. User fiact form
2. Frontendco

4. User sees success message
5. No databquested)

## g

### Test Newsletter Sription

curl -X POST https://aurabyshenoi.netlify.app/api/newsletter/sub\
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"homepage"}'
```

sponse:
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter!",
  "data": {
    "email": "test@example.com",
"
  }
}
```

### Test Contact Form
Visit https://aurabyshenoi.netlify.app and navigat

intenanceture and maeced architmplifi
✅ Siy) (Netlifatformnt pl deployme Single removed
✅astructurend infrkebacunnecessary ✅ All ls
ing emaiform send Contact 
✅tabaseing to daiption storsubscrletter ble
✅ Newsand accessid eployetend dcs

✅ Frontriess Me# Succly

#ry secureil delive handles emaSubmit.co Forms
-cces aor frontendctions flify Funet on Nenabled CORS ons)
- Functilifyr Netuired foall IPs (reqw logured to alss confiNetwork acce `%40`
-  asodedenchich is URL-acter `@` wspecial charntains ord cooDB passw
- Mongs
ecurity Note S

##
```up changesoy to pick  # Redeplloy --prod etlify deplue"
n_NAME "vaARIABLEset Vy env:end
netlif front`bash
cdiables
``nt Varronmeate Envi### To Updploy

o de` t --prodploynetlify dely
3. Run `t localuild` to tes `npm run b. Run
2/`rontend/src `fhanges in. Make cFrontend
1To Update 

### y redeploysutomaticall Function a
3.ectoryfrontend dird` from -profy deploy -. Run `netlis`
2ubscribe.jer-swslettions/nefunctnd/netlify/dit `fronteon
1. Ectiunewsletter F To Update N

### Notesnce## Maintenahanges

th latest cto date wi Up  **Status**:main
-**: 
- **Branch (GitHub)te**: origin- **Remository

po## Git Ree
```

er-subscrib newslettctions:funy logtend
netlifd fron
```bash
cLogson nctiew Fu## Vi

#```tatus
fy sntend
netlicd fro
```bash
ment Statuseploy
### Check D
prod
```ploy --netlify derontend
ash
cd fuction
```boy to Prod# Depl
##ands
ent Commloym
## Dep