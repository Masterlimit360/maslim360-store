#!/bin/bash

# MasLim360 Store Setup Script
echo "🚀 Setting up MasLim360 Store..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment files
echo "📝 Setting up environment files..."
if [ ! -f "apps/backend/.env" ]; then
    cp apps/backend/env.example apps/backend/.env
    echo "✅ Created apps/backend/.env from example"
fi

if [ ! -f "apps/frontend/.env.local" ]; then
    cp apps/frontend/env.example apps/frontend/.env.local
    echo "✅ Created apps/frontend/.env.local from example"
fi

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd apps/backend
pnpm prisma generate
cd ../..

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose -f infra/docker-compose.yml up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database migrations..."
cd apps/backend
pnpm prisma migrate dev --name init
cd ../..

echo "✅ Setup complete!"
echo ""
echo "To start the development servers:"
echo "  pnpm dev"
echo ""
echo "To start with Docker:"
echo "  docker-compose -f infra/docker-compose.yml up"
echo ""
echo "Backend API: http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:4000/api/docs"
