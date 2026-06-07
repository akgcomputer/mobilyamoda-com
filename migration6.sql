ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 10;
ALTER TABLE products ADD COLUMN video_url TEXT;
ALTER TABLE wholesale_prices ADD COLUMN discount_percentage REAL DEFAULT 0;
