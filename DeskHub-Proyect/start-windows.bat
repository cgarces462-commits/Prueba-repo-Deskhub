@echo off
setlocal enabledelayedexpansion

rem ======================================
rem  DeskHub - arranque en Windows (WAMP)
rem  Requiere: Node.js y WAMP instalados
rem ======================================

set "RAIZ=%~dp0"
set "BACKEND=%RAIZ%Backend"
set "FRONTEND=%RAIZ%frontend"

rem Puerto del MySQL de WAMP (lo normal es 3306)
set "PORT_DB=3306"

echo ======================================
echo  DeskHub - arranque del proyecto
echo ======================================

rem ---------- 1) Detectar WAMP y su MySQL ----------
set "WAMP="
for %%d in (C:\wamp64 C:\wamp D:\wamp64 D:\wamp "%ProgramFiles%\wamp64" "%ProgramFiles%\wamp") do (
    if not defined WAMP if exist "%%~d\wampmanager.exe" set "WAMP=%%~d"
)
if not defined WAMP (
    echo [ERROR] No se pudo localizar WAMP ^(carpeta con wampmanager.exe^).
    echo         Verifica donde esta instalado y edita la lista de rutas
    echo         al inicio de este script ^(variable WAMP^).
    exit /b 1
)
echo [OK]  WAMP encontrado en: %WAMP%

set "MYSQL_BIN="
for /d %%v in ("%WAMP%\bin\mysql\mysql*") do (
    if not defined MYSQL_BIN if exist "%%~v\bin\mysqladmin.exe" set "MYSQL_BIN=%%~v\bin"
)
if not defined MYSQL_BIN (
    for /d %%v in ("%WAMP%\bin\mariadb\mariadb*") do (
        if not defined MYSQL_BIN if exist "%%~v\bin\mysqladmin.exe" set "MYSQL_BIN=%%~v\bin"
    )
)
if not defined MYSQL_BIN (
    echo [ERROR] No se encontro MySQL/MariaDB en %WAMP%\bin
    echo         Revisa que WAMP este instalado correctamente.
    exit /b 1
)
echo [OK]  MySQL de WAMP: %MYSQL_BIN%
set "MYSQL_INI=%MYSQL_BIN%\my.ini"

rem ---------- 2) Arrancar MySQL ----------
"%MYSQL_BIN%\mysqladmin.exe" -h 127.0.0.1 -P %PORT_DB% -u root ping >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  MySQL de WAMP ya esta corriendo ^(puerto %PORT_DB%^)
) else (
    echo [..]  Iniciando MySQL de WAMP...
    set "SVC="
    for %%s in (wampmysqld64 wampmysqld wampmariadb64 wampmariadb) do (
        if not defined SVC (
            sc query %%s >nul 2>&1 && set "SVC=%%s"
        )
    )
    if defined SVC (
        echo [..]  Con servicio de Windows: !SVC!
        sc start !SVC! >nul 2>&1
    ) else (
        echo [..]  Lanzando mysqld directamente...
        start "WAMP MySQL" /min "%MYSQL_BIN%\mysqld.exe" --defaults-file="%MYSQL_INI%"
    )
    set "INTENTO=0"
    :espera_mysql
    "%MYSQL_BIN%\mysqladmin.exe" -h 127.0.0.1 -P %PORT_DB% -u root ping >nul 2>&1
    if %errorlevel%==0 goto mysql_ok
    set /a INTENTO+=1
    if !INTENTO! GEQ 30 (
        echo [ERROR] No se pudo iniciar MySQL. Abre WAMP y arranca MySQL desde su panel.
        exit /b 1
    )
    timeout /t 1 >nul
    goto espera_mysql
)

:mysql_ok
"%MYSQL_BIN%\mysql.exe" -h 127.0.0.1 -P %PORT_DB% -u root -e "CREATE DATABASE IF NOT EXISTS deskhub" >nul 2>&1
echo [OK]  Base de datos 'deskhub' asegurada

rem ---------- 3) Backend\.env ----------
echo [..]  Configurando Backend\.env
powershell -NoProfile -Command "$p='%BACKEND%\.env'; $ok=Test-Path $p; $e='%BACKEND%\.env.example'; if(-not $ok){ $p=$e }; (Get-Content $p -Raw) -replace '(?m)^DB_HOST=.*$','DB_HOST=127.0.0.1' -replace '(?m)^DB_PORT=.*$','DB_PORT=%PORT_DB%' | Set-Content '%BACKEND%\.env' -NoNewline"

rem ---------- 4) Dependencias ----------
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

rem ---------- 5) Seed (roles + super_admin) ----------
echo [..]  Sembrando roles y super_admin
pushd "%BACKEND%"
call npm run seed
popd

rem ---------- 6) Backend ----------
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  Backend ya esta corriendo
) else (
    echo [..]  Levantando backend ^(puerto 3000^)
    start "DeskHub Backend" /min cmd /c "cd /d %BACKEND% && node index.js > %RAIZ%.backend.log 2>&1"
)

rem ---------- 7) Frontend ----------
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  Frontend ya esta corriendo
) else (
    echo [..]  Levantando frontend ^(puerto 5173^)
    start "DeskHub Frontend" /min cmd /c "cd /d %FRONTEND% && node node_modules\vite\bin\vite.js > %RAIZ%.frontend.log 2>&1"
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