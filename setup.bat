@echo off
setlocal

echo 🚀 WhatsApp Web Clone - Quick Setup
echo ==================================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Get MongoDB URI
echo.
set /p MONGODB_URI="📊 Enter your MongoDB URI (press Enter for local MongoDB): "
if "%MONGODB_URI%"=="" set MONGODB_URI=mongodb://localhost:27017/whatsapp

REM Setup Backend
echo.
echo 🔧 Setting up backend...
cd backend

if not exist .env (
    echo Creating backend .env file...
    (
        echo MONGODB_URI=%MONGODB_URI%
        echo PORT=5000
        echo NODE_ENV=development
        echo CORS_ORIGINS=http://localhost:3000
    ) > .env
    echo ✅ Backend .env created
) else (
    echo ⚠️  Backend .env already exists
)

echo 📦 Installing backend dependencies...
call npm install

echo 🌱 Seeding database with sample data...
call npm run seed

cd ..

REM Setup Frontend
echo.
echo 🎨 Setting up frontend...

if not exist .env.local (
    echo Creating frontend .env.local file...
    echo NEXT_PUBLIC_API_URL=http://localhost:5000 > .env.local
    echo ✅ Frontend .env.local created
) else (
    echo ⚠️  Frontend .env.local already exists
)

echo 📦 Installing frontend dependencies...
call npm install

echo.
echo 🎉 Setup completed successfully!
echo.
echo 🚀 To start the application:
echo    1. Start backend:  cd backend ^&^& npm run dev
echo    2. Start frontend: npm run dev
echo.
echo 📱 Access the app at: http://localhost:3000
echo 🔧 Backend API at: http://localhost:5000
echo.
echo 📚 Check README.md for more information

pause
