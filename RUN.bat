@echo off
title The69Army Arena
color 0A
echo.
echo  ========================================
echo   THE69ARMY GAMING ARENA
echo   One-click launcher
echo  ========================================
echo.

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Node.js niet gevonden!
    echo  Download het hier: https://nodejs.org
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)

:: Install client als dat nog niet is gebeurd
if not exist "%~dp0client\node_modules" (
    echo  [1/2] Installing client...
    cd /d %~dp0client
    call npm install
    cd /d %~dp0
    echo.
)

:: Install server als dat nog niet is gebeurd
if not exist "%~dp0server\node_modules" (
    echo  [2/2] Installing server...
    echo  (eerste keer kan even duren)
    cd /d %~dp0server
    call npm install
    cd /d %~dp0
    echo.
)

echo  ========================================
echo   STARTING...
echo  ========================================
echo.

:: Start server in apart venster
start "The69Army - Server" cmd /k "cd /d %~dp0server && title The69Army - SERVER && color 0A && node index.js"

:: Wacht zodat server kan starten
echo  Starting server...
timeout /t 4 /nobreak >nul

:: Start client in apart venster
start "The69Army - Client" cmd /k "cd /d %~dp0client && title The69Army - CLIENT && color 0B && npx vite --port 3000"

:: Wacht en open browser
echo  Starting client...
timeout /t 6 /nobreak >nul

start http://localhost:3000

echo.
echo  ========================================
echo   DRAAIT!
echo  ========================================
echo.
echo   Site:    http://localhost:3000
echo   Server:  http://localhost:4000
echo.
echo   Je kunt dit venster sluiten.
echo   Server + Client draaien in aparte vensters.
echo.
echo   Stoppen? Dubbelklik STOP.bat
echo.
pause
