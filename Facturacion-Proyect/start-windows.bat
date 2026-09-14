@echo off
setlocal enabledelayedexpansion

rem ======================================
rem  Facturación EPM - arranque en Windows (WAMP)
rem  Requiere: Node.js y WAMP instalados
rem ======================================

set "RAIZ=%~dp0"
set "BACKEND=%RAIZ%Backend"
set "FRONTEND=%RAIZ%frontend"

rem Puerto del MySQL de WAMP (lo normal es 3306)
set "PORT_DB=3306"

echo ======================================
echo  Facturacion EPM - arranque del proyecto
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
"%MYSQL_BIN%\mysql.exe" -h 127.0.0.1 -P %PORT_DB% -u root -e "CREATE DATABASE IF NOT EXISTS facturacion_medellin" >nul 2>&1
echo [OK]  Base de datos 'facturacion_medellin' asegurada

rem ---------- 3) Backend\.env ----------
rem Si existe pero apunta al puerto viejo (3307), se regenera
findstr /i "DB_PORT=3307" "%BACKEND%\.env" >nul 2>&1 && goto crear_env
if exist "%BACKEND%\.env" goto env_listo
:crear_env
echo [..]  Creando Backend\.env
(
echo PORT=3000
echo DB_HOST=127.0.0.1
echo DB_PORT=%PORT_DB%
echo DB_NAME=facturacion_medellin
echo DB_USER=root
echo DB_PASSWORD=
echo JWT_SECRET=cambia_esta_clave_por_una_segura
echo JWT_EXPIRES_IN=8h
echo CORS_ORIGIN=http://localhost:5173
) > "%BACKEND%\.env"
:env_listo
echo [OK]  Backend\.env configurado

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

rem ---------- 5) Seed (roles + usuarios) ----------
echo [..]  Sembrando roles y usuarios iniciales
pushd "%BACKEND%"
call npm run seed
popd

rem ---------- 6) Backend ----------
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  Backend ya esta corriendo
) else (
    echo [..]  Levantando backend ^(puerto 3000^)
    start "" /min "%RAIZ%run-backend.bat"
)

rem ---------- 7) Frontend ----------
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  Frontend ya esta corriendo
) else (
    echo [..]  Levantando frontend ^(puerto 5173^)
    start "" /min "%RAIZ%run-frontend.bat"
)

echo.
echo ======================================
echo  Facturacion EPM disponible en:
echo    Frontend : http://localhost:5173
echo    API      : http://localhost:3000/api
echo    Login    : superadmin@facturacionmedellin.com / SuperAdmin123
echo.
echo  Logs: .backend.log y .frontend.log
echo ======================================
endlocal