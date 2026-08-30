# VERTEX Docker Deployment - Quick Reference

## 🐳 What's New: Docker Setup Complete

Your VERTEX project now has complete Docker containerization! Here's what was created:

---

## 📦 Files Created

### Docker Configuration Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Defines backend container (Spring Boot app) |
| `docker-compose.yml` | Orchestrates backend + MySQL |
| `docker-compose.full.yml` | Orchestrates frontend + backend + MySQL |
| `.env.example` | Environment variables template |
| `.dockerignore` | Files/dirs to exclude from build |
| `frontend/Dockerfile` | Defines frontend container (React/Nginx) |
| `frontend/nginx.conf` | Nginx configuration for frontend proxy |

### Helper Scripts

| File | Purpose |
|------|---------|
| `docker-start.sh` | Linux/Mac quick start script |
| `docker-start.bat` | Windows quick start script |
| `DOCKER_DEPLOYMENT.md` | Comprehensive deployment guide |

---

## 🚀 Quick Start

### Option 1: Windows
```bash
# Double-click this file
docker-start.bat

# Or run from PowerShell
.\docker-start.bat
```

### Option 2: Linux/Mac
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### Option 3: Manual
```bash
# Backend only
docker-compose up -d

# Full stack
docker-compose -f docker-compose.full.yml up -d
```

---

## 🎯 What's Running

### Backend Only
```
MySQL Database       → localhost:3306
Backend API          → localhost:8080
API Documentation    → http://localhost:8080/swagger-ui.html
Health Check         → http://localhost:8080/api/v1/health
```

### Full Stack
```
React Frontend       → http://localhost:3000
Backend API          → http://localhost:8080
MySQL Database       → localhost:3306
API Documentation    → http://localhost:8080/swagger-ui.html
```

---

## 📋 Container Architecture

```
┌─────────────────────────────────────┐
│     Docker Network (bridge)         │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  vertex-frontend-app          │  │
│  │  Nginx on port 3000           │  │
│  │  Serves React SPA + proxies   │  │
│  │  /api/* to backend            │  │
│  └───────────────┬───────────────┘  │
│                  │                   │
│  ┌───────────────▼───────────────┐  │
│  │  vertex-backend-app           │  │
│  │  Spring Boot on port 8080     │  │
│  │  REST APIs + WebSocket        │  │
│  │  Business Logic               │  │
│  └───────────────┬───────────────┘  │
│                  │                   │
│  ┌───────────────▼───────────────┐  │
│  │  vertex-mysql-db              │  │
│  │  MySQL on port 3306           │  │
│  │  Database Storage             │  │
│  │  Persistent Volumes           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## ⚙️ Configuration

### Default Environment Variables
**File:** `.env.example` (copy to `.env`)

```env
# Database
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=vertex_projects
MYSQL_USER=vertex_user
MYSQL_PASSWORD=vertex_pass

# Ports
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Security
JWT_SECRET=your-64-byte-secret-here
CORS_ORIGINS=http://localhost:3000

# Performance
JAVA_OPTS=-Xmx512m -Xms256m
DB_POOL_MAX=20
```

### Customize Configuration
```bash
# Copy example
cp .env.example .env

# Edit with your settings
nano .env

# Restart services
docker-compose restart
```

---

## 🛠️ Common Commands

### Start & Stop
```bash
# Start services
docker-compose up -d

# Stop services (keep data)
docker-compose stop

# Stop and remove containers (keep volumes)
docker-compose down

# Stop and remove everything
docker-compose down -v
```

### Logs & Monitoring
```bash
# View logs (realtime)
docker-compose logs -f

# View specific service logs
docker-compose logs -f vertex-backend

# View status
docker-compose ps
```

### Database Access
```bash
# Connect to MySQL
docker-compose exec vertex-mysql-db mysql -u vertex_user -p

# Backup database
docker-compose exec -T vertex-mysql-db mysqldump -u root -p vertex_projects > backup.sql
```

### Debugging
```bash
# Execute shell in container
docker-compose exec vertex-backend sh

