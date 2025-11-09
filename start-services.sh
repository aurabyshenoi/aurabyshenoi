#!/bin/bash

# Start MongoDB
echo "Starting MongoDB..."
mongod --dbpath /opt/homebrew/var/mongodb &
MONGO_PID=$!

# Wait for MongoDB to start
sleep 3

# Check if MongoDB is running
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✓ MongoDB started successfully (PID: $MONGO_PID)"
else
    echo "✗ Failed to start MongoDB"
    exit 1
fi

# Start backend
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo ""
echo "Services started:"
echo "  MongoDB PID: $MONGO_PID"
echo "  Backend PID: $BACKEND_PID"
echo ""
echo "To stop services:"
echo "  kill $MONGO_PID $BACKEND_PID"
