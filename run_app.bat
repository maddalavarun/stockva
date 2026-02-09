@echo off
SETLOCAL EnableExtensions

echo ========================================================
echo        STOCK MANAGEMENT APP - ONE CLICK START
echo ========================================================
echo.

:: Get Local IP Address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do set IP=%%a
set IP=%IP:~1%

echo Detected Local IP: %IP%
echo.

echo [1/2] Starting Backend Server (Flask)...
start "Stock App - Backend" cmd /k "cd backend && venv\Scripts\activate && python app.py"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Vite)...
start "Stock App - Frontend" cmd /k "cd frontend && npm run dev -- --host"

echo.
echo ========================================================
echo               APPLICATION IS RUNNING!
echo ========================================================
echo.
echo   PC Access:      http://localhost:5173
echo   Mobile Access:  http://%IP%:5173
echo.
echo   (Keep the two new windows open to keep the app running)
echo ========================================================
pause
