#!/bin/bash

echo "=================================="
echo "🚀 CRUD Application Setup Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env file with your AWS credentials before continuing${NC}"
    echo ""
    read -p "Press Enter to continue after configuring .env..."
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

echo ""
echo "=================================="
echo "📦 Installing Backend Dependencies"
echo "=================================="
cd backend
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
cd frontend
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
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "🎉 Your application is ready!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:5000"
echo "📍 Health Check: http://localhost:5000/health"
echo ""
echo "To start the frontend, run:"
echo "  cd frontend && npm start"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop all services:"
echo "  docker-compose down"
echo ""
echo "=================================="
