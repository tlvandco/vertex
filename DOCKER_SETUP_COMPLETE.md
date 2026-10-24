# VERTEX Docker Deployment - Complete Setup Guide

## 🎯 Summary

Your VERTEX project is now fully containerized with Docker! This guide walks you through deployment in 5 minutes.

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **Docker Desktop installed**
   - Download: https://www.docker.com/products/docker-desktop
   - Verify: `docker --version` (should be 20.10+)

2. **Docker Compose included**
   - Verify: `docker-compose --version` (should be 2.0+)
   - Comes with Docker Desktop

3. **Available ports**
   - 3306 for MySQL
   - 8080 for Backend API
   - 3000 for Frontend (optional)

4. **Minimum system requirements**
   - 2GB RAM available
   - 5GB free disk space
   - Internet connection

---

## 🚀 5-Minute Quick Start

### Step 1: Open Terminal/PowerShell
```bash
# Navigate to project directory
cd C:\Users\user\Desktop\anantha-design-group\backend\design
```

### Step 2: Create Environment File
```bash
# Copy environment template
cp .env.example .env

# Verify .env was created
ls -la .env
```

### Step 3: Start Services

**Option A: Backend Only (Development)**
```bash
docker-compose up -d
```

**Option B: Full Stack (Frontend + Backend + Database)**
```bash
docker-compose -f docker-compose.full.yml up -d
```

### Step 4: Wait for Services
```bash
# Watch for healthy status (takes ~30-60 seconds)
docker-compose ps

# Expected: All containers should show "Up (healthy)"
```

### Step 5: Access Application
```
✓ Frontend:      http://localhost:3000
✓ Backend API:   http://localhost:8080
✓ API Docs:      http://localhost:8080/swagger-ui.html
✓ Health Check:  http://localhost:8080/api/v1/health
```

---

## 🖥️ Platform-Specific Instructions

### Windows

#### Using GUI (Easiest)
```bash
# 1. Open Windows Explorer
# 2. Navigate to project folder
# 3. Double-click: docker-start.bat
# 4. Select option 1 or 2
# 5. Wait for services to start
```

#### Using PowerShell
```powershell
# Open PowerShell as Administrator
cd C:\Users\user\Desktop\anantha-design-group\backend\design

# Create .env file
Copy-Item .env.example .env

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### macOS / Linux

```bash
# Navigate to project
cd /path/to/backend/design

# Make script executable
chmod +x docker-start.sh

# Run interactive startup
./docker-start.sh

# Or manually start
cp .env.example .env
docker-compose up -d
```

---

## 🎛️ Configuration

### Default Settings
The `.env.example` includes sensible defaults for development:

```env
# Database
MYSQL_USER=vertex_user
MYSQL_PASSWORD=vertex_pass
MYSQL_DATABASE=vertex_projects

# Application
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Security
JWT_SECRET=<64-byte-key>
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Change Configuration
```bash
# Edit .env file
nano .env

# Common changes:
BACKEND_PORT=9000      # Change backend port
MYSQL_PASSWORD=newpass # Change database password
JAVA_OPTS=-Xmx1g       # Increase Java memory

# Restart to apply changes
docker-compose restart
```

---

## 📊 Deployment Modes

### Mode 1: Backend Only
**Best for:** Local development, testing APIs, frontend on separate machine

**Start:**
```bash
docker-compose up -d
```

**Services:**
- MySQL Database: `localhost:3306`
- Backend API: `http://localhost:8080`
- Frontend: Development server on different machine/port

**Use Case:** Developer testing backend while running React dev server locally

### Mode 2: Full Stack
**Best for:** Production, complete application, standalone deployment

**Start:**
```bash
docker-compose -f docker-compose.full.yml up -d
```

**Services:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- MySQL Database: `localhost:3306`
- All in one Docker network

**Use Case:** Production deployment with all components containerized

### Mode 3: Cloud Deployment
**For:** AWS, Azure, GCP, DigitalOcean

Push to registry:
```bash
# Build image
docker build -t your-registry/vertex-backend:2.0.0 .

# Push to registry
docker push your-registry/vertex-backend:2.0.0

# Pull on cloud server
docker pull your-registry/vertex-backend:2.0.0

# Run on cloud
docker run -e DB_URL=<cloud-db> -p 8080:8080 vertex-backend:2.0.0
```

