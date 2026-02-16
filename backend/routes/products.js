const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const db = require('../db');
const { getCache, setCache, delCache } = require('../db/redis');
const { uploadToS3, deleteFromS3, isS3Configured } = require('../db/s3');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// GET /products - Fetch all products (with Redis caching)
router.get('/', async (req, res) => {
  const cacheKey = 'products:all';
  
  try {
    // Try to get from cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log('📦 Cache HIT - Returning cached products');
      return res.json({
        success: true,
        data: cachedData,
        source: 'cache'
      });
    }

    console.log('🔍 Cache MISS - Querying database');
    
    // Query database
    const result = await db.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    
    const products = result.rows;
    
    // Store in cache for 60 seconds
    await setCache(cacheKey, products, 60);
    
    res.json({
      success: true,
      data: products,
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// GET /products/:id - Fetch single product
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// POST /products - Create new product with image upload
router.post('/', upload.single('image'), async (req, res) => {
  const { name, description } = req.body;
  
  try {
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required'
      });
    }

    let imageUrl = null;

    // If image is uploaded, upload to S3
    if (req.file && isS3Configured()) {
      try {
        imageUrl = await uploadToS3(req.file.path, req.file.originalname);
        
        // Delete local file after successful S3 upload
        await fs.unlink(req.file.path);
      } catch (s3Error) {
        console.error('S3 upload failed:', s3Error);
        // Continue without image if S3 fails
        if (req.file) {
          await fs.unlink(req.file.path).catch(() => {});
        }
      }
    } else if (req.file) {
      // If S3 is not configured, use local file path
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Insert product into database
    const result = await db.query(
      'INSERT INTO products (name, description, image_url) VALUES ($1, $2, $3) RETURNING *',
      [name, description, imageUrl]
    );

    const newProduct = result.rows[0];

    // Invalidate cache
    await delCache('products:all');

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Clean up uploaded file if exists
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    });
  }
});

// PUT /products/:id - Update product
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  try {
    // Check if product exists
    const existingProduct = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    let imageUrl = existingProduct.rows[0].image_url;

    // If new image is uploaded
    if (req.file && isS3Configured()) {
      try {
        // Upload new image to S3
        imageUrl = await uploadToS3(req.file.path, req.file.originalname);
        
        // Delete old image from S3 if exists
        if (existingProduct.rows[0].image_url) {
          await deleteFromS3(existingProduct.rows[0].image_url);
        }
        
        // Delete local file
        await fs.unlink(req.file.path);
      } catch (s3Error) {
        console.error('S3 operation failed:', s3Error);
        if (req.file) {
          await fs.unlink(req.file.path).catch(() => {});
        }
      }
    }

    // Update product
    const result = await db.query(
      'UPDATE products SET name = $1, description = $2, image_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name || existingProduct.rows[0].name, description || existingProduct.rows[0].description, imageUrl, id]
    );

    // Invalidate cache
    await delCache('products:all');

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    });
  }
});

// DELETE /products/:id - Delete product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get product details first
    const product = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Delete from database
    await db.query('DELETE FROM products WHERE id = $1', [id]);

    // Try to delete image from S3 if exists
    if (product.rows[0].image_url && isS3Configured()) {
      await deleteFromS3(product.rows[0].image_url);
    }

    // Invalidate cache
    await delCache('products:all');

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    });
  }
});

module.exports = router;
