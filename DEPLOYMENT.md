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

```powershell
# Set your domain in environment variable
$env:DOMAIN = "lucasomstead.com"

# Initialize nginx configuration and SSL certificates
docker-compose --profile init up nginx-init
docker-compose --profile cert up certbot
docker-compose --profile prod up -d

# Access the applications
# https://lucasomstead.com - Main homepage
# https://lucasomstead.com/cooperaition - CooperAItion app
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
