#!/bin/bash

echo "=================================="
echo "🚀 CRUD Application Setup Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v16 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker $(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose $(docker-compose --version | cut -d ' ' -f4 | cut -d ',' -f1)${NC}"

echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env file with your AWS credentials before continuing${NC}"
    echo -e "${YELLOW}    Note: You can skip AWS S3 setup for now and use local storage${NC}"
    echo ""
    read -p "Press Enter to continue after configuring .env..."
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

echo ""
echo "=================================="
echo "📦 Installing Backend Dependencies"
echo "=================================="
cd backend || exit 1
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

cd ..

echo ""
echo "=================================="
echo "📦 Installing Frontend Dependencies"
echo "=================================="
cd frontend || exit 1
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

# Create frontend .env if it doesn't exist
if [ ! -f .env ]; then
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
    echo -e "${GREEN}✅ Created frontend .env file${NC}"
fi

cd ..

echo ""
echo "=================================="
echo "🐳 Starting Docker Containers"
echo "=================================="
docker-compose up -d
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker containers started${NC}"
else
    echo -e "${RED}❌ Failed to start Docker containers${NC}"
    echo -e "${YELLOW}Tip: Make sure Docker is running and ports 5000, 5432, 6379 are free${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check if backend is ready
echo -e "${BLUE}🔍 Checking backend health...${NC}"
for i in {1..10}; do
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${YELLOW}⚠️  Backend might not be ready yet. Check logs: docker-compose logs backend${NC}"
    fi
    sleep 2
done

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo -e "${GREEN}🎉 Your application is ready!${NC}"
echo ""
echo -e "${BLUE}📍 URLs:${NC}"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "   1. Start the frontend:"
echo "      cd frontend && npm start"
echo ""
echo "   2. Open browser: http://localhost:3000"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart backend:  docker-compose restart backend"
echo "   Check status:     docker-compose ps"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "   - If you see S3 errors, that's OK! The app works with local storage."
echo "   - To use S3, update AWS credentials in .env and restart backend."
echo "   - Redis caching is optional but improves performance."
echo ""
echo "=================================="
echo -e "${GREEN}Happy Coding! 🚀${NC}"
echo "=================================="