CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  description TEXT,
  price REAL NOT NULL DEFAULT 0,
  compare_at_price REAL,
  image_url TEXT,
  badge_top_left TEXT,
  badge_top_right TEXT,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aktif',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
