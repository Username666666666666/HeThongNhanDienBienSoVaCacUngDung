#!/bin/bash

# Setup script for React Native parking system

echo "🚀 Setting up React Native Parking System..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment variables
echo "⚙️  Configuring environment..."
cp .env.example .env

echo "✅ Setup completed!"
echo ""
echo "Available commands:"
echo "  npm start       - Start Metro bundler"
echo "  npm run ios     - Run on iOS simulator"
echo "  npm run android - Run on Android emulator"
echo "  npm run lint    - Run ESLint"
echo "  npm run test    - Run tests"
echo ""
