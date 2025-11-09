# MongoDB Setup Guide

## Starting MongoDB Locally

### Option 1: Using the helper script
```bash
./start-services.sh
```

### Option 2: Manual start
```bash
# Start MongoDB
mongod --dbpath /opt/homebrew/var/mongodb

# In another terminal, start the backend
cd backend
npm run dev
```

### Option 3: Using brew services (if configured)
```bash
brew services start mongodb-community
```

## Verifying MongoDB is Running

```bash
mongosh --eval "db.adminCommand('ping')"
```

You should see: `{ ok: 1 }`

## Troubleshooting

### Connection Refused Error
If you see `ECONNREFUSED ::1:27017`, MongoDB is not running. Start it using one of the options above.

### Version Incompatibility
If you see version errors, clear the database:
```bash
rm -rf /opt/homebrew/var/mongodb/*
mongod --dbpath /opt/homebrew/var/mongodb
```

## Production Setup

For production, the backend uses MongoDB Atlas (cloud database). The connection string is configured in `backend/.env.production`.

## Newsletter Subscription

The newsletter subscription feature requires MongoDB to be running. When MongoDB is not available:
- Subscriptions will fail with a 500 error
- The backend logs will show connection errors
- Start MongoDB to enable this feature
