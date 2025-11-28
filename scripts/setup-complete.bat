@echo off
echo 🚀 Setting up MasLim360 Store - Complete E-commerce Solution
echo ============================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] pnpm is not installed. Please install pnpm: npm install -g pnpm
    pause
    exit /b 1
)

echo [INFO] System requirements check completed
echo.

echo [INFO] Installing dependencies...
call pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

cd apps\backend
call pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..\..

cd apps\frontend
call pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..\..

echo [SUCCESS] Dependencies installed successfully
echo.

echo [INFO] Setting up environment files...
if not exist "apps\backend\.env" (
    copy "apps\backend\env.example" "apps\backend\.env"
    echo [SUCCESS] Created backend .env file
) else (
    echo [WARNING] Backend .env file already exists
)

if not exist "apps\frontend\.env.local" (
    copy "apps\frontend\env.example" "apps\frontend\.env.local"
    echo [SUCCESS] Created frontend .env.local file
) else (
    echo [WARNING] Frontend .env.local file already exists
)

echo [WARNING] Please update the environment files with your actual values:
echo [WARNING] - Database credentials
echo [WARNING] - JWT secret
echo [WARNING] - Stripe keys
echo [WARNING] - OAuth credentials
echo.

echo [INFO] Creating uploads directory...
if not exist "apps\backend\uploads" mkdir "apps\backend\uploads"
if not exist "apps\frontend\public\uploads" mkdir "apps\frontend\public\uploads"
echo [SUCCESS] Uploads directory created
echo.

echo [INFO] Setting up database...
cd apps\backend
call pnpm prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)

call pnpm prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo [ERROR] Failed to run database migrations
    echo [INFO] Please make sure PostgreSQL is running and update DATABASE_URL in .env
    pause
    exit /b 1
)

call pnpm prisma db seed
if %errorlevel% neq 0 (
    echo [WARNING] Failed to seed database - this is optional
)
cd ..\..

echo [SUCCESS] Database setup completed
echo.

echo [INFO] Building applications...
cd apps\backend
call pnpm build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build backend
    pause
    exit /b 1
)
cd ..\..

cd apps\frontend
call pnpm build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)
cd ..\..

echo [SUCCESS] Applications built successfully
echo.

echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Update environment files with your actual credentials
echo 2. Start the development servers:
echo    - Backend: cd apps\backend ^&^& pnpm dev
echo    - Frontend: cd apps\frontend ^&^& pnpm dev
echo 3. Visit http://localhost:3000 to see your store
echo 4. Admin login: admin@maslim360.com / admin123
echo.
echo For production deployment, see the README.md file
echo.
pause









