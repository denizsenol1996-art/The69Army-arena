@echo off
title The69Army Arena - Stop
color 0C
echo.
echo  ========================================
echo   THE69ARMY - STOPPING ALL SERVICES
echo  ========================================
echo.
echo  Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo.
echo  Done! Alle services gestopt.
echo.
pause
