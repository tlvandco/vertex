@echo off
REM VERTEX Docker Quick Start Script (Windows)
REM This script sets up and starts the VERTEX application with Docker

setlocal enabledelayedexpansion

title VERTEX Docker Deployment Quick Start

echo.
echo ============================================================
echo          VERTEX Docker Deployment Quick Start
echo         Enterprise Project Management v2.0.0
echo ============================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed
    echo Please ensure Docker Desktop is properly installed
    pause
    exit /b 1
)

echo [OK] Docker and Docker Compose are installed
echo.

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found
    if exist .env.example (
        echo Creating .env from .env.example...
        copy .env.example .env
        echo [OK] .env file created
    ) else (
        echo [ERROR] .env.example not found
        pause
        exit /b 1
    )
)

echo.
echo Select deployment option:
echo 1 - Backend only (with MySQL)
echo 2 - Full stack (Frontend + Backend + MySQL)
echo 3 - Stop/Down services
echo 4 - View logs
echo 5 - View container status
echo.
set /p choice="Enter choice [1-5]: "

if "%choice%"=="1" (
    cls
    echo.
    echo Starting Backend + MySQL...
    echo.
    docker-compose up -d
    if errorlevel 1 (
        echo [ERROR] Failed to start services
        pause
        exit /b 1
    )
    echo [OK] Services started
    echo.
    echo Waiting for services to become healthy...
    timeout /t 5 /nobreak
    echo.
    echo ============================================================
    echo        Backend is running at: http://localhost:8080
    echo   API Documentation: http://localhost:8080/swagger-ui.html
    echo Health Check: http://localhost:8080/api/v1/health
    echo ============================================================
    echo.
    docker-compose ps
    echo.
) else if "%choice%"=="2" (
    cls
    echo.
    echo Starting Full Stack ^(Frontend + Backend + MySQL^)...
    echo.
    docker-compose -f docker-compose.full.yml up -d
    if errorlevel 1 (
        echo [ERROR] Failed to start services
        pause
        exit /b 1
    )
    echo [OK] Services started
    echo.
    echo Waiting for services to become healthy...
    timeout /t 10 /nobreak
    echo.
    echo ============================================================
    echo        Frontend is running at: http://localhost:3000
    echo        Backend is running at: http://localhost:8080
    echo   API Documentation: http://localhost:8080/swagger-ui.html
    echo ============================================================
    echo.
    docker-compose -f docker-compose.full.yml ps
    echo.
) else if "%choice%"=="3" (
    cls
    echo.
    echo Stopping services...
    echo.
    docker-compose down
    if errorlevel 1 (
        echo [ERROR] Failed to stop services
        pause
        exit /b 1
    )
    echo [OK] Services stopped
    echo.
) else if "%choice%"=="4" (
    cls
    docker-compose logs -f vertex-backend
) else if "%choice%"=="5" (
    cls
    docker-compose ps
    echo.
) else (
    echo [ERROR] Invalid choice
    pause
    exit /b 1
)

echo.
echo ============================================================
echo                   Useful Commands
echo ============================================================
echo.
echo View logs:
echo   docker-compose logs -f vertex-backend
echo.
echo Access database:
echo   docker-compose exec vertex-mysql-db mysql -u vertex_user -p
echo.
echo Restart services:
echo   docker-compose restart
echo.
echo Stop services:
echo   docker-compose stop
echo.
echo Full cleanup (removes containers):
echo   docker-compose down
echo.
echo For detailed guide, see: DOCKER_DEPLOYMENT.md
echo.
pause

