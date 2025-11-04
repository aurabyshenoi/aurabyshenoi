#!/bin/bash

# Production start script for AuraByShenoi website
set -e

echo "🚀 Starting AuraByShenoi website in production mode..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the deployment directory
if [ ! -f "deployment-info.json" ]; then
    print_error "This script should be run from the deployment directory"
    exit 1
fi

# Load environment variables
if [ -f ".env.backend" ]; then
    print_status "Loading backend environment variables..."
    export $(cat .env.backend | grep -v '^#' | xargs)
fi

# Set default port if not specified
PORT=${PORT:-3001}

# Check if port is available
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    print_error "Port $PORT is already in use"
    exit 1
fi

# Install production dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing production dependencies..."
    npm ci --only=production
fi

# Start the application
print_status "Starting backend server on port $PORT..."

# Use PM2 if available, otherwise use node directly
if command -v pm2 &> /dev/null; then
    print_status "Using PM2 for process management..."
    
    # Stop existing process if running
    pm2 stop aurabyshenoi-backend 2>/dev/null || true
    pm2 delete aurabyshenoi-backend 2>/dev/null || true
    
    # Start with PM2
    pm2 start backend/server.js \
        --name "aurabyshenoi-backend" \
        --instances 1 \
        --max-memory-restart 500M \
        --node-args="--max-old-space-size=512" \
        --log-date-format="YYYY-MM-DD HH:mm:ss Z" \
        --merge-logs \
        --output "./logs/out.log" \
        --error "./logs/error.log"
    
    # Save PM2 configuration
    pm2 save
    
    print_status "Application started with PM2"
    print_status "View logs with: pm2 logs aurabyshenoi-backend"
    print_status "Monitor with: pm2 monit"
    
else
    print_warning "PM2 not found, starting with node directly..."
    print_warning "For production, consider installing PM2: npm install -g pm2"
    
    # Create logs directory
    mkdir -p logs
    
    # Start with node
    NODE_ENV=production node backend/server.js > logs/out.log 2> logs/error.log &
    
    # Save PID
    echo $! > aurabyshenoi.pid
    
    print_status "Application started with PID: $!"
    print_status "View logs with: tail -f logs/out.log"
fi

# Wait a moment and check if the server is responding
sleep 3

if curl -f http://localhost:$PORT/health >/dev/null 2>&1; then
    print_status "✅ Server is responding on port $PORT"
else
    print_warning "⚠️  Server may not be responding yet, check logs"
fi

print_status "🎉 AuraByShenoi website started successfully!"
print_status "Backend API: http://localhost:$PORT"

# Show deployment info
if [ -f "deployment-info.json" ]; then
    print_status "Deployment Information:"
    cat deployment-info.json | jq . 2>/dev/null || cat deployment-info.json
fi