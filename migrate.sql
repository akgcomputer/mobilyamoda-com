ALTER TABLE products ADD COLUMN badges TEXT;
ALTER TABLE products ADD COLUMN shipping_time TEXT;
ALTER TABLE products ADD COLUMN seller_name TEXT;
ALTER TABLE products ADD COLUMN payment_options TEXT;
ALTER TABLE products ADD COLUMN gallery_images TEXT;
ALTER TABLE products ADD COLUMN features TEXT;
ALTER TABLE products ADD COLUMN tags TEXT;

-- For wholesale_prices, we drop it and recreate it to change price_per_unit to discount_percentage
DROP TABLE IF EXISTS wholesale_prices;

CREATE TABLE IF NOT EXISTS wholesale_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  min_qty INTEGER NOT NULL,
  discount_percentage REAL NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_qa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL
);