# Check health
curl http://localhost:8080/api/v1/health

# View network
docker network ls
docker network inspect vertex-network
```

---

## 📊 Services & Health Checks

All containers have automatic health checks:

```
✓ MySQL: Monitors connection availability
✓ Backend: Checks /api/v1/health endpoint
✓ Frontend: Monitors HTTP accessibility
```

**Check status:**
```bash
docker-compose ps

# Look for "healthy" or "starting" status
```

---

## 🔐 Security Checklist

Before production deployment:

- [ ] Change MySQL password: `MYSQL_PASSWORD`
- [ ] Generate strong JWT secret: `JWT_SECRET` (min 64 bytes)
- [ ] Update CORS origins: `CORS_ORIGINS`
- [ ] Enable HTTPS (use reverse proxy)
- [ ] Set proper file permissions: `chmod 600 .env`
- [ ] Keep images updated: `docker pull`
- [ ] Monitor logs for errors: `docker logs`

---

## 📈 Performance Tuning

### For Development
```env
JAVA_OPTS=-Xmx512m -Xms256m
DB_POOL_MAX=10
```

### For Production
```env
JAVA_OPTS=-Xmx2g -Xms1g -XX:+UseG1GC
DB_POOL_MAX=30
LOGGING_LEVEL=WARN
```

### Apply Changes
```bash
# Edit .env
nano .env

# Rebuild and restart (for Java changes)
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

**Services won't start?**
```bash
# Check Docker daemon
docker ps

# View full logs
docker-compose logs
```

**Port already in use?**
```bash
# Change port in .env
BACKEND_PORT=8081

# Restart
docker-compose restart
```

**Database connection failed?**
```bash
# Wait for MySQL (takes ~30 seconds)
docker-compose logs vertex-mysql-db

# Test connection
docker-compose exec -T vertex-mysql-db mysql -h localhost -u vertex_user -p -e "SELECT 1"
```

**Frontend can't reach backend?**
```bash
# Check nginx logs
docker-compose logs vertex-frontend

# Verify backend container status
docker-compose ps vertex-backend
```

---

## 📚 Documentation

- **Full Guide:** `DOCKER_DEPLOYMENT.md`
- **API Docs:** http://localhost:8080/swagger-ui.html
- **Docker Docs:** https://docs.docker.com/
- **Compose Reference:** https://docs.docker.com/compose/compose-file/

---

## 🔄 Update Workflow

### Update Application Code
```bash
# Pull latest code
git pull

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d
```

### Update Base Images
```bash
# Pull latest images
docker pull eclipse-temurin:24-jdk-alpine
docker pull mysql:8.0
docker pull nginx:alpine

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose up -d
```

---

## 📞 Support Resources

| Topic | Resource |
|-------|----------|
| Docker Issues | https://docs.docker.com/support/ |
| Docker Compose | https://docs.docker.com/compose/ |
| MySQL Docs | https://dev.mysql.com/doc/ |
| Spring Boot | https://spring.io/projects/spring-boot |
| React | https://react.dev/ |

---

## ✅ Pre-Deployment Checklist

- [ ] Docker installed (v20.10+)
- [ ] Docker Compose installed (v2.0+)
- [ ] Project code cloned/ready
- [ ] `.env` file created from `.env.example`
- [ ] Ports available (3000, 8080, 3306)
- [ ] At least 2GB free disk space
- [ ] At least 2GB free RAM
- [ ] Internet connection (for image pulls)

---

## 🎉 You're Ready!

Your VERTEX application is completely containerized and ready for deployment!

**Next Steps:**
1. Create `.env` file: `cp .env.example .env`
2. Start services: `docker-compose up -d`
3. Access frontend: http://localhost:3000
4. Check health: curl http://localhost:8080/api/v1/health
5. Read full guide: `DOCKER_DEPLOYMENT.md`

---

**Generated:** August 30, 2026  
**Version:** 2.0.0  
**Status:** Production Ready  
**Maintainer:** VERTEX Development Team

