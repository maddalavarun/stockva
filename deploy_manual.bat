@echo off
setlocal enabledelayedexpansion
title Stock App - Google Cloud Run Deployer

echo ========================================================
echo   GOOGLE CLOUD RUN - DIRECT DEPLOYMENT (No GitHub)
echo ========================================================
echo.
echo This script will upload your local code directly to Google Cloud,
echo bypassing any GitHub connection issues.
echo.

:: Check for gcloud
where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Google Cloud SDK (gcloud) is not installed!
    echo Please install it from: https://cloud.google.com/sdk/docs/install
    pause
    exit /b
)

:: Get Project ID
echo Current gcloud project:
call gcloud config get-value project
echo.
set /p PROJECT_ID="Enter your Google Cloud Project ID (press Enter to use current): "
if "%PROJECT_ID%"=="" for /f "tokens=*" %%i in ('gcloud config get-value project') do set PROJECT_ID=%%i

echo.
echo Using Project: !PROJECT_ID!
echo.
pause

:: 1. Deploy Backend
echo.
echo [1/5] Building Backend Container...
cd backend
call gcloud builds submit --tag gcr.io/!PROJECT_ID!/stock-backend
if %errorlevel% neq 0 goto :error

echo.
echo [2/5] Deploying Backend Service...
echo (You may be prompted to choose a region, e.g., us-central1)
call gcloud run deploy stock-backend ^
  --image gcr.io/!PROJECT_ID!/stock-backend ^
  --platform managed ^
  --allow-unauthenticated ^
  --set-env-vars MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/stock_app?retryWrites=true&w=majority",JWT_SECRET_KEY="supersecret"
:: IMPORTANT: Update MONGO_URI above or in Cloud Console after deploy!

if %errorlevel% neq 0 goto :error

echo.
echo --------------------------------------------------------
echo BACKEND DEPLOYED SUCCESSFULLY!
echo Please copy the Service URL from the output above.
echo (It starts with https://stock-backend...)
echo --------------------------------------------------------
set /p BACKEND_URL="Paste Backend URL here (e.g., https://...): "

:: 2. Configure Frontend
cd ..\frontend
echo VITE_API_URL=!BACKEND_URL!/api > .env.production
echo Created .env.production with API URL: !BACKEND_URL!/api

:: 3. Deploy Frontend
echo.
echo [3/5] Building Frontend Container...
call gcloud builds submit --tag gcr.io/!PROJECT_ID!/stock-frontend
if %errorlevel% neq 0 goto :error

echo.
echo [4/5] Deploying Frontend Service...
call gcloud run deploy stock-frontend ^
  --image gcr.io/!PROJECT_ID!/stock-frontend ^
  --platform managed ^
  --allow-unauthenticated

if %errorlevel% neq 0 goto :error

echo.
echo ========================================================
echo           DEPLOYMENT COMPLETE!
echo ========================================================
echo Access your app at the Frontend Service URL listed above.
echo.
pause
exit /b

:error
echo.
echo [ERROR] Deployment failed. Please check the logs above.
pause
cd ..
exit /b
