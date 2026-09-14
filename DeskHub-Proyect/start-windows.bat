@echo off
setlocal enabledelayedexpansion

rem ======================================
rem  DeskHub - arranque en Windows (XAMPP)
rem  Requiere: Node.js y XAMPP instalados
rem ======================================

set "RAIZ=%~dp0"
set "BACKEND=%RAIZ%Backend"
set "FRONTEND=%RAIZ%frontend"

rem Ruta de XAMPP y puerto de su MySQL
set "XAMPP=C:\xampp"
set "MYSQL_BIN=%XAMPP%\mysql\bin"
set "PORT_DB=3306"

echo ======================================
echo  DeskHub - arranque del proyecto
echo ======================================

rem ---------- 1) MySQL (XAMPP) ----------
if not exist "%MYSQL_BIN%\mysqladmin.exe" (
    echo [ERROR] XAMPP no encontrado en %XAMPP%
    echo         Edita la variable XAMPP al inicio de este script.
    exit /b 1
)

"%MYSQL_BIN%\mysqladmin.exe" -h 127.0.0.1 -P %PORT_DB% -u root ping >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  MySQL de XAMPP ya esta corriendo ^(puerto %PORT_DB%^)
) else (
    echo [..]  Iniciando MySQL de XAMPP...
    sc start mysql >nul 2>&1
    if not %errorlevel%==0 (
        start "MySQL XAMPP" /min "%MYSQL_BIN%\mysqld.exe" --defaults-file="%XAMPP%\mysql\bin\my.ini"
    )
    set "INTENTO=0"
    :espera_mysql
    "%MYSQL_BIN%\mysqladmin.exe" -h 127.0.0.1 -P %PORT_DB% -u root ping >nul 2>&1
    if %errorlevel%==0 goto mysql_ok
    set /a INTENTO+=1
    if !INTENTO! GEQ 30 (
        echo [ERROR] No se pudo iniciar MySQL. Abre XAMPP Control Panel y arranca MySQL manualmente.
        exit /b 1
    )
    timeout /t 1 >nul
    goto espera_mysql
)

:mysql_ok
"%MYSQL_BIN%\mysql.exe" -h 127.0.0.1 -P %PORT_DB% -u root -e "CREATE DATABASE IF NOT EXISTS deskhub" >nul 2>&1
echo [OK]  Base de datos 'deskhub' asegurada

rem ---------- 2) Backend\.env ----------
echo [..]  Configurando Backend\.env
powershell -NoProfile -Command "$p='%BACKEND%\.env'; $ok=Test-Path $p; $e='%BACKEND%\.env.example'; if(-not $ok){ $p=$e }; (Get-Content $p -Raw) -replace '(?m)^DB_HOST=.*$','DB_HOST=127.0.0.1' -replace '(?m)^DB_PORT=.*$','DB_PORT=%PORT_DB%' | Set-Content '%BACKEND%\.env' -NoNewline"

rem ---------- 3) Dependencias ----------
if not exist "%BACKEND%\node_modules" (
    echo [..]  Instalando dependencias del backend...
    pushd "%BACKEND%"
    call npm install
    popd
)
if not exist "%FRONTEND%\node_modules" (
    echo [..]  Instalando dependencias del frontend...
    pushd "%FRONTEND%"
    call npm install
    popd
)

rem ---------- 4) Seed (roles + super_admin) ----------
echo [..]  Sembrando roles y super_admin
pushd "%BACKEND%"
call npm run seed
popd

rem ---------- 5) Backend ----------
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  Backend ya esta corriendo
) else (
    echo [..]  Levantando backend ^(puerto 3000^)
    start "DeskHub Backend" /min cmd /c "cd /d %BACKEND% && node index.js > %RAIZ%.backend.log 2>&1"
)

rem ---------- 6) Frontend ----------
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  Frontend ya esta corriendo
) else (
    echo [..]  Levantando frontend ^(puerto 5173^)
    start "DeskHub Frontend" /min cmd /c "cd /d %FRONTEND% && npm run dev > %RAIZ%.frontend.log 2>&1"
)

echo.
echo ======================================
echo  DeskHub disponible en:
echo    Frontend : http://localhost:5173
echo    API      : http://localhost:3000/api
echo    Login    : superadmin@deskhub.com / SuperAdmin123
echo.
echo  Logs: .backend.log y .frontend.log
echo ======================================
endlocal