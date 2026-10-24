#!/bin/bash
# VERTEX Docker Quick Start Script
# This script sets up and starts the VERTEX application with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       VERTEX Docker Deployment Quick Start                 ║${NC}"
echo -e "${GREEN}║              Enterprise Project Management                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "  Please install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "  Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    if [ -f .env.example ]; then
        echo "  Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${GREEN}✓ .env file created${NC}"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}Select deployment option:${NC}"
echo "1) Backend only (with MySQL)"
echo "2) Full stack (Frontend + Backend + MySQL)"
echo "3) Down/Stop services"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}Starting Backend + MySQL...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Services started${NC}"
        sleep 5
        echo ""
        echo -e "${GREEN}Backend is running at: http://localhost:8080${NC}"
        echo -e "${GREEN}API Documentation: http://localhost:8080/swagger-ui.html${NC}"
        echo ""
        docker-compose ps
        ;;
    2)
        echo ""
        echo -e "${YELLOW}Starting Full Stack (Frontend + Backend + MySQL)...${NC}"
        docker-compose -f docker-compose.full.yml up -d
        echo -e "${GREEN}✓ Services started${NC}"
        sleep 10
        echo ""
        echo -e "${GREEN}Frontend is running at: http://localhost:3000${NC}"
        echo -e "${GREEN}Backend is running at: http://localhost:8080${NC}"
        echo -e "${GREEN}API Documentation: http://localhost:8080/swagger-ui.html${NC}"
        echo ""
        docker-compose -f docker-compose.full.yml ps
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Stopping services...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ Services stopped${NC}"
        ;;
    *)
        echo -e "${RED}✗ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  Common Commands                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "View logs:"
echo "  docker-compose logs -f vertex-backend"
echo ""
echo "Access database:"
echo "  docker-compose exec vertex-mysql-db mysql -u vertex_user -p"
echo ""
echo "Restart services:"
echo "  docker-compose restart"
echo ""
echo "Stop services:"
echo "  docker-compose stop"
echo ""
echo "Full cleanup (removes containers):"
echo "  docker-compose down"
echo ""
echo "For detailed guide, see: DOCKER_DEPLOYMENT.md"
echo ""