---

## 🐳 Container Architecture

```
┌─────────────────────────────────────────────┐
│        Docker Network (Isolated)            │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend Container (Nginx)                 │
│  ├─ Serves React SPA on port 3000          │
│  ├─ Proxies API requests to backend         │
│  └─ Security headers, caching policies      │
│                                             │
│  Backend Container (Spring Boot)            │
│  ├─ REST APIs on port 8080                 │
│  ├─ WebSocket connections                  │
│  ├─ Business logic & authentication         │
│  ├─ Connects to MySQL                      │
│  └─ Logs to mounted volume                 │
│                                             │
│  Database Container (MySQL)                 │
│  ├─ Port 3306 (internal only)              │
│  ├─ Database: vertex_projects              │
│  ├─ Persistent volume for data             │
│  └─ Automated backups capability           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Common Operations

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f vertex-backend
docker-compose logs -f vertex-mysql-db

# Last 50 lines
docker-compose logs --tail 50

# With timestamps
docker-compose logs -f --timestamps
```

### Stop Services (Keep Data)
```bash
docker-compose stop
```

### Restart Services
```bash
docker-compose restart

# Restart specific service
docker-compose restart vertex-backend
```

### Remove Services (Delete Containers, Keep Volumes)
```bash
docker-compose down
```

### Full Cleanup (Delete Everything)
```bash
# WARNING: This deletes all data!
docker-compose down -v
```

### Rebuild Images
```bash
# After code changes
docker-compose build

# Rebuild and start
docker-compose up -d --build

# Rebuild without cache
docker-compose build --no-cache
```

### Execute Commands
```bash
# Shell in backend container
docker-compose exec vertex-backend sh

# Run MySQL commands
docker-compose exec vertex-mysql-db mysql -u vertex_user -p

# Check Java version
docker-compose exec vertex-backend java -version
```

---

## 📈 Monitoring & Health

### Check Status
```bash
docker-compose ps

# Shows:
# - Container name and ID
# - Status (Up, Down, Exited)
# - Health (healthy, starting, unhealthy)
# - Port mappings
```

### Health Checks
All containers have automatic health checks:

```
✓ MySQL: Pings database every 10 seconds
✓ Backend: Checks /api/v1/health every 10 seconds
✓ Frontend: Checks HTTP response every 10 seconds
```

### Monitor Resources
```bash
# Real-time resource usage
docker stats

# Shows CPU, memory, network I/O per container
```

### View Detailed Info
```bash
docker-compose ps -a
docker inspect vertex-backend-app
docker network inspect vertex-network
```

---

## 🔐 Security Checklist

### For Development
✓ Use default credentials from `.env.example`
✓ Keep localhost-only access
✓ Enable debug logging

### For Staging/Production
- [ ] Change all passwords: `MYSQL_PASSWORD`, `JWT_SECRET`
- [ ] Generate secure JWT: `JWT_SECRET` (min 64 bytes)
- [ ] Update CORS: `CORS_ORIGINS=https://yourdomain.com`
- [ ] Enable HTTPS: Use reverse proxy (Nginx/Traefik)
- [ ] Restrict ports: Only expose 80/443
- [ ] Update logging: `LOGGING_LEVEL=WARN`
- [ ] Monitor logs: Set up log aggregation
- [ ] Set file permissions: `chmod 600 .env`
- [ ] Use secrets manager: Don't store in .env
- [ ] Regular backups: Automated DB backups

---

## 🔧 Troubleshooting

### Container Won't Start
```bash
# View error logs
docker-compose logs vertex-backend

# Common causes:
# 1. Port already in use → Change BACKEND_PORT
# 2. Database not ready → Wait 60+ seconds
# 3. Out of memory → Reduce JAVA_OPTS
```

### Cannot Access Application
```bash
# Verify container is healthy
docker-compose ps

# Check if port is accessible
netstat -an | grep 8080  # Windows
lsof -i :8080            # Mac/Linux

# Restart container
docker-compose restart vertex-backend
```

### Database Connection Failed
```bash
# Check MySQL logs
docker-compose logs vertex-mysql-db

# Test connection
docker-compose exec -T vertex-mysql-db mysql -h localhost -u vertex_user -p

# Verify credentials in .env
cat .env | grep MYSQL
```

