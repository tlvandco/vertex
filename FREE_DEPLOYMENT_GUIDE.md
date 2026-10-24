# VERTEX Studio — Complete Free Production Deployment Guide ($0/Month)

This document provides exact, copy-paste configurations to deploy the entire **VERTEX Architectural Studio** full-stack web application (React frontend + Express API + health probes + rate limiting) completely **FREE**.

---

## 1. Option A: Render.com (Recommended for Free Full-Stack)

Render provides a **free web service** that can build directly from GitHub and run both the Vite-built client and Express server under port 3000.

### Step-by-Step Instructions:
1. **Push your code to GitHub / GitLab:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete production ready build"
   git remote add origin https://github.com/<your-username>/vertex-studio.git
   git push -u origin main
   ```
2. **Create New Web Service on Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** → **Web Service**.
   - Select your repository.
   - Configure the service settings:
     - **Name:** `vertex-studio`
     - **Region:** Any (e.g., Oregon / Frankfurt / Singapore)
     - **Branch:** `main`
     - **Runtime:** `Node` (or `Docker`)
     - **Build Command:** `npm ci && npm run build`
     - **Start Command:** `node dist/server.cjs`
     - **Instance Type:** `Free` ($0/mo)
3. **Environment Variables:**
   Add these in the Render Environment tab:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
4. **Deploy:**
   Click **Create Web Service**. Your app will be live at `https://vertex-studio.onrender.com` in ~2 minutes with free SSL!

*Tip for Zero Downtime on Render:* Free tier sleeps after 15 minutes of inactivity. To keep it awake 24/7 for free, register your health check URL (`https://vertex-studio.onrender.com/api/health`) at [UptimeRobot.com](https://uptimerobot.com) with a 10-minute ping.

---

## 2. Option B: Fly.io (Free Persistent Disk Volume)

Fly.io gives you up to 3 free micro VMs and **3 GB of free persistent storage volumes**. This allows the server's `data/vertex_storage.json` file to survive all container restarts without needing an external database.

### Step-by-Step Instructions:
1. **Install flyctl and login:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   fly auth login
   ```
2. **Launch the app using the provided `Dockerfile`:**
   ```bash
   fly launch --no-deploy
   ```
3. **Create the free 1GB persistent volume for the database file:**
   ```bash
   fly volumes create vertex_data --size 1
   ```
4. **Configure `fly.toml` to mount the volume:**
   ```toml
   app = "vertex-studio"
   primary_region = "ord"

   [build]
     dockerfile = "Dockerfile"

   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = 'stop'
     auto_start_machines = true
     min_machines_running = 0

   [[mounts]]
     source = "vertex_data"
     destination = "/app/data"
   ```
5. **Deploy:**
   ```bash
   fly deploy
   ```

---

## 3. Option C: Google Cloud Run (Enterprise Free Tier)

Google Cloud Run offers an **Always Free** tier that includes **2,000,000 requests per month**, 360,000 GB-seconds of memory, and automated global HTTPS.

### Deploy with Google Cloud CLI:
```bash
# 1. Build and deploy container directly from source
gcloud run deploy vertex-studio \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=production
```

---

## 4. Local Production Verification with Docker

To test the exact container image locally prior to cloud deployment:

```bash
# Build and launch
docker-compose up --build -d

# Verify health endpoint
curl http://localhost:3000/api/health
# Response: {"status":"healthy","uptimeSeconds":...,"service":"vertex-architectural-core","version":"2.5.0-prod"}
```
