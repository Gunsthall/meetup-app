@echo off
echo ========================================
echo MeetUp Mobile Testing Setup
echo ========================================
echo.

echo Step 1: Finding your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP:~1%
echo Found IP: %IP%
echo.

echo Step 2: Updating configuration files...
echo.

echo Creating server/.env...
(
echo # Server Configuration
echo PORT=3000
echo.
echo # Redis Configuration
echo REDIS_URL=redis://localhost:6379
echo.
echo # Frontend URL ^(for share links^)
echo FRONTEND_URL=http://%IP%:5173
echo.
echo # CORS Configuration
echo CORS_ORIGIN=http://%IP%:5173
) > server\.env

echo Creating frontend/.env...
(
echo # Backend API URL
echo VITE_API_URL=http://%IP%:3000
echo.
echo # WebSocket URL
echo VITE_WS_URL=ws://%IP%:3000
) > frontend\.env

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your IP Address: %IP%
echo.
echo Next steps:
echo 1. Start Redis:     docker run -p 6379:6379 redis:alpine
echo 2. Start Backend:   cd server ^&^& npm run dev
echo 3. Start Frontend:  cd frontend ^&^& npm run dev
echo 4. On your phone, open: http://%IP%:5173
echo.
echo Make sure your phone is on the SAME Wi-Fi network!
echo.
echo ========================================
pause
