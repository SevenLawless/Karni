@echo off
echo ========================================
echo Starting Expense Tracker Application
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/4] Checking backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
)
cd ..

echo [2/4] Checking frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
cd ..

echo [3/4] Starting backend server...
start "Expense Tracker - Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak >nul

echo [4/4] Starting frontend server...
start "Expense Tracker - Frontend" cmd /k "cd /d %~dp0frontend && npm start"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Application is starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo The browser will open automatically in a few seconds...
echo.
echo NOTE: Keep these windows open while using the app.
echo       Close them to stop the servers.
echo.

REM Wait a bit more for React to compile, then open browser
timeout /t 10 /nobreak >nul
start http://localhost:3000

echo Browser opened! The app should be loading...
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul

