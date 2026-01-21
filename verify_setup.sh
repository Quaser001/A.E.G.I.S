#!/bin/bash
# KAVACH Drone Simulator - Setup Verification Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     KAVACH Drone Simulator - Setup Verification           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verification counter
PASSED=0
FAILED=0

echo "📋 Checking project structure..."
echo ""

# Check root files
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 (MISSING)"
        ((FAILED++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1/ (MISSING)"
        ((FAILED++))
    fi
}

# Root level files
echo "📁 Root Directory:"
check_file "README.md"
check_file "QUICKSTART.md"
check_file "PROJECT_SUMMARY.md"
check_file ".gitignore"
check_file ".env.example"
check_dir ".github"
echo ""

# Backend files
echo "🔧 Backend (Python/Flask):"
check_dir "backend"
check_file "backend/app.py"
check_file "backend/requirements.txt"
check_file "backend/.env.example"
echo ""

# Frontend files
echo "⚛️  Frontend (React/Three.js):"
check_dir "frontend"
check_file "frontend/package.json"
check_file "frontend/vite.config.js"
check_file "frontend/index.html"
check_dir "frontend/src"
echo ""

# Frontend src
echo "📦 Frontend Source:"
check_file "frontend/src/main.jsx"
check_file "frontend/src/App.jsx"
check_file "frontend/src/App.css"
check_file "frontend/src/index.css"
check_dir "frontend/src/components"
check_dir "frontend/src/hooks"
check_dir "frontend/src/store"
echo ""

# Components
echo "🎨 React Components:"
check_file "frontend/src/components/DroneScene.jsx"
check_file "frontend/src/components/HUD.jsx"
check_file "frontend/src/components/HUD.css"
echo ""

# Hooks
echo "🪝 Custom Hooks:"
check_file "frontend/src/hooks/useSocketIO.js"
check_file "frontend/src/hooks/useKeyboardControls.js"
echo ""

# Store
echo "💾 State Management:"
check_file "frontend/src/store/droneStore.js"
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All files present! Project structure is complete.${NC}"
    echo ""
    echo "📖 Next steps:"
    echo "1. Read QUICKSTART.md for setup instructions"
    echo "2. Install backend: cd backend && pip install -r requirements.txt"
    echo "3. Install frontend: cd frontend && npm install"
    echo "4. Start backend: python app.py"
    echo "5. Start frontend: npm run dev"
    echo "6. Open http://localhost:3000"
    echo ""
    echo "🚀 Happy flying with KAVACH Drone Simulator!"
else
    echo -e "${YELLOW}⚠️  Some files are missing. Check the output above.${NC}"
    echo ""
    echo "Make sure you're running this script from the Drone project root directory."
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
