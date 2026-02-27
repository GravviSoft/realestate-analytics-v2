# Real Estate Analytics Platform

A full-stack real estate analytics platform with a modern React dashboard frontend and Flask backend API.

## Quick Start

### Start with Docker (One Command)

```bash
docker compose up -d --build
```

This will start:
- **Frontend Dashboard** at http://localhost:3001
- **Backend API** at http://localhost:4001

### Stop Services

```bash
docker compose down
```

## What's Included

### Frontend (React + PrimeReact + Chart.js)
- **Interactive Dashboard** with real-time analytics
- **4 KPI Cards**: Revenue, Properties, Avg Value, Active Listings
- **4 Chart Types**: Line, Bar, Pie, and Doughnut charts
- **Data Tables**: Sortable, searchable transaction tables
- **Responsive Design**: Mobile-friendly layout
- **Mock Data Service**: Built-in fallback data for testing

### Backend (Flask)
- RESTful API endpoints
- Database integration ready
- Environment-based configuration

## Architecture

```
flask-realestate/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and data services
│   │   └── styles/        # CSS styles
│   ├── Dockerfile         # Multi-stage build
│   └── nginx.conf         # Nginx configuration
├── backend/               # Flask API
│   └── Dockerfile
└── docker-compose.yml     # Docker configuration
```

## Docker Commands

### Start Services
```bash
docker compose up -d --build
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
```

### Stop Services
```bash
docker compose down
```

### Rebuild After Changes
```bash
docker compose up -d --build
```

### View Service Status
```bash
docker compose ps
```

## Access Points

### Local Development
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:4001

### Production (via Traefik)
- **Frontend**: https://realestate.gravvisoft.com
- **Backend API**: https://realestate.gravvisoft.com/api

## Environment Variables

### Frontend
Create `frontend/.env`:
```bash
REACT_APP_API_URL=http://localhost:4001/api
```

### Backend
Create `backend/.env` with your Flask configuration.

## Features

### Dashboard Analytics
- **Revenue Trends**: Monthly revenue tracking with line charts
- **Property Distribution**: Property types breakdown with doughnut charts
- **Regional Sales**: Sales performance by region with bar charts
- **Transaction Management**: Searchable, sortable transaction table
- **Real-time KPIs**: Key metrics with trend indicators

### Technical Features
- **Docker Multi-stage Builds**: Optimized production images
- **Nginx Serving**: Fast static file serving with gzip compression
- **Health Checks**: Built-in container health monitoring
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **SPA Routing**: Proper client-side routing support
- **Static Asset Caching**: 1-year cache for static files

## Development Without Docker

### Frontend Development
```bash
cd frontend
npm install
npm start
```
Runs on http://localhost:3000

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Production Deployment

The application is configured for deployment behind Traefik reverse proxy with:
- **Automatic HTTPS** via Let's Encrypt
- **HTTP to HTTPS redirect**
- **Load balancing** ready
- **Health checks** for zero-downtime deployments

### First Time Setup
```bash
# Create external network for Traefik
docker network create proxy-net

# Start services
docker compose up -d --build
```

### Domain Configuration
Update `docker-compose.yml` to change the domain:
```yaml
- "traefik.http.routers.flask-app-frontend.rule=Host(`your-domain.com`)"
```

## Troubleshooting

### Port Already in Use
If ports 3001 or 4001 are in use:
```bash
# Edit docker-compose.yml and change:
ports:
  - "3002:80"  # For frontend
  - "4002:7000"  # For backend
```

### Clear Everything and Start Fresh
```bash
docker compose down
docker system prune -a
docker compose up -d --build
```

### View Container Details
```bash
# Inspect a service
docker compose exec frontend sh
docker compose exec backend bash
```

## Tech Stack

### Frontend
- React 18.2.0
- PrimeReact 10.2.1 (UI Components)
- Chart.js 4.4.1 (Charts)
- React Router 6.20.1 (Routing)
- Axios 1.6.2 (HTTP Client)
- PrimeFlex 3.3.1 (Grid System)

### Backend
- Flask (Python Web Framework)
- PostgreSQL/MySQL ready

### Infrastructure
- Docker & Docker Compose
- Nginx (Frontend serving)
- Traefik (Reverse proxy, production)

## License

This project is part of the Flask Real Estate application.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test with Docker locally: `docker compose up -d --build`
5. Submit a pull request
# realestate-analytics-v2
