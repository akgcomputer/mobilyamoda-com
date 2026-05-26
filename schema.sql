-- schema.sql
-- Laflaf.net D1 Database Schema Definition

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  icon TEXT
);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'scheduled', 'archived'
  isSponsored INTEGER DEFAULT 0, -- 0 = false, 1 = true
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  commentCount INTEGER DEFAULT 0,
  readTime INTEGER DEFAULT 1,
  imageUrl TEXT,
  tags TEXT, -- Comma-separated list of tags, e.g. "trend, yasam"
  createdAt TEXT NOT NULL,
  publishedAt TEXT,
  metaTitle TEXT,
  metaDescription TEXT
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'spam'
  createdAt TEXT NOT NULL
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Ads Table
CREATE TABLE IF NOT EXISTS ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
  createdAt TEXT NOT NULL
);

-- Pages Table (Sabit Sayfalar)
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  section1 TEXT,
  slider_images TEXT,
  hero_image TEXT,
  hero_slogan TEXT,
  hero_button_text TEXT,
  hero_button_link TEXT,
  section3 TEXT,
  gallery_images TEXT,
  references_data TEXT,
  section6 TEXT,
  metaTitle TEXT,
  metaDescription TEXT,
  createdAt TEXT NOT NULL
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'editor', -- 'admin', 'editor'
  createdAt TEXT NOT NULL
);

-- Insert Initial Seed Data for Categories
INSERT OR IGNORE INTO categories (id, name, slug, parent_id, icon) VALUES 
(1, 'Yaşam', 'yasam', NULL, 'fa-leaf'),
(2, 'Otomobil', 'otomobil', NULL, 'fa-car'),
(3, 'Kadın', 'kadin', NULL, 'fa-female'),
(4, 'Aile', 'aile', NULL, 'fa-users'),
(5, 'Anne&Bebek', 'anne-bebek', NULL, 'fa-baby-carriage'),
(6, 'Alışveriş', 'alisveris', NULL, 'fa-shopping-bag'),
(7, 'Teknoloji', 'teknoloji', NULL, 'fa-microchip'),
(8, 'Sanat', 'sanat', NULL, 'fa-palette'),
(9, 'Spor', 'spor', NULL, 'fa-futbol'),
(10, 'Seyahat', 'seyahat', NULL, 'fa-plane');

-- Insert Initial Seed Data for Settings
INSERT OR IGNORE INTO settings (key, value) VALUES 
('site_title', 'Laflaf'),
('site_description', 'Meraklı İçerikleri Keşfet'),
('site_email', 'info@laflaf.net'),
('site_lang', 'tr');
