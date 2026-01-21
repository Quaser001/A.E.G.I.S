@echo off
REM KAVACH Drone Simulator - Setup Verification (Windows)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     KAVACH Drone Simulator - Setup Verification           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

setlocal enabledelayedexpansion
set PASSED=0
set FAILED=0

echo 📋 Checking project structure...
echo.

REM Check files
echo 📁 Root Directory:
if exist "README.md" (
    echo [OK] README.md
    set /a PASSED+=1
) else (
    echo [MISSING] README.md
    set /a FAILED+=1
)

if exist "QUICKSTART.md" (
    echo [OK] QUICKSTART.md
    set /a PASSED+=1
) else (
    echo [MISSING] QUICKSTART.md
    set /a FAILED+=1
)

if exist "PROJECT_SUMMARY.md" (
    echo [OK] PROJECT_SUMMARY.md
    set /a PASSED+=1
) else (
    echo [MISSING] PROJECT_SUMMARY.md
    set /a FAILED+=1
)

if exist ".gitignore" (
    echo [OK] .gitignore
    set /a PASSED+=1
) else (
    echo [MISSING] .gitignore
    set /a FAILED+=1
)

if exist ".env.example" (
    echo [OK] .env.example
    set /a PASSED+=1
) else (
    echo [MISSING] .env.example
    set /a FAILED+=1
)

if exist ".github" (
    echo [OK] .github/
    set /a PASSED+=1
) else (
    echo [MISSING] .github/
    set /a FAILED+=1
)

echo.
echo 🔧 Backend (Python/Flask):
if exist "backend" (
    echo [OK] backend/
    set /a PASSED+=1
) else (
    echo [MISSING] backend/
    set /a FAILED+=1
)

if exist "backend\app.py" (
    echo [OK] backend/app.py
    set /a PASSED+=1
) else (
    echo [MISSING] backend/app.py
    set /a FAILED+=1
)

if exist "backend\requirements.txt" (
    echo [OK] backend/requirements.txt
    set /a PASSED+=1
) else (
    echo [MISSING] backend/requirements.txt
    set /a FAILED+=1
)

echo.
echo ⚛️  Frontend (React/Three.js):
if exist "frontend" (
    echo [OK] frontend/
    set /a PASSED+=1
) else (
    echo [MISSING] frontend/
    set /a FAILED+=1
)

if exist "frontend\package.json" (
    echo [OK] frontend/package.json
    set /a PASSED+=1
) else (
    echo [MISSING] frontend/package.json
    set /a FAILED+=1
)

if exist "frontend\vite.config.js" (
    echo [OK] frontend/vite.config.js
    set /a PASSED+=1
) else (
    echo [MISSING] frontend/vite.config.js
    set /a FAILED+=1
)

if exist "frontend\index.html" (
    echo [OK] frontend/index.html
    set /a PASSED+=1
) else (
    echo [MISSING] frontend/index.html
    set /a FAILED+=1
)

echo.
echo 📦 Frontend Source:
if exist "frontend\src\main.jsx" (
    echo [OK] frontend/src/main.jsx
    set /a PASSED+=1
) else (
    echo [MISSING] frontend/src/main.jsx
    set /a FAILED+=1
)

if exist "frontend\src\App.jsx" (
    echo [OK] frontend/src/App.jsx
    set /a PASSED+=1
) else (
    echo [MISSING] frontend/src/App.jsx
    set /a FAILED+=1
)

if exist "frontend\src\components" (
    echo [OK] frontend/src/components/
    set /a PASSED+=1
) else (
    echo [MISSING] frontend/src/components/
    set /a FAILED+=1
)

if exist "frontend\src\hooks" (
    echo [OK] frontend/src/hooks/
    set /a PASSED+=1
) else (
    echo [MISSING] frontend/src/hooks/
    set /a FAILED+=1
)

if exist "frontend\src\store" (
    echo [OK] frontend/src/store/
    set /a PASSED+=1
) else (
    echo [MISSING] frontend/src/store/
    set /a FAILED+=1
)

echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo Results: %PASSED% passed, %FAILED% failed
echo.

if %FAILED% equ 0 (
    echo [SUCCESS] All files present! Project structure is complete.
    echo.
    echo 📖 Next steps:
    echo 1. Read QUICKSTART.md for setup instructions
    echo 2. Install backend: cd backend ^& pip install -r requirements.txt
    echo 3. Install frontend: cd frontend ^& npm install
    echo 4. Start backend: python app.py
    echo 5. Start frontend: npm run dev
    echo 6. Open http://localhost:3000
    echo.
    echo 🚀 Happy flying with KAVACH Drone Simulator!
) else (
    echo [WARNING] Some files are missing. Check the output above.
    echo.
    echo Make sure you're running this script from the Drone project root.
)

echo.
echo ═══════════════════════════════════════════════════════════
pause
