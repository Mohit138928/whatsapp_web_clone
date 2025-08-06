#!/bin/bash

# WhatsApp Web Clone - Quick Setup Script

echo "🚀 WhatsApp Web Clone - Quick Setup"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Get MongoDB URI
echo ""
read -p "📊 Enter your MongoDB URI (press Enter for local MongoDB): " MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    MONGODB_URI="mongodb://localhost:27017/whatsapp"
fi

# Setup Backend
echo ""
echo "🔧 Setting up backend..."
cd backend

if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cat > .env << EOF
MONGODB_URI=$MONGODB_URI
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
EOF
    echo "✅ Backend .env created"
else
    echo "⚠️  Backend .env already exists"
fi

echo "📦 Installing backend dependencies..."
npm install

echo "🌱 Seeding database with sample data..."
npm run seed

cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up frontend..."

if [ ! -f .env.local ]; then
    echo "Creating frontend .env.local file..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF
    echo "✅ Frontend .env.local created"
else
    echo "⚠️  Frontend .env.local already exists"
fi

echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "   1. Start backend:  cd backend && npm run dev"
echo "   2. Start frontend: npm run dev"
echo ""
echo "📱 Access the app at: http://localhost:3000"
echo "🔧 Backend API at: http://localhost:5000"
echo ""
echo "📚 Check README.md for more information"
