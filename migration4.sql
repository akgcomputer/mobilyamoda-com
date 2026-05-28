ALTER TABLE products ADD COLUMN rating REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN payment_options TEXT;
ALTER TABLE products ADD COLUMN gallery_images TEXT;
ALTER TABLE products ADD COLUMN updatedAt TEXT;
