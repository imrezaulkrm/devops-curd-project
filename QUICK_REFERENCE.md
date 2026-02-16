# Quick Reference Guide

## 🚀 Quick Start

```bash
# 1. Clone and setup
git clone <repo-url>
cd crud-app

# 2. Configure environment
cp .env.example .env
# Edit .env with your AWS credentials

# 3. Run setup script (automated)
chmod +x setup.sh
./setup.sh

# 4. Start frontend
cd frontend
npm start
```

## 📝 Common Commands

### Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart a service
docker-compose restart backend

# Rebuild and start
docker-compose up -d --build

# Stop and remove volumes
docker-compose down -v
```

### Backend Commands
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### Frontend Commands
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Database Commands
```bash
# Connect to PostgreSQL
docker exec -it crud_postgres psql -U postgres -d mydb

# Inside PostgreSQL:
\dt                          # List tables
SELECT * FROM products;      # View products
\q                          # Exit

# Backup database
docker exec crud_postgres pg_dump -U postgres mydb > backup.sql

# Restore database
docker exec -i crud_postgres psql -U postgres mydb < backup.sql
```

### Redis Commands
```bash
# Connect to Redis
docker exec -it crud_redis redis-cli

# Inside Redis:
KEYS *                      # List all keys
GET products:all            # Get cached products
DEL products:all            # Delete cache
FLUSHALL                    # Clear all cache
exit                        # Exit
```

## 🔧 Testing Endpoints

### Using curl
```bash
# Health check
curl http://localhost:5000/health

# Get all products
curl http://localhost:5000/api/products

# Get single product
curl http://localhost:5000/api/products/1

# Create product
curl -X POST http://localhost:5000/api/products \
  -F "name=Test Product" \
  -F "description=This is a test" \
  -F "image=@/path/to/image.jpg"

# Delete product
curl -X DELETE http://localhost:5000/api/products/1
```

### Using Postman
1. **GET** `http://localhost:5000/api/products`
2. **POST** `http://localhost:5000/api/products`
   - Body: form-data
   - Fields: name, description, image (file)
3. **DELETE** `http://localhost:5000/api/products/1`

## 🐛 Debugging

### Check Service Status
```bash
# Check all containers
docker-compose ps

# Check if ports are in use
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### View Application Logs
```bash
# Backend logs
docker-compose logs -f backend

# PostgreSQL logs
docker-compose logs -f postgres

# Redis logs
docker-compose logs -f redis

# All logs
docker-compose logs -f
```

### Common Issues

**Port already in use:**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

**Database connection error:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

**S3 upload fails:**
- Verify AWS credentials in .env
- Check bucket permissions
- Ensure bucket policy allows public read
- Verify IAM user has S3 access

**Redis connection error:**
- Redis is optional
- Check if Redis container is running
- Verify REDIS_HOST in .env
- Application will work without Redis (just no caching)

## 📊 Monitoring

### Check API Health
```bash
curl http://localhost:5000/health
```

### Monitor Redis Cache
```bash
# Connect to Redis
docker exec -it crud_redis redis-cli

# Monitor commands in real-time
MONITOR

# Check cache hit rate
INFO stats
```

### Database Performance
```bash
# Connect to PostgreSQL
docker exec -it crud_postgres psql -U postgres -d mydb

# Check table sizes
SELECT pg_size_pretty(pg_total_relation_size('products'));

# View active connections
SELECT * FROM pg_stat_activity;
```

## 🔄 Reset Everything

### Complete Reset
```bash
# Stop all containers and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Remove backend node_modules and uploads
rm -rf backend/node_modules backend/uploads/*

# Remove frontend node_modules and build
rm -rf frontend/node_modules frontend/build

# Start fresh
./setup.sh
```

### Reset Database Only
```bash
# Stop and remove database volume
docker-compose down
docker volume rm crud-app_postgres_data

# Start again (will recreate database)
docker-compose up -d
```

## 📦 Production Deployment

### Build for Production
```bash
# Backend
cd backend
npm install --production

# Frontend
cd frontend
npm run build
```

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=<production-db-host>
REDIS_HOST=<production-redis-host>
AWS_REGION=<your-region>
```

### Using Docker in Production
```bash
# Build and run with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔐 Security Checklist

- [ ] Update all default passwords
- [ ] Use strong database passwords
- [ ] Keep AWS credentials secure
- [ ] Enable HTTPS in production
- [ ] Add rate limiting
- [ ] Implement authentication
- [ ] Sanitize user inputs
- [ ] Use environment variables
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Docker Documentation](https://docs.docker.com/)

---

**Need help?** Open an issue on GitHub or refer to the main README.md
