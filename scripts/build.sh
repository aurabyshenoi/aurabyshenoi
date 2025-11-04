#!/bin/bash

# Build script for AuraByShenoi website
set -e

echo "🚀 Starting build process for AuraByShenoi website..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Set environment
ENVIRONMENT=${1:-production}
print_status "Building for environment: $ENVIRONMENT"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf frontend/dist
rm -rf backend/dist

# Install dependencies for backend
print_status "Installing backend dependencies..."
cd backend
npm ci --only=production
print_status "Backend dependencies installed successfully"

# Build backend
print_status "Building backend..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Backend build completed successfully"
else
    print_error "Backend build failed"
    exit 1
fi

# Go back to root
cd ..

# Install dependencies for frontend
print_status "Installing frontend dependencies..."
cd frontend
npm ci

# Set environment variables for build
if [ "$ENVIRONMENT" = "production" ]; then
    export NODE_ENV=production
    cp .env.production .env.local 2>/dev/null || print_warning ".env.production not found, using defaults"
else
    export NODE_ENV=development
fi

# Build frontend
print_status "Building frontend..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

# Go back to root
cd ..

# Create deployment package
print_status "Creating deployment package..."
mkdir -p dist/deployment

# Copy backend files
cp -r backend/dist dist/deployment/backend
cp backend/package.json dist/deployment/
cp backend/package-lock.json dist/deployment/

# Copy frontend build
cp -r frontend/dist dist/deployment/frontend

# Copy environment files
cp backend/.env.production dist/deployment/.env.backend 2>/dev/null || print_warning "Backend production env file not found"
cp frontend/.env.production dist/deployment/.env.frontend 2>/dev/null || print_warning "Frontend production env file not found"

# Copy deployment scripts
mkdir -p dist/deployment/scripts
cp scripts/deploy.sh dist/deployment/scripts/ 2>/dev/null || print_warning "Deploy script not found"
cp scripts/start.sh dist/deployment/scripts/ 2>/dev/null || print_warning "Start script not found"

# Create deployment info
cat > dist/deployment/deployment-info.json << EOF
{
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": "$ENVIRONMENT",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF

print_status "Build process completed successfully!"
print_status "Deployment package created in: dist/deployment/"

# Show build statistics
if [ -d "frontend/dist" ]; then
    FRONTEND_SIZE=$(du -sh frontend/dist | cut -f1)
    print_status "Frontend build size: $FRONTEND_SIZE"
fi

if [ -d "backend/dist" ]; then
    BACKEND_SIZE=$(du -sh backend/dist | cut -f1)
    print_status "Backend build size: $BACKEND_SIZE"
fi

TOTAL_SIZE=$(du -sh dist/deployment | cut -f1)
print_status "Total deployment package size: $TOTAL_SIZE"

print_status "🎉 Build completed successfully!"