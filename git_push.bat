@echo off
echo ===========================================
echo       Pushing Code to GitHub...
echo ===========================================
echo.
echo Remote: origin
echo Branch: main
echo.
echo You may be asked to sign in to GitHub in the browser
echo or enter your username/Personal Access Token.
echo.
git push -u origin main
echo.
if %errorlevel% neq 0 (
    echo [ERROR] Push failed. 
    echo Please check your internet connection or credentials.
) else (
    echo [SUCCESS] Code pushed successfully!
)
pause
