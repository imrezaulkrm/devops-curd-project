-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Insert sample data (optional)
INSERT INTO products (name, description, image_url) VALUES
('Sample Product 1', 'This is a sample product', 'https://via.placeholder.com/300'),
('Sample Product 2', 'Another sample product', 'https://via.placeholder.com/300')
ON CONFLICT DO NOTHING;
