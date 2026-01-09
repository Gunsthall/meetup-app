@echo off
REM MeetUp App - Windows Deployment Script

echo.
echo MeetUp App - Cloud Run Deployment
echo ====================================
echo.

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: gcloud CLI not found. Please install it first:
    echo https://cloud.google.com/sdk/docs/install
    exit /b 1
)

REM Get project ID
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo Error: No GCP project set. Please run:
    echo gcloud config set project YOUR_PROJECT_ID
    exit /b 1
)

echo Project: %PROJECT_ID%
set REGION=us-central1
echo Region: %REGION%
echo.

REM Prompt for confirmation
set /p CONFIRM="Continue with deployment? (y/n) "
if /i not "%CONFIRM%"=="y" exit /b 0

echo.
echo Step 1: Enabling required services...
call gcloud services enable run.googleapis.com
call gcloud services enable redis.googleapis.com
call gcloud services enable vpcaccess.googleapis.com
echo Services enabled
echo.

REM Check if Redis exists
echo Step 2: Checking Redis instance...
gcloud redis instances describe meetup-redis --region=%REGION% >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Redis instance already exists
) else (
    echo Creating Redis instance (this takes ~5 minutes)...
    call gcloud redis instances create meetup-redis --size=1 --region=%REGION% --redis-version=redis_6_x --tier=basic
)

REM Get Redis host
for /f "tokens=*" %%i in ('gcloud redis instances describe meetup-redis --region^=%REGION% --format^="value(host)"') do set REDIS_HOST=%%i
set REDIS_URL=redis://%REDIS_HOST%:6379
echo Redis URL: %REDIS_URL%
echo.

REM Check if VPC connector exists
echo Step 3: Checking VPC connector...
gcloud compute networks vpc-access connectors describe meetup-connector --region=%REGION% >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo VPC connector already exists
) else (
    echo Creating VPC connector...
    call gcloud compute networks vpc-access connectors create meetup-connector --region=%REGION% --range=10.8.0.0/28
)
echo.

REM Deploy backend
echo Step 4: Deploying backend...
cd server
call gcloud run deploy meetup-backend --source . --platform managed --region %REGION% --allow-unauthenticated --vpc-connector meetup-connector --set-env-vars REDIS_URL=%REDIS_URL% --set-env-vars CORS_ORIGIN=* --quiet

for /f "tokens=*" %%i in ('gcloud run services describe meetup-backend --region^=%REGION% --format^="value(status.url)"') do set BACKEND_URL=%%i
echo Backend deployed
echo Backend URL: %BACKEND_URL%
cd ..
echo.

REM Deploy frontend
echo Step 5: Deploying frontend...
cd frontend

REM Convert HTTPS to WSS
set BACKEND_WS_URL=%BACKEND_URL:https:=wss:%

call gcloud run deploy meetup-frontend --source . --platform managed --region %REGION% --allow-unauthenticated --set-build-env-vars VITE_API_URL=%BACKEND_URL% --set-build-env-vars VITE_WS_URL=%BACKEND_WS_URL% --quiet

for /f "tokens=*" %%i in ('gcloud run services describe meetup-frontend --region^=%REGION% --format^="value(status.url)"') do set FRONTEND_URL=%%i
echo Frontend deployed
echo Frontend URL: %FRONTEND_URL%
cd ..
echo.

REM Update backend CORS
echo Step 6: Updating backend CORS...
call gcloud run services update meetup-backend --region %REGION% --set-env-vars CORS_ORIGIN=%FRONTEND_URL% --set-env-vars FRONTEND_URL=%FRONTEND_URL% --quiet
echo CORS updated
echo.

REM Summary
echo.
echo Deployment Complete!
echo =======================
echo.
echo Frontend: %FRONTEND_URL%
echo Backend:  %BACKEND_URL%
echo.
echo Your app is now live with HTTPS!
echo Share this link with your drivers: %FRONTEND_URL%
echo.
echo Estimated monthly cost: ~$25-30
echo - Cloud Run: ~$0-5 (within free tier)
echo - Redis: ~$25
echo.
echo Monitor your app:
echo https://console.cloud.google.com/run?project=%PROJECT_ID%
echo.
