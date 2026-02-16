# 🛍️ Full-Stack CRUD Application

A complete full-stack CRUD (Create, Read, Update, Delete) application built with modern web technologies. This project demonstrates a production-ready architecture with Node.js, Express, PostgreSQL, Redis caching, AWS S3 image storage, and React frontend.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [System Workflow](#system-workflow)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete products
- 🖼️ **Image Upload** - Upload product images to AWS S3
- ⚡ **Redis Caching** - 60-second cache for improved performance
- 🐘 **PostgreSQL Database** - Reliable relational database
- 🐳 **Docker Support** - Easy deployment with Docker Compose
- 🎨 **Modern UI** - Responsive React frontend
- 🔒 **Environment-based Config** - All sensitive data in .env
- 🚀 **Production Ready** - Error handling, validation, and best practices

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching layer (optional)
- **AWS S3** - Image storage
- **Multer** - File upload handling

### Frontend
- **React** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling

### DevOps
- **Docker & Docker Compose** - Containerization
- **dotenv** - Environment variable management

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐
│   Express   │─────▶│    Redis    │
│   Backend   │      │   (Cache)   │
└──────┬──────┘      └─────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ PostgreSQL  │ │   AWS S3    │ │   Multer    │
│  Database   │ │  (Images)   │ │  (Upload)   │
└─────────────┘ └─────────────┘ └─────────────┘
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **AWS Account** (for S3 bucket)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd crud-app
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

## ⚙️ Configuration

### 1. Create Environment File

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

### 2. Configure .env File

Edit the `.env` file with your credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres123
DB_NAME=mydb
DB_PORT=5432

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Backend Configuration
PORT=5000
NODE_ENV=development
```

### 3. AWS S3 Setup

1. **Create an S3 Bucket**:
   - Log in to AWS Console
   - Navigate to S3
   - Create a new bucket
   - Enable public access for the bucket
   - Configure bucket policy for public read access

2. **Get AWS Credentials**:
   - Go to IAM (Identity and Access Management)
   - Create a new user or use existing
   - Attach policy: `AmazonS3FullAccess`
   - Generate access key and secret key

3. **Bucket Policy Example**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### 4. Frontend Configuration

Create a `.env` file in the frontend directory:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### Option 1: Using Docker Compose (Recommended)

This will start PostgreSQL, Redis, and the Backend in containers:

```bash
# From the project root directory
docker-compose up -d
```

Then start the frontend separately:

```bash
cd frontend
npm start
```

**Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### Option 2: Manual Setup (Development)

#### 1. Start PostgreSQL and Redis

```bash
docker-compose up postgres redis -d
```

#### 2. Start Backend

```bash
cd backend
npm run dev
```

#### 3. Start Frontend

```bash
cd frontend
npm start
```

### Stopping the Application

```bash
# Stop Docker containers
docker-compose down

# Stop with volume cleanup
docker-compose down -v
```

## 📡 API Endpoints

### Products

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/products` | Get all products | - |
| GET | `/api/products/:id` | Get single product | - |
| POST | `/api/products` | Create product | `name`, `description`, `image` (file) |
| PUT | `/api/products/:id` | Update product | `name`, `description`, `image` (file) |
| DELETE | `/api/products/:id` | Delete product | - |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check API status |

### Example API Calls

#### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -F "name=Sample Product" \
  -F "description=This is a sample product" \
  -F "image=@/path/to/image.jpg"
```

#### Get All Products
```bash
curl http://localhost:5000/api/products
```

#### Delete Product
```bash
curl -X DELETE http://localhost:5000/api/products/1
```

## 🔄 System Workflow

Here's how the application works end-to-end:

1. **User Interaction**: User opens the React frontend in their browser and fills out the product creation form with name, description, and image.

2. **Frontend Request**: When the user clicks "Create Product", the React app uses Axios to send a multipart/form-data POST request to the Express backend API endpoint `/api/products`.

3. **Backend Processing**: The Express server receives the request, validates the data, and uses Multer to temporarily store the uploaded image on the server's filesystem.

4. **S3 Upload**: The backend then uploads the image to AWS S3 using the AWS SDK, receives back a public URL, and deletes the temporary local file.

5. **Database Storage**: The product information (name, description, and S3 image URL) is inserted into the PostgreSQL database using a parameterized query.

6. **Cache Invalidation**: The Redis cache key for the products list is deleted to ensure fresh data on the next read.

7. **Response**: The backend sends a success response with the newly created product data back to the frontend.

8. **Frontend Update**: The React app receives the response, refreshes the products list by making a GET request to `/api/products`.

9. **Cache Check**: On the GET request, the backend first checks Redis cache. If the data exists and isn't expired (60-second TTL), it returns the cached data immediately (cache hit).

10. **Database Query**: If cache misses, the backend queries PostgreSQL for all products, stores the results in Redis with a 60-second expiration, and returns the data.

11. **Display**: The frontend receives the products array and renders them in a responsive grid with images loaded from S3 URLs.

12. **Delete Flow**: When deleting a product, the backend removes it from PostgreSQL, attempts to delete the image from S3, invalidates the cache, and the frontend refreshes the list.

## 📁 Project Structure

```
crud-app/
├── backend/
│   ├── app.js                 # Main Express application
│   ├── package.json          # Backend dependencies
│   ├── Dockerfile            # Backend container config
│   ├── db/
│   │   ├── index.js         # PostgreSQL connection
│   │   ├── redis.js         # Redis client
│   │   ├── s3.js            # AWS S3 service
│   │   └── init.sql         # Database initialization
│   ├── routes/
│   │   └── products.js      # Product CRUD routes
│   └── uploads/             # Temporary upload directory
├── frontend/
│   ├── package.json         # Frontend dependencies
│   ├── public/
│   │   └── index.html       # HTML template
│   └── src/
│       ├── App.js           # Main React component
│       ├── App.css          # Styles
│       ├── index.js         # React entry point
│       └── index.css        # Global styles
├── docker-compose.yml       # Docker services configuration
├── .env.example            # Environment variables template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🧪 Testing

### Manual Testing Steps

1. **Create Product**:
   - Open frontend at http://localhost:3000
   - Fill in product name and description
   - Upload an image
   - Click "Create Product"
   - Verify product appears in the list

2. **Test Caching**:
   - Open browser developer tools (Network tab)
   - Refresh the page
   - Check backend logs for "Cache HIT" message
   - Wait 60+ seconds and refresh again
   - Check logs for "Cache MISS" message

3. **Delete Product**:
   - Click delete button on any product
   - Confirm the deletion
   - Verify product is removed from list
   - Check S3 bucket (image should be deleted)

4. **API Testing with curl**:
```bash
# Health check
curl http://localhost:5000/health

# Get products
curl http://localhost:5000/api/products

# Create product
curl -X POST http://localhost:5000/api/products \
  -F "name=Test Product" \
  -F "description=Testing" \
  -F "image=@image.jpg"
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Docker Container Won't Start
```bash
# Check container logs
docker-compose logs backend
docker-compose logs postgres
docker-compose logs redis

# Restart containers
docker-compose restart
```

#### 2. Database Connection Error
- Verify PostgreSQL is running: `docker-compose ps`
- Check `.env` database credentials
- Ensure DB_HOST matches the service name in docker-compose.yml

#### 3. S3 Upload Fails
- Verify AWS credentials in `.env`
- Check bucket permissions and policy
- Ensure bucket is in the correct region
- Check IAM user has S3 permissions

#### 4. Redis Connection Error
- Redis is optional; the app will work without it
- Check Redis container: `docker-compose logs redis`
- Verify REDIS_HOST in `.env`

#### 5. CORS Errors
- Ensure backend is running on port 5000
- Check REACT_APP_API_URL in frontend `.env`
- Verify CORS is enabled in backend `app.js`

#### 6. Port Already in Use
```bash
# Check what's using the port
lsof -i :5000  # Backend port
lsof -i :3000  # Frontend port
lsof -i :5432  # PostgreSQL port
lsof -i :6379  # Redis port

# Kill the process or change port in .env
```

### Debugging Tips

1. **Enable Verbose Logging**:
   - Check backend console for detailed logs
   - Use browser DevTools Network tab
   - Check Docker logs: `docker-compose logs -f`

2. **Database Issues**:
```bash
# Connect to PostgreSQL
docker exec -it crud_postgres psql -U postgres -d mydb

# List tables
\dt

# View products
SELECT * FROM products;

# Exit
\q
```

3. **Redis Issues**:
```bash
# Connect to Redis
docker exec -it crud_redis redis-cli

# Check cached keys
KEYS *

# Get cached value
GET products:all

# Exit
exit
```

## 🔐 Security Notes

- Never commit `.env` file to version control
- Keep AWS credentials secure
- Use environment variables for all sensitive data
- In production, use HTTPS
- Implement rate limiting for API endpoints
- Add authentication/authorization for production use
- Sanitize user inputs
- Use prepared statements (already implemented)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Node.js, React, PostgreSQL, Redis, and AWS S3**
