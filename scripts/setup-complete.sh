#!/bin/bash

echo "🚀 Setting up MasLim360 Store - Complete E-commerce Solution"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm: npm install -g pnpm"
        exit 1
    fi
    
    # Check Docker (optional)
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. You'll need to install PostgreSQL and Redis manually."
    fi
    
    print_success "System requirements check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    pnpm install
    
    # Install backend dependencies
    cd apps/backend
    pnpm install
    cd ../..
    
    # Install frontend dependencies
    cd apps/frontend
    pnpm install
    cd ../..
    
    print_success "Dependencies installed successfully"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "apps/backend/.env" ]; then
        cp apps/backend/env.example apps/backend/.env
        print_success "Created backend .env file"
    else
        print_warning "Backend .env file already exists"
    fi
    
    # Frontend environment
    if [ ! -f "apps/frontend/.env.local" ]; then
        cp apps/frontend/env.example apps/frontend/.env.local
        print_success "Created frontend .env.local file"
    else
        print_warning "Frontend .env.local file already exists"
    fi
    
    print_warning "Please update the environment files with your actual values:"
    print_warning "- Database credentials"
    print_warning "- JWT secret"
    print_warning "- Stripe keys"
    print_warning "- OAuth credentials"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd apps/backend
    
    # Generate Prisma client
    pnpm prisma generate
    
    # Run migrations
    pnpm prisma migrate dev --name init
    
    # Seed database
    pnpm prisma db seed
    
    cd ../..
    
    print_success "Database setup completed"
}

# Create uploads directory
setup_uploads() {
    print_status "Creating uploads directory..."
    
    mkdir -p apps/backend/uploads
    mkdir -p apps/frontend/public/uploads
    
    print_success "Uploads directory created"
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build backend
    cd apps/backend
    pnpm build
    cd ../..
    
    # Build frontend
    cd apps/frontend
    pnpm build
    cd ../..
    
    print_success "Applications built successfully"
}

# Main setup function
main() {
    echo "Starting complete setup process..."
    echo ""
    
    check_requirements
    install_dependencies
    setup_environment
    setup_uploads
    setup_database
    build_applications
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update environment files with your actual credentials"
    echo "2. Start the development servers:"
    echo "   - Backend: cd apps/backend && pnpm dev"
    echo "   - Frontend: cd apps/frontend && pnpm dev"
    echo "3. Visit http://localhost:3000 to see your store"
    echo "4. Admin login: admin@maslim360.com / admin123"
    echo ""
    echo "For production deployment, see the README.md file"
}

# Run main function
main







