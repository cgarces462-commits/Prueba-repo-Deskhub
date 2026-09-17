@echo off
chcp 65001 >nul
echo ============================================
echo   DIAGNOSTICO DeskHub Frontend
echo ============================================
echo.

echo ---- 1. Version de Node y npm ----
node --version
npm --version
echo.

echo ---- 2. Archivos del proyecto en el disco ----
if exist "%~dp0..\..\frontend\package.json" (echo [OK] package.json existe) else (echo [FALTA] frontend\package.json)
if exist "%~dp0..\..\frontend\node_modules" (echo [OK] node_modules existe) else (echo [FALTA] frontend\node_modules - se necesita npm install)
echo.

echo ---- 3. Puertos en uso ----
netstat -ano | findstr "LISTENING" | findstr ":3000 :5173"
echo.

echo ---- 4. Prueba de arranque de Vite (5 segundos) ----
cd /d "%~dp0..\..\frontend"
start /b cmd /c "npm run dev > %TEMP%\vite_test.log 2>&1"
timeout /t 5 >nul
echo.

echo ---- 5. Log de Vite ----
type "%TEMP%\vite_test.log"
echo.

echo ---- 6. Comprobacion del puerto 5173 ----
netstat -ano | findstr ":5173" | findstr "LISTENING"
echo.
echo ============================================
echo  Si en el paso 5 aparece "ready", el frontend
echo  esta corriendo en http://localhost:5173/
echo ============================================
pause