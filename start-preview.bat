@echo off
setlocal
cd /d "%~dp0"
start "Pneumo Titer Counter" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%~dp0'; node server.js"
echo Preview server is starting at http://localhost:3000/
echo Keep the new PowerShell window open while using the app.
