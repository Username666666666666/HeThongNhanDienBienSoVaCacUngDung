@echo off
REM Setup script for React Native parking system (Windows)

echo 🚀 Setting up React Native Parking System...

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Copy environment variables
echo ⚙️  Configuring environment...
copy .env.example .env

echo ✅ Setup completed!
echo.
echo Available commands:
echo   npm start       - Start Metro bundler
echo   npm run ios     - Run on iOS simulator
echo   npm run android - Run on Android emulator
echo   npm run lint    - Run ESLint
echo   npm run test    - Run tests
echo.
pause
