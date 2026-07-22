@echo off
setlocal enabledelayedexpansion

echo.
echo   =============================
echo     Tele-AGY Installer
echo   =============================
echo.

:: Check prerequisites
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required. Install from https://nodejs.org
    exit /b 1
)

for /f "tokens=1 delims=v." %%a in ('node -v') do set NODE_MAJOR=%%a
for /f "tokens=2 delims=v." %%a in ('node -v') do set NODE_MAJOR=%%a

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is required.
    exit /b 1
)

where agy >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] 'agy' CLI not found in PATH. Make sure Antigravity CLI is installed.
)

:: Clone
set INSTALL_DIR=tele-agy
if not exist "%INSTALL_DIR%" (
    echo [INFO] Cloning tele-agy...
    git clone https://github.com/startingfrom0rating/tele-agy.git "%INSTALL_DIR%"
) else (
    echo [INFO] Directory '%INSTALL_DIR%' already exists, skipping clone.
)
cd "%INSTALL_DIR%"

:: Install deps
echo.
echo [INFO] Installing dependencies...
call npm install --silent

:: Interactive .env setup
echo.
echo   Configuration
echo   -----------------
echo   You'll need:
echo     - Bot Token from @BotFather on Telegram
echo     - Your User ID from @userinfobot on Telegram
echo.

set /p BOT_TOKEN="Telegram Bot Token (from @BotFather): "
if "%BOT_TOKEN%"=="" (
    echo [ERROR] Bot token is required.
    exit /b 1
)

set /p USER_ID="Your Telegram User ID (from @userinfobot): "
if "%USER_ID%"=="" (
    echo [ERROR] User ID is required.
    exit /b 1
)

set /p WORKSPACE="Workspace directory [%CD%]: "
if "%WORKSPACE%"=="" set "WORKSPACE=%CD%"

set /p MODEL="Default model [Gemini 3.6 Flash (High)]: "
if "%MODEL%"=="" set "MODEL=Gemini 3.6 Flash (High)"

:: Write .env
(
echo TELEGRAM_BOT_TOKEN="%BOT_TOKEN%"
echo TELEGRAM_USER_ID="%USER_ID%"
echo WORKSPACE_DIR="%WORKSPACE%"
echo DEFAULT_MODEL="%MODEL%"
) > .env

echo.
echo   Configuration saved to .env
node scripts/enable-autostart.js
echo.
echo   =============================
echo     Tele-AGY installed!
echo     Run 'npm start' to launch.
echo   =============================
echo.

set /p START="Start the bot now? [Y/n]: "
if /i not "%START%"=="n" (
    npm start
)

endlocal
