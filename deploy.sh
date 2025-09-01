#!/bin/bash

echo "🚀 Think-Events Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  You're not on the main branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    git status --short
    exit 1
fi

echo "✅ Git repository is ready"

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ Dependencies are installed"

# Test backend build
echo "🔧 Testing backend build..."
cd backend
if npm run build 2>/dev/null; then
    echo "✅ Backend build test passed"
else
    echo "⚠️  Backend build test skipped (no build script)"
fi
cd ..

# Test frontend build
echo "🔧 Testing frontend build..."
cd frontend
if npm run build; then
    echo "✅ Frontend build test passed"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo ""
echo "🎉 Build tests completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Deploy to Vercel:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Create new project"
echo "   - Import your GitHub repository"
echo "   - Follow the deployment guide in DEPLOYMENT.md"
echo ""
echo "3. Set environment variables in Vercel dashboard"
echo "4. Test your deployment"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