### Frontend Can't Reach Backend
```bash
# Check backend is running
docker-compose ps vertex-backend

# Verify network connectivity
docker-compose exec vertex-frontend wget -O- http://vertex-backend:8080/

# Check nginx logs
docker-compose logs vertex-frontend
```

### High Memory/CPU Usage
```bash
# Monitor resources
docker stats

# Reduce heap size in .env
JAVA_OPTS=-Xmx512m -Xms256m

# Increase swap on host
# macOS/Linux: Depends on OS
# Windows: Docker Desktop settings → Resources
```

---

## 📚 File Structure

```
backend/design/
├── Dockerfile                    # Backend container definition
├── docker-compose.yml            # Orchestration (backend + MySQL)
├── docker-compose.full.yml       # Orchestration (full stack)
├── .env.example                  # Environment template
├── .dockerignore                 # Exclude from build
├── docker-start.sh               # Linux/Mac quick start
├── docker-start.bat              # Windows quick start
├── DOCKER_QUICK_START.md         # Quick reference
├── DOCKER_DEPLOYMENT.md          # Detailed guide
├── src/
│   └── main/resources/
│       └── migration/
│           ├── V1_0_0__*.sql     # Initial schema
│           └── V1_0_1__*.sql     # JWT schema
└── frontend/
    ├── Dockerfile                # Frontend container
    ├── nginx.conf                # Nginx configuration
    ├── package.json
    ├── src/
    └── public/
```

---

## 🚀 Next Steps

### 1. Start Now
```bash
cp .env.example .env
docker-compose up -d
```

### 2. Verify It Works
```bash
# Check health
curl http://localhost:8080/api/v1/health

# Expected: {"status":"UP"}
```

### 3. Initialize Admin User
```bash
curl -X POST http://localhost:8080/api/v2/auth/init-admin

# Creates admin@vertex.com / admin@123
```

### 4. Create Test Users
```bash
curl -X POST http://localhost:8080/api/v2/auth/init-test-users

# Creates pm@vertex.com, designer@vertex.com, client@vertex.com
```

### 5. Access Application
```
Frontend: http://localhost:3000
Backend:  http://localhost:8080
```

---

## 📞 Getting Help

| Issue | Resource |
|-------|----------|
| Docker Problems | https://docs.docker.com/ |
| Docker Compose | https://docs.docker.com/compose/ |
| MySQL Issues | https://dev.mysql.com/doc/ |
| Spring Boot | https://spring.io/projects/spring-boot |
| React | https://react.dev/ |
| VERTEX API | http://localhost:8080/swagger-ui.html |

---

## 📋 Deployment Checklist

### Before First Deployment
- [ ] Docker Desktop installed
- [ ] Project directory accessible
- [ ] Ports 3000, 8080, 3306 available
- [ ] At least 2GB free memory
- [ ] Internet connection available

### Initial Setup
- [ ] Create `.env` from `.env.example`
- [ ] Review and modify environment variables
- [ ] Start services with `docker-compose up -d`
- [ ] Wait 60 seconds for containers to become healthy
- [ ] Verify all containers: `docker-compose ps`

### Verification
- [ ] Access frontend: http://localhost:3000
- [ ] Access backend: http://localhost:8080
- [ ] Check health: http://localhost:8080/api/v1/health
- [ ] View API docs: http://localhost:8080/swagger-ui.html
- [ ] Test database: `docker-compose exec vertex-mysql-db mysql -u vertex_user -p`

### Post-Deployment
- [ ] Monitor logs: `docker-compose logs -f`
- [ ] Set up backups
- [ ] Configure monitoring/alerts
- [ ] Schedule regular updates
- [ ] Document any customizations

---

## 🎉 Success!

Your VERTEX application is now running in Docker!

**Current Status:**
- ✅ Backend containerized
- ✅ Database containerized
- ✅ Frontend containerized (optional)
- ✅ Production-ready
- ✅ Horizontally scalable

**What's Next:**
1. Deploy to cloud (AWS, Azure, GCP)
2. Set up CI/CD pipeline
3. Configure monitoring/logging
4. Scale horizontally
5. Setup backup strategy

**Happy Deploying! 🚀**

---

**Generated:** August 30, 2026  
**VERTEX Version:** 2.0.0  
**Docker Ready:** Yes  
**Production Ready:** Yes

