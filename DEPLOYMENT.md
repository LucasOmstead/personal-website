# CooperAItion Deployment Guide

This project supports both local development and production deployment configurations.

## Local Development

For local development, use the simplified HTTP-only configuration:

```powershell
# Start local development environment
docker-compose -f docker-compose.local.yml up --build

# Access the application
# http://localhost - Main homepage
# http://localhost/cooperaition - CooperAItion app
# API endpoints available at http://localhost/cooperaition/api/
```

**Local Development Features:**
- HTTP-only (no SSL certificates needed)
- Homepage served at root path (`/`)
- CooperAItion app at `/cooperaition` path (same as production)
- API routing at `/cooperaition/api/` (same as production)
- Volume mounting for live development
- More relaxed rate limiting

## Production Deployment

For production deployment with SSL and multi-project hosting:

```bash
# Set your domain in environment variable (Linux/Ubuntu)
export DOMAIN="lucasomstead.com"

# Step 1: Start the HTTP-only nginx for SSL challenge (keep running in background)
docker system prune -f
docker compose --profile init up -d nginx-init

# Step 2: Get SSL certificates (nginx-init must be running)
# Note: If certificates already exist, certbot will skip renewal
docker compose --profile cert up certbot

# Step 3: Stop the init container and start production
docker compose --profile init down
docker compose --profile prod up -d

# Access the applications
# https://lucasomstead.com - Main homepage
# https://lucasomstead.com/cooperaition - CooperAItion app
# https://lucasomstead.com/shapeshifters - Shape Shifters project
# API endpoints available at https://lucasomstead.com/cooperaition/api/
```

**Production Features:**
- HTTPS with Let's Encrypt SSL certificates
- Multi-project hosting on same domain
- Path-based routing (`/cooperaition` for the game)
- Automatic certificate renewal
- Production rate limiting

## Environment Variables

The system uses environment variables for flexible configuration:

- `DOMAIN`: Domain name for SSL certificates and nginx configuration
  - Local default: `localhost`
  - Production example: `lucasomstead.com`

## File Structure

```
├── docker-compose.yml              # Production configuration with SSL
├── docker-compose.local.yml        # Local development configuration
├── nginx.conf                      # Production nginx with SSL + multi-project
├── nginx.local.conf                # Local nginx HTTP-only for development
├── nginx-init.conf                 # Initial nginx for SSL certificate setup
├── homepage/                       # Main website files
└── cooperAItion-frontend/
    └── src/environments/
        ├── environment.ts           # Development API config (/cooperaition/api/)
        └── environment.prod.ts      # Production API config (/cooperaition/api/)
```

## Switching Between Environments

1. **Local Development**:
   - Uses `environment.ts` with `apiUrl: '/cooperaition/api/'`
   - Angular serves with development configuration
   - nginx routes `/cooperaition/api/` to backend
   - Homepage served at `/`, CooperAItion at `/cooperaition`

2. **Production**:
   - Uses `environment.prod.ts` with `apiUrl: '/cooperaition/api/'`
   - Angular builds with production configuration
   - nginx routes `/cooperaition/api/` to backend
   - Same URL structure as local development

## Troubleshooting

### Docker Network Issues

#### "Network Resource Still in Use" Errors
If you get "network resource is still in use" errors after running `docker compose down`:

**Root cause**: Different Docker Compose profiles (`init`, `cert`, `prod`) create containers that persist and prevent network cleanup.

```bash
# Check what containers are still running from ANY profile
docker ps -a

# Stop ALL containers from all profiles in the current project
docker compose --profile init down --remove-orphans
docker compose --profile cert down --remove-orphans  
docker compose --profile prod down --remove-orphans
docker compose down --remove-orphans  # Default profile

# If containers are still running, force stop them
docker stop $(docker ps -q) 2>/dev/null || true

# Clean up networks and containers
docker container prune -f
docker network prune -f

# Now you can start fresh
docker compose --profile init up -d nginx-init
```

#### "Network Not Found" or "Failed to Set Up Container Networking" Errors

**IMPORTANT**: This error occurs even when the network EXISTS (`docker network ls` shows `personal-website_default`). 

**Root Cause**: Docker daemon internal state corruption - the network exists but Docker can't use it. This is a known Docker bug on Ubuntu servers, especially with systemd interaction.

**Why `docker compose down` doesn't fix it**: The network IS properly cleaned up, but Docker's internal networking state becomes corrupted and needs a daemon restart.

```bash
# Step 1: Verify the network exists (it probably does)
docker network ls

# Step 2: The network exists but Docker can't use it - restart Docker daemon
sudo systemctl restart docker

# Step 3: Wait for Docker to fully restart
sleep 5

# Step 4: Try again - this usually works
docker compose --profile prod up -d
```

**If the above doesn't work, try the nuclear option:**

```bash
# Complete reset - stop everything first
docker compose --profile prod down --remove-orphans
docker compose --profile init down --remove-orphans
docker compose --profile cert down --remove-orphans

# Stop ALL containers system-wide
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Remove ALL networks and rebuild
docker network prune -f
docker system prune -f

# Restart Docker completely
sudo systemctl restart docker

# Wait for Docker to fully restart
sleep 10

# Start with a clean slate
docker compose --profile prod up -d
```

**Alternative approach if above fails:**
```bash
# Manually recreate the default network
docker network create personal-website_default

# Then try starting containers
docker compose --profile prod up -d
```

### Local Development Issues
- Port 80 already in use: Stop other web servers or change port mapping
- Volume mounting not working: Check file paths and Docker file sharing settings

### Production Issues
- SSL certificate errors: Ensure DNS is pointing to server before running certbot
- Rate limiting: Check nginx logs for rate limit hits
- Multi-project routing: Verify nginx path configurations

### General
- Container networking: All services communicate through Docker internal networks
- Environment variables: Make sure DOMAIN is set correctly for your deployment
