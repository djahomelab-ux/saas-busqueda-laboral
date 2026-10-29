@echo off
rem Prepara y arranca el proyecto en Windows: Prolog, backend y frontend en tres ventanas.
rem Requisitos: Node.js 20+, SWI-Prolog y MySQL encendido (por ejemplo, desde XAMPP).
title Sistema de busqueda laboral
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No se encontro Node.js. Instalalo desde https://nodejs.org (version LTS^) y vuelve a abrir este archivo.
  pause
  exit /b 1
)

set "SWIPL=swipl"
where swipl >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\swipl\bin\swipl.exe" (
    set "SWIPL=C:\Program Files\swipl\bin\swipl.exe"
  ) else (
    echo [ERROR] No se encontro SWI-Prolog. Instalalo desde https://www.swi-prolog.org/download/stable
    pause
    exit /b 1
  )
)

if not exist "backend\.env" (
  echo Creando backend\.env a partir de backend\.env.example...
  copy "backend\.env.example" "backend\.env" >nul
)

if not exist "backend\node_modules" (
  echo Instalando dependencias del backend...
  pushd backend
  call npm install
  popd
)

if not exist "frontend\node_modules" (
  echo Instalando dependencias del frontend...
  pushd frontend
  call npm install
  popd
)

echo Verificando la base de datos...
pushd backend
call npm run crear-bd
if errorlevel 1 (
  popd
  echo.
  echo [ERROR] Revisa que MySQL este encendido y los datos de conexion en backend\.env
  pause
  exit /b 1
)
popd

start "Prolog - puerto 5000" /d "%~dp0prolog" cmd /k ""%SWIPL%" iniciar.pl"
start "Backend - puerto 3000" /d "%~dp0backend" cmd /k "npm run dev"
start "Frontend - puerto 5173" /d "%~dp0frontend" cmd /k "npm run dev"

echo.
echo Abriendo http://localhost:5173 ...
timeout /t 8 /nobreak >nul
start "" http://localhost:5173
echo Listo. Usuario de prueba: juan@demo.com / Demo12345
echo Para detener todo, cierra las tres ventanas que se abrieron.
pause
