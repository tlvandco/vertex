# VERTEX Docker Deployment Guide

## Overview

This guide provides instructions for deploying the VERTEX Enterprise Project Management Platform using Docker and Docker Compose.

**Version:** 2.0.0  
**Date:** August 30, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Deployment Options](#deployment-options)
5. [Configuration](#configuration)
6. [Management](#management)
7. [Troubleshooting](#troubleshooting)
8. [Production Considerations](#production-considerations)

---

## Prerequisites

### System Requirements
- **Docker:** 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose:** 2.0+ (included with Docker Desktop)
- **Disk Space:** Minimum 5GB free
- **RAM:** Minimum 2GB available
- **Network:** Ports 3000 (frontend), 8080 (backend), 3306 (MySQL) available

### Verify Installation
```bash
docker --version
docker compose version
```

### Optional: Docker Registry Account
- For pushing custom images to a registry
- Sign up at [Docker Hub](https://hub.docker.com/)

---

## Quick Start

### 1. Clone or Navigate to Project
```bash
cd C:\Users\user\Desktop\anantha-design-group\backend\design
```

### 2. Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings (optional - defaults work for development)
# nano .env  (Linux/Mac)
# notepad .env  (Windows)
```

### 3. Start Services
**Backend only (with database):**
```bash
docker compose up -d
```

**Full stack (backend + frontend + database):**
```bash
docker compose -f docker-compose.full.yml up -d
```

### 4. Verify Services are Running
```bash
docker compose ps
```

Expected output:
```
CONTAINER ID   IMAGE                    PORTS                   STATUS
abc123         vertex-backend-app       0.0.0.0:8080->8080/tcp  Up 2 minutes (healthy)
def456         vertex-mysql-db          0.0.0.0:3306->3306/tcp  Up 2 minutes (healthy)
ghi789         vertex-frontend-app      0.0.0.0:3000->3000/tcp  Up 1 minute (healthy)
```

### 5. Access Services

| Service | URL | Default |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React app |
| Backend API | http://localhost:8080 | Spring Boot |
| API Docs | http://localhost:8080/swagger-ui.html | Swagger UI |
| Health Check | http://localhost:8080/api/v1/health | Health status |
| MySQL | localhost:3306 | Database |

---

## Architecture

### Service Diagram
```
┌─────────────────────────────────────────────────────┐
│                    Docker Network                    │
│                  (vertex-network)                    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │   Frontend       │  │    Backend       │          │
│  │  (vertex-        │  │  (vertex-        │          │
│  │   frontend-app)  │  │   backend-app)   │          │
│  │                  │  │                  │          │
│  │ Nginx on 3000    │  │ Spring Boot      │          │
│  │                  │  │ on 8080          │          │
│  └────────┬─────────┘  └────────┬─────────┘          │
│           │                     │                    │
│           └─────────┬───────────┘                    │
│                     │                                │
│                     ▼                                │
│          ┌──────────────────────┐                   │
│          │  MySQL Database      │                   │
│          │  (vertex-mysql-db)   │                   │
│          │                      │                   │
│          │  Port 3306           │                   │
│          │  vertex_projects DB  │                   │
│          └──────────────────────┘                   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### Data Flow
```
Client Browser
    ↓
Nginx (Frontend) - Port 3000
    ├─ Serves React SPA
    └─ Proxies /api/* to Backend
         ↓
    Spring Boot Backend - Port 8080
         ├─ REST APIs (/api/v2/*)
         ├─ WebSocket connections
         └─ Processes business logic
              ↓
         MySQL Database - Port 3306
              ├─ Stores project data
              ├─ User authentication
              └─ Persists state
```

---

## Deployment Options

### Option 1: Backend Only (Development)
Use when frontend is developed separately or on local machine.

```bash
docker compose up -d

# Access:
# - Backend: http://localhost:8080
# - API Docs: http://localhost:8080/swagger-ui.html
# - Frontend: http://localhost:3000 (separate npm dev server)
```

**Use Case:**
- Local development
- Backend testing only
- Frontend on different machine

### Option 2: Full Stack (Production)
Includes frontend, backend, and database in one deployment.

```bash
docker compose -f docker-compose.full.yml up -d

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8080 (via frontend proxy)
# - Database: localhost:3306
```

**Use Case:**
- Production deployment
- Complete application stack
- Self-contained deployment

### Option 3: Kubernetes Deployment
For enterprise deployments with k8s:

Create `k8s-deployment.yaml` (example):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vertex-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vertex
  template:
    metadata:
      labels:
        app: vertex
    spec:
      containers:
      - name: backend
        image: vertex-projects:2.0.0
        ports:
        - containerPort: 8080
        env:
        - name: DB_URL
          value: jdbc:mysql://mysql:3306/vertex_projects
        # Additional env vars...
```

Deploy with:
```bash
kubectl apply -f k8s-deployment.yaml
```

---

## Configuration

### Environment Variables

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

**Key Variables:**

#### Database
```env
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=vertex_projects
MYSQL_USER=vertex_user
MYSQL_PASSWORD=vertex_pass
MYSQL_PORT=3306
```

#### Application
```env
BACKEND_PORT=8080
FRONTEND_PORT=3000
PORT=8080
```

#### Security
```env
JWT_SECRET=your-64-byte-secret-key-here
JWT_EXP_MS=86400000
CORS_ORIGINS=http://localhost:3000,http://example.com
```

#### Performance
```env
JAVA_OPTS=-Xmx512m -Xms256m -XX:+UseG1GC
DB_POOL_MAX=20
DB_POOL_MIN=5
```

#### Logging
```env
LOGGING_LEVEL=INFO
```

### Configuration Management

#### For Different Environments

**Development (.env.dev):**
```env
LOGGING_LEVEL=DEBUG
JWT_SECRET=dev-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

**Staging (.env.staging):**
```env
LOGGING_LEVEL=WARN
JAVA_OPTS=-Xmx1g -Xms512m
BACKEND_PORT=8080
```

**Production (.env.prod):**
```env
LOGGING_LEVEL=WARN
JAVA_OPTS=-Xmx2g -Xms1g -XX:+UseG1GC
JWT_SECRET=your-production-secret-key
CORS_ORIGINS=https://yourdomain.com
```

Apply environment:
```bash
docker compose --env-file .env.prod up -d
```

---

## Management

### Start Services
```bash
# Start in background
docker compose up -d

# Start with full stack
docker compose -f docker-compose.full.yml up -d

# Start with logging
docker compose up
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f vertex-backend
docker compose logs -f vertex-mysql-db

# Last 100 lines
docker compose logs --tail 100

# Follow real-time
docker compose logs -f --timestamps
```

### Monitor Services
```bash
# View running containers
docker compose ps

# View resource usage
docker stats

# Display detailed info
docker compose ps -a
```

### Execute Commands in Container
```bash
# Access backend shell
docker compose exec vertex-backend sh

# Run MySQL commands
docker compose exec vertex-mysql-db mysql -u root -p

# Check Java version
docker compose exec vertex-backend java -version
```

### Stop Services
```bash
# Stop (keeps data)
docker compose stop

# Stop specific service
docker compose stop vertex-backend

# Stop all and remove containers
docker compose down

# Stop and remove volumes (WARNING: deletes data!)
docker compose down -v
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart vertex-backend

# Rebuild and restart
docker compose up -d --build
```

### Update Configuration
```bash
# Edit .env file
nano .env

# Restart services to apply changes
docker compose restart

# Or rebuild and restart
docker compose up -d --build
```

### Database Management
```bash
# Connect to MySQL
docker compose exec vertex-mysql-db mysql -h localhost -u vertex_user -p vertex_projects

# Backup database
docker compose exec vertex-mysql-db mysqldump -u root -p vertex_projects > backup.sql

# Restore database
docker compose exec -T vertex-mysql-db mysql -u root -p < backup.sql
```

### Cleanup
```bash
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (be careful!)
docker system prune -a
```

---

## Troubleshooting

### Service Won't Start

**Check logs:**
```bash
docker compose logs vertex-backend
```

**Common issues:**

1. **Port already in use:**
   ```bash
   # Change port in .env
   BACKEND_PORT=8081
   
   # Restart
   docker compose restart
   ```

2. **Database connection failed:**
   ```bash
   # Verify MySQL is healthy
   docker compose ps
   
   # Check MySQL logs
   docker compose logs vertex-mysql-db
   ```

3. **Out of memory:**
   ```bash
   # Increase Java heap in .env
   JAVA_OPTS=-Xmx2g -Xms1g
   
   # Rebuild and restart
   docker compose up -d --build
   ```

### Health Check Failures

**Check health status:**
```bash
docker compose ps  # Look for "health: starting" or "unhealthy"

# Wait for startup (can take 60+ seconds)
docker compose logs vertex-backend --follow
```

**Common causes:**
- Database not ready yet (add dependency with healthcheck)
- Application still starting (increase start_period)
- Network connectivity issues

### Data Persistence Issues

**Verify volumes:**
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect vertex-mysql_data

# Check volume contents
docker run -v vertex-mysql_data:/data alpine ls -la /data
```

### Performance Issues

**Check resource usage:**
```bash
docker stats

# Look for high CPU, memory, or I/O
```

**Solutions:**
- Increase JVM memory: `JAVA_OPTS=-Xmx2g -Xms1g`
- Increase database pool: `DB_POOL_MAX=30`
- Enable DB query logging: `LOGGING_LEVEL=DEBUG`

### Frontend Cannot Access Backend

**Check network connectivity:**
```bash
# From frontend container
docker compose exec vertex-frontend wget -O- http://vertex-backend:8080/api/v1/health

# Check nginx logs
docker compose logs vertex-frontend
```

**Solutions:**
- Verify backend URL in frontend config
- Check CORS settings: `CORS_ORIGINS`
- Ensure both containers on same network

### Database Connection Refused

**Verify MySQL is running:**
```bash
docker compose ps vertex-mysql-db  # Should show "Up (healthy)"

# Test connection
docker compose exec -T vertex-mysql-db mysql -h localhost -u vertex_user -p -e "SELECT 1"
```

**Common fixes:**
- Wait for MySQL to fully start (~30 seconds)
- Check DB credentials in .env
- Verify network connectivity

---

## Production Considerations

### Security

#### 1. Change Default Credentials
```env
# Generate strong passwords
MYSQL_ROOT_PASSWORD=generate-strong-password-here
MYSQL_PASSWORD=generate-strong-password-here
JWT_SECRET=generate-64-byte-secret-here
```

#### 2. Use Secrets Management
```bash
# Docker Secrets (for Swarm mode)
docker secret create db_password -

# Or use environment files with restricted permissions
chmod 600 .env.prod
```

#### 3. Update CORS Settings
```env
# Production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### 4. Enable HTTPS
Use reverse proxy (Nginx/Traefik) for SSL/TLS:
```yaml
services:
  traefik:
    image: traefik:latest
    ports:
      - "443:443"
      - "80:80"
    # Configure SSL certificates
```

### Backup Strategy

#### Automated Backups
```bash
# Create backup script
#!/bin/bash
timestamp=$(date +%Y%m%d_%H%M%S)
docker compose exec -T vertex-mysql-db mysqldump -u root -p$DB_PASS vertex_projects > backup_$timestamp.sql
gzip backup_$timestamp.sql
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup_script.sh  # Daily at 2 AM
```

### Monitoring

#### Container Health
```bash
# Monitor in real-time
watch docker compose ps

# Alert on unhealthy containers
docker compose ps | grep "unhealthy"
```

#### Application Metrics
```bash
# Access Actuator endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
```

### Scaling

#### Load Balancing
For multiple backend instances:
```yaml
  vertex-backend1:
    build: .
    # ...
  
  vertex-backend2:
    build: .
    # ...
  
  nginx-lb:
    image: nginx:latest
    # Configure load balancing
```

#### Database Replication
Consider MySQL replication for high availability.

### Updates

#### Update Application
```bash
# Pull latest code
git pull

# Rebuild images
docker compose build

# Restart with new image
docker compose up -d
```

#### Update Dependencies
```bash
# Update base images in Dockerfile
# FROM eclipse-temurin:24-jdk-alpine
# FROM node:18-alpine
# FROM nginx:latest

# Rebuild
docker compose build --no-cache

# Restart
docker compose up -d
```

---

## Advanced Scenarios

### Multi-Node Deployment (Docker Swarm)

Initialize swarm:
```bash
docker swarm init
docker stack deploy -c docker-compose.yml vertex
```

### CI/CD Integration

#### GitHub Actions Example
```yaml
name: Deploy to Docker
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and push
        run: |
          docker build -t vertex-projects:latest .
          docker push myregistry/vertex-projects:latest
          docker-compose up -d
```

### Development Workflow

```bash
# Clone repo
git clone <repo-url>
cd backend/design

# Start services
docker compose up -d

# Frontend development
cd frontend
npm install
npm run dev

# Backend development (hot reload not available in Docker)
# Or run locally on host machine

# View logs
docker compose logs -f vertex-backend
```

---

## Health Monitoring

### Check All Services
```bash
#!/bin/bash
echo "=== VERTEX Docker Health Check ==="
echo ""
echo "MySQL:"
curl -s http://localhost:3306 &>/dev/null && echo "✓ Accessible" || echo "✗ Not accessible"

echo "Backend:"
curl -s http://localhost:8080/api/v1/health | jq '.status'

echo "Frontend:"
curl -s http://localhost:3000 | head -1 | grep -q "<!DOCTYPE" && echo "✓ Online" || echo "✗ Offline"

echo ""
echo "Container Status:"
docker compose ps
```

---

## Support & Documentation

- **Docker Docs:** https://docs.docker.com/
- **Docker Compose:** https://docs.docker.com/compose/
- **VERTEX Documentation:** See other markdown files in project
- **API Documentation:** http://localhost:8080/swagger-ui.html (running)

---

**Generated:** August 30, 2026  
**Version:** 2.0.0  
**Status:** Production Ready  
**Maintainer:** VERTEX Development Team

