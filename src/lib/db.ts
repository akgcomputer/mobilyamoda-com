// src/lib/db.ts
// Laflaf.net Dual-Mode Database Adapter (D1 + Persistent Local JSON Fallback)

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  isSponsored: number; // 0 = false, 1 = true
  category_id?: number | null;
  author_id?: number | null;
  views: number;
  likes: number;
  commentCount: number;
  readTime: number;
  imageUrl?: string;
  tags?: string;
  createdAt: string;
  publishedAt?: string | null;
  metaTitle?: string;
  metaDescription?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'abone' | 'yazar' | 'editor' | 'admin';
  status: 'aktif' | 'pasif';
  createdAt: string;
  lastLogin?: string;
  ip?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  icon: string | null;
  type: string; // 'blog' | 'product'
  image_url: string | null;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  is_popular: number;
  createdAt: string;
}

export interface Product {
  id: number;
  category_id: number | null;
  brand_id: number | null;
  name: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  badge_top_left: string | null;
  badge_top_right: string | null;
  rating: number;
  review_count: number;
  status: string;
  unit: string;
  min_order_qty: number;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  wholesalePrices?: WholesalePrice[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  sku?: string;
  price?: number;
  stock: number;
  image_url?: string;
  createdAt: string;
}

export interface WholesalePrice {
  id: number;
  product_id: number;
  min_qty: number;
  price_per_unit: number;
  createdAt: string;
}

export interface EcommerceSlider {
  id: number;
  image_url: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  link_url?: string;
  status: string;
  sort_order: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  post_id: number;
  author_name: string;
  author_email?: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  createdAt: string;
}

export interface PushSubscription {
  id: number;
  endpoint: string;
  keys: string;
  createdAt: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  section1: string;
  slider_images: string; // JSON array of urls
  hero_image: string;
  hero_slogan: string;
  hero_button_text: string;
  hero_button_link: string;
  section3: string;
  gallery_images: string; // JSON array of urls
  references_data: string; // JSON array of references or text
  section6: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
}

// Safely dynamically load node fs/path only in Node environments to prevent bundling failures on Cloudflare Workers
async function getLocalDb() {
  if (typeof globalThis.process !== 'undefined' && !globalThis.navigator?.userAgent?.includes('Cloudflare')) {
    try {
      const fsName = ['node', 'fs'].join(':');
      const pathName = ['node', 'path'].join(':');
      const fs = await import(/* @vite-ignore */ fsName);
      const path = await import(/* @vite-ignore */ pathName);
      
      const dbPath = path.resolve('./src/lib/local_db.json');
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf8');
        return { data: JSON.parse(raw), path: dbPath, fs };
      }
    } catch (e) {
      console.warn('Local DB failed to load:', e);
    }
  }
  return null;
}

async function saveLocalDb(local: any) {
  if (local) {
    local.fs.writeFileSync(local.path, JSON.stringify(local.data, null, 2), 'utf8');
  }
}

// --- CATEGORIES ---

export async function getCategories(db?: any, type: string | null = 'blog'): Promise<Category[]> {
  if (db) {
    if (type) {
      const { results } = await db.prepare("SELECT * FROM categories WHERE type = ? ORDER BY name ASC").bind(type).all();
      return results;
    }
    const { results } = await db.prepare("SELECT * FROM categories ORDER BY name ASC").all();
    return results;
  }
  const local = await getLocalDb();
  if (local) {
    let cats = local.data.categories || [];
    if (type) cats = cats.filter((c: any) => c.type === type);
    return cats;
  }
  return [];
}

export async function createCategory(data: any, db?: any): Promise<Category | null> {
  const cType = data.type || 'blog';
  const imgUrl = data.image_url || null;
  if (db) {
    const result = await db.prepare(
      "INSERT INTO categories (name, slug, parent_id, icon, type, image_url) VALUES (?, ?, ?, ?, ?, ?) RETURNING *"
    ).bind(data.name, data.slug, data.parent_id || null, data.icon || null, cType, imgUrl).first();
    return result;
  }
  const local = await getLocalDb();
  if (local) {
    const newCat = {
      id: (local.data.categories?.reduce((max: number, c: any) => c.id > max ? c.id : max, 0) || 0) + 1,
      name: data.name,
      slug: data.slug,
      parent_id: data.parent_id || null,
      icon: data.icon || null,
      type: cType,
      image_url: imgUrl
    };
    local.data.categories.push(newCat);
    await saveLocalDb(local);
    return newCat;
  }
  return null;
}

export async function updateCategory(id: number, data: any, db?: any): Promise<Category | null> {
  const cType = data.type || 'blog';
  const imgUrl = data.image_url || null;
  if (db) {
    const result = await db.prepare(
      "UPDATE categories SET name = ?, slug = ?, parent_id = ?, icon = ?, type = ?, image_url = ? WHERE id = ? RETURNING *"
    ).bind(data.name, data.slug, data.parent_id || null, data.icon || null, cType, imgUrl, id).first();
    return result;
  }
  const local = await getLocalDb();
  if (local) {
    const idx = local.data.categories.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
      local.data.categories[idx] = { ...local.data.categories[idx], ...data };
      await saveLocalDb(local);
      return local.data.categories[idx];
    }
  }
  return null;
}

export async function deleteCategory(id: number, db?: any): Promise<boolean> {
  if (db) {
    // Delete subcategories as well or set parent_id to NULL (D1 triggers will set NULL if specified, but let's do it manually)
    await db.prepare("UPDATE categories SET parent_id = NULL WHERE parent_id = ?").bind(id).run();
    const { success } = await db.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
    return success;
  }
  const local = await getLocalDb();
  if (local) {
    // Set parent_id to null for child categories
    local.data.categories.forEach((c: any) => {
      if (c.parent_id === id) c.parent_id = null;
    });
    const before = local.data.categories.length;
    local.data.categories = local.data.categories.filter((c: any) => c.id !== id);
    await saveLocalDb(local);
    return local.data.categories.length < before;
  }
  return false;
}

// --- BRANDS ---

export async function getBrands(db?: any): Promise<Brand[]> {
  if (db) {
    const { results } = await db.prepare("SELECT * FROM brands ORDER BY name ASC").all();
    return results;
  }
  const local = await getLocalDb();
  if (local) return local.data.brands || [];
  return [];
}

export async function createBrand(data: any, db?: any): Promise<Brand | null> {
  const now = new Date().toISOString();
  if (db) {
    const result = await db.prepare(
      "INSERT INTO brands (name, slug, logo_url, is_popular, createdAt) VALUES (?, ?, ?, ?, ?) RETURNING *"
    ).bind(data.name, data.slug, data.logo_url || null, data.is_popular ? 1 : 0, now).first();
    return result;
  }
  const local = await getLocalDb();
  if (local) {
    if (!local.data.brands) local.data.brands = [];
    const newBrand = {
      id: (local.data.brands.reduce((max: number, b: any) => b.id > max ? b.id : max, 0) || 0) + 1,
      name: data.name,
      slug: data.slug,
      logo_url: data.logo_url || null,
      is_popular: data.is_popular ? 1 : 0,
      createdAt: now
    };
    local.data.brands.push(newBrand);
    await saveLocalDb(local);
    return newBrand;
  }
  return null;
}

export async function updateBrand(id: number, data: any, db?: any): Promise<Brand | null> {
  if (db) {
    const result = await db.prepare(
      "UPDATE brands SET name = ?, slug = ?, logo_url = ?, is_popular = ? WHERE id = ? RETURNING *"
    ).bind(data.name, data.slug, data.logo_url || null, data.is_popular ? 1 : 0, id).first();
    return result;
  }
  const local = await getLocalDb();
  if (local && local.data.brands) {
    const idx = local.data.brands.findIndex((b: any) => b.id === id);
    if (idx !== -1) {
      local.data.brands[idx] = { ...local.data.brands[idx], ...data };
      await saveLocalDb(local);
      return local.data.brands[idx];
    }
  }
  return null;
}

export async function deleteBrand(id: number, db?: any): Promise<boolean> {
  if (db) {
    const { success } = await db.prepare("DELETE FROM brands WHERE id = ?").bind(id).run();
    return success;
  }
  const local = await getLocalDb();
  if (local && local.data.brands) {
    const before = local.data.brands.length;
    local.data.brands = local.data.brands.filter((b: any) => b.id !== id);
    if (local.data.brands.length !== before) {
      await saveLocalDb(local);
      return true;
    }
  }
  return false;
}

// --- PRODUCTS ---

export async function getProducts(db?: any): Promise<Product[]> {
  if (db) {
    const { results } = await db.prepare("SELECT * FROM products ORDER BY createdAt DESC").all();
    return results;
  }
  const local = await getLocalDb();
  if (local) return local.data.products || [];
  return [];
}

export async function getProductById(id: number, db?: any): Promise<Product | null> {
  if (db) {
    const result = await db.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
    if (result) {
      const { results: variants } = await db.prepare("SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC").bind(id).all();
      const { results: wholesalePrices } = await db.prepare("SELECT * FROM wholesale_prices WHERE product_id = ? ORDER BY min_qty ASC").bind(id).all();
      result.variants = variants;
      result.wholesalePrices = wholesalePrices;
    }
    return result as Product | null;
  }
  const local = await getLocalDb();
  if (local && local.data.products) {
    const p = local.data.products.find((p: any) => p.id === id);
    if (p) {
      p.variants = (local.data.product_variants || []).filter((v: any) => v.product_id === id).sort((a: any, b: any) => a.id - b.id);
      p.wholesalePrices = (local.data.wholesale_prices || []).filter((w: any) => w.product_id === id).sort((a: any, b: any) => a.min_qty - b.min_qty);
      return p;
    }
  }
  return null;
}

export async function getProductBySlug(slug: string, db?: any): Promise<Product | null> {
  if (db) {
    const result = await db.prepare("SELECT * FROM products WHERE slug = ? AND status = 'aktif'").bind(slug).first();
    if (result) {
      const { results: variants } = await db.prepare("SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC").bind(result.id).all();
      const { results: wholesalePrices } = await db.prepare("SELECT * FROM wholesale_prices WHERE product_id = ? ORDER BY min_qty ASC").bind(result.id).all();
      result.variants = variants;
      result.wholesalePrices = wholesalePrices;
    }
    return result as Product | null;
  }
  const local = await getLocalDb();
  if (local && local.data.products) {
    const p = local.data.products.find((p: any) => p.slug === slug && p.status === 'aktif');
    if (p) {
      p.variants = (local.data.product_variants || []).filter((v: any) => v.product_id === p.id).sort((a: any, b: any) => a.id - b.id);
      p.wholesalePrices = (local.data.wholesale_prices || []).filter((w: any) => w.product_id === p.id).sort((a: any, b: any) => a.min_qty - b.min_qty);
      return p;
    }
  }
  return null;
}

export async function createProduct(data: any, db?: any): Promise<Product | null> {
  const now = new Date().toISOString();
  if (db) {
    const result = await db.prepare(`
      INSERT INTO products (
        category_id, brand_id, name, slug, excerpt, description, 
        price, compare_at_price, image_url, badge_top_left, badge_top_right, 
        rating, review_count, status, unit, min_order_qty, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
    `).bind(
      data.category_id || null, data.brand_id || null, data.name, data.slug, data.excerpt || null, data.description || null,
      data.price || 0, data.compare_at_price || null, data.image_url || null, data.badge_top_left || null, data.badge_top_right || null,
      data.rating || 0, data.review_count || 0, data.status || 'aktif', data.unit || 'Adet', data.min_order_qty || 1, now, now
    ).first();
    return result as Product | null;
  }
  const local = await getLocalDb();
  if (local) {
    if (!local.data.products) local.data.products = [];
    const newProduct = {
      id: (local.data.products.reduce((max: number, p: any) => p.id > max ? p.id : max, 0) || 0) + 1,
      category_id: data.category_id || null,
      brand_id: data.brand_id || null,
      name: data.name,
      slug: data.slug,
      excerpt: data.excerpt || null,
      description: data.description || null,
      price: data.price || 0,
      compare_at_price: data.compare_at_price || null,
      image_url: data.image_url || null,
      badge_top_left: data.badge_top_left || null,
      badge_top_right: data.badge_top_right || null,
      rating: data.rating || 0,
      review_count: data.review_count || 0,
      status: data.status || 'aktif',
      unit: data.unit || 'Adet',
      min_order_qty: data.min_order_qty || 1,
      createdAt: now,
      updatedAt: now
    };
    local.data.products.push(newProduct);
    await saveLocalDb(local);
    return newProduct as Product;
  }
  return null;
}

export async function updateProduct(id: number, data: any, db?: any): Promise<Product | null> {
  const now = new Date().toISOString();
  if (db) {
    const result = await db.prepare(`
      UPDATE products SET 
        category_id = ?, brand_id = ?, name = ?, slug = ?, excerpt = ?, description = ?, 
        price = ?, compare_at_price = ?, image_url = ?, badge_top_left = ?, badge_top_right = ?, 
        status = ?, unit = ?, min_order_qty = ?, updatedAt = ?
      WHERE id = ? RETURNING *
    `).bind(
      data.category_id || null, data.brand_id || null, data.name, data.slug, data.excerpt || null, data.description || null,
      data.price || 0, data.compare_at_price || null, data.image_url || null, data.badge_top_left || null, data.badge_top_right || null,
      data.status || 'aktif', data.unit || 'Adet', data.min_order_qty || 1, now, id
    ).first();
    return result as Product | null;
  }
  const local = await getLocalDb();
  if (local && local.data.products) {
    const idx = local.data.products.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      local.data.products[idx] = { ...local.data.products[idx], ...data, updatedAt: now };
      await saveLocalDb(local);
      return local.data.products[idx];
    }
  }
  return null;
}

export async function deleteProduct(id: number, db?: any): Promise<boolean> {
  if (db) {
    const { success } = await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    return success;
  }
  const local = await getLocalDb();
  if (local && local.data.products) {
    const before = local.data.products.length;
    local.data.products = local.data.products.filter((p: any) => p.id !== id);
    if (local.data.products.length !== before) {
      await saveLocalDb(local);
      return true;
    }
  }
  return false;
}

// --- PRODUCT VARIANTS ---
export async function createProductVariant(data: any, db?: any): Promise<ProductVariant | null> {
  const now = new Date().toISOString();
  if (db) {
    const result = await db.prepare(`
      INSERT INTO product_variants (product_id, name, sku, price, stock, image_url, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *
    `).bind(
      data.product_id, data.name, data.sku || null, data.price || null, data.stock || 0, data.image_url || null, now
    ).first();
    return result as ProductVariant;
  }
  const local = await getLocalDb();
  if (local) {
    if (!local.data.product_variants) local.data.product_variants = [];
    const newVariant = {
      id: (local.data.product_variants.reduce((max: number, p: any) => p.id > max ? p.id : max, 0) || 0) + 1,
      ...data,
      createdAt: now
    };
    local.data.product_variants.push(newVariant);
    await saveLocalDb(local);
    return newVariant;
  }
  return null;
}

export async function deleteProductVariant(id: number, db?: any): Promise<boolean> {
  if (db) {
    const { success } = await db.prepare("DELETE FROM product_variants WHERE id = ?").bind(id).run();
    return success;
  }
  const local = await getLocalDb();
  if (local && local.data.product_variants) {
    const before = local.data.product_variants.length;
    local.data.product_variants = local.data.product_variants.filter((p: any) => p.id !== id);
    if (local.data.product_variants.length !== before) {
      await saveLocalDb(local);
      return true;
    }
  }
  return false;
}

// --- WHOLESALE PRICES ---
export async function createWholesalePrice(data: any, db?: any): Promise<WholesalePrice | null> {
  const now = new Date().toISOString();
  if (db) {
    const result = await db.prepare(`
      INSERT INTO wholesale_prices (product_id, min_qty, price_per_unit, createdAt)
      VALUES (?, ?, ?, ?) RETURNING *
    `).bind(
      data.product_id, data.min_qty, data.price_per_unit, now
    ).first();
    return result as WholesalePrice;
  }
  const local = await getLocalDb();
  if (local) {
    if (!local.data.wholesale_prices) local.data.wholesale_prices = [];
    const newWP = {
      id: (local.data.wholesale_prices.reduce((max: number, p: any) => p.id > max ? p.id : max, 0) || 0) + 1,
      ...data,
      createdAt: now
    };
    local.data.wholesale_prices.push(newWP);
    await saveLocalDb(local);
    return newWP;
  }
  return null;
}

export async function deleteWholesalePrice(id: number, db?: any): Promise<boolean> {
  if (db) {
    const { success } = await db.prepare("DELETE FROM wholesale_prices WHERE id = ?").bind(id).run();
    return success;
  }
  const local = await getLocalDb();
  if (local && local.data.wholesale_prices) {
    const before = local.data.wholesale_prices.length;
    local.data.wholesale_prices = local.data.wholesale_prices.filter((p: any) => p.id !== id);
    if (local.data.wholesale_prices.length !== before) {
      await saveLocalDb(local);
      return true;
    }
  }
  return false;
}

// --- USERS ---

export async function getUsers(db?: any): Promise<User[]> {
  if (db) {
    const { results } = await db.prepare("SELECT * FROM users ORDER BY createdAt DESC").all();
    return results;
  }
  const local = await getLocalDb();
  if (local) {
    return local.data.users || [];
  }
  return [];
}

export async function createUser(data: any, db?: any): Promise<User | null> {
  const createdAtVal = new Date().toISOString().split('T')[0];
  if (db) {
    const result = await db.prepare(`
      INSERT INTO users (name, email, password, phone, role, status, createdAt, ip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
    `).bind(
      data.name, data.email, data.password, data.phone || null, 
      data.role || 'abone', data.status || 'pasif', createdAtVal, data.ip || null
    ).first();
    return result;
  }
  const local = await getLocalDb();
  if (local) {
    if (!local.data.users) local.data.users = [];
    const newUser: User = {
      id: (local.data.users.reduce((max: number, u: any) => u.id > max ? u.id : max, 0) || 0) + 1,
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || '',
      role: data.role || 'abone',
      status: data.status || 'pasif',
      createdAt: createdAtVal,
      ip: data.ip || '-'
    };
    local.data.users.push(newUser);
    await saveLocalDb(local);
    return newUser;
  }
  return null;
}

export async function updateUser(id: number, data: any, db?: any): Promise<User | null> {
  if (db) {
    let updateFields = [];
    let bindValues = [];
    for (const [key, value] of Object.entries(data)) {
      updateFields.push(`${key} = ?`);
      bindValues.push(value);
    }
    if (updateFields.length === 0) return null;
    bindValues.push(id);
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ? RETURNING *`;
    const result = await db.prepare(sql).bind(...bindValues).first();
    return result;
  }
  const local = await getLocalDb();
  if (local) {
    const idx = (local.data.users || []).findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      local.data.users[idx] = { ...local.data.users[idx], ...data };
      await saveLocalDb(local);
      return local.data.users[idx];
    }
  }
  return null;
}

export async function deleteUser(id: number, db?: any): Promise<boolean> {
  if (db) {
    const { success } = await db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
    return success;
  }
  const local = await getLocalDb();
  if (local) {
    const before = (local.data.users || []).length;
    local.data.users = (local.data.users || []).filter((u: any) => u.id !== id);
    await saveLocalDb(local);
    return local.data.users.length < before;
  }
  return false;
}

// --- POSTS ---

export async function getPosts(db?: any, authorId?: number): Promise<any[]> {
  if (db) {
    let query = `
      SELECT p.*, c.name as categoryName, c.slug as categorySlug 
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.status = 'published'
    `;
    const binds = [];
    if (authorId) {
      query += ` AND p.author_id = ?`;
      binds.push(authorId);
    }
    query += ` ORDER BY p.publishedAt DESC`;
    
    const { results } = await db.prepare(query).bind(...binds).all();
    return results.map((p: any) => ({
      ...p,
      isSponsored: !!p.isSponsored,
      views: Math.round(p.views || 0),
      likes: Math.round(p.likes || 0),
      category: p.category_id ? { id: p.category_id, name: p.categoryName, slug: p.categorySlug } : null
    }));
  }
  
  const local = await getLocalDb();
  if (local) {
    let published = (local.data.posts || []).filter((p: any) => p.status === 'published');
    if (authorId) {
      published = published.filter((p: any) => p.author_id === authorId || p.author_id === undefined);
    }
    // Map with category details
    return published.map((p: any) => {
      const cat = local.data.categories.find((c: any) => c.id === p.category_id);
      return {
        ...p,
        views: Math.round(p.views || 0),
        likes: Math.round(p.likes || 0),
        category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null
      };
    }).sort((a: any, b: any) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  }
  return [];
}

export async function getAllPosts(db?: any, authorId?: number): Promise<any[]> {
  if (db) {
    let query = `
      SELECT p.*, c.name as categoryName, c.slug as categorySlug, u.name as authorName
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN users u ON p.author_id = u.id
    `;
    const binds = [];
    if (authorId) {
      query += ` WHERE p.author_id = ? `;
      binds.push(authorId);
    }
    query += ` ORDER BY p.createdAt DESC`;
    
    const { results } = await db.prepare(query).bind(...binds).all();
    return results.map((p: any) => ({
      ...p,
      isSponsored: !!p.isSponsored,
      views: Math.round(p.views || 0),
      likes: Math.round(p.likes || 0),
      category: p.category_id ? { id: p.category_id, name: p.categoryName, slug: p.categorySlug } : null,
      authorName: p.authorName || 'Bilinmiyor'
    }));
  }
  
  const local = await getLocalDb();
  if (local) {
    let all = local.data.posts || [];
    if (authorId) {
      all = all.filter((p: any) => p.author_id === authorId || p.author_id === undefined);
    }
    return all.map((p: any) => {
      const cat = local.data.categories.find((c: any) => c.id === p.category_id);
      return {
        ...p,
        views: Math.round(p.views || 0),
        likes: Math.round(p.likes || 0),
        category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null
      };
    }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return [];
}

export async function getPostBySlug(slug: string, db?: any): Promise<any | null> {
  if (db) {
    const post = await db.prepare(`
      SELECT p.*, c.name as categoryName, c.slug as categorySlug, c.parent_id as categoryParentId, pc.name as parentCategoryName, pc.slug as parentCategorySlug
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN categories pc ON c.parent_id = pc.id
      WHERE p.slug = ?
    `).bind(slug).first();
    
    if (post) {
      // Increment views
      await db.prepare("UPDATE posts SET views = views + 1 WHERE id = ?").bind(post.id).run();
      return {
        ...post,
        isSponsored: !!post.isSponsored,
        views: Math.round((post.views || 0) + 1),
        likes: Math.round(post.likes || 0),
        category: post.category_id ? { 
          id: post.category_id, 
          name: post.categoryName, 
          slug: post.categorySlug,
          parent: post.categoryParentId ? { id: post.categoryParentId, name: post.parentCategoryName, slug: post.parentCategorySlug } : null
        } : null
      };
    }
    return null;
  }
  
  const local = await getLocalDb();
  if (local) {
    const post = local.data.posts.find((p: any) => p.slug === slug);
    if (post) {
      post.views = (post.views || 0) + 1;
      await saveLocalDb(local);
      const cat = local.data.categories.find((c: any) => c.id === post.category_id);
      const parentCat = cat && cat.parent_id ? local.data.categories.find((c: any) => c.id === cat.parent_id) : null;
      return {
        ...post,
        views: Math.round(post.views),
        likes: Math.round(post.likes || 0),
        category: cat ? { 
          id: cat.id, name: cat.name, slug: cat.slug,
          parent: parentCat ? { id: parentCat.id, name: parentCat.name, slug: parentCat.slug } : null
        } : null
      };
    }
  }
  return null;
}

export async function searchPosts(query: string, limit: number = 5, db?: any): Promise<any[]> {
  const searchTerm = `%${query.toLowerCase()}%`;
  
  if (db) {
    const { results } = await db.prepare(`
      SELECT p.id, p.title, p.slug, p.imageUrl, c.name as categoryName, c.slug as categorySlug 
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.status = 'published' AND (LOWER(p.title) LIKE ? OR LOWER(p.content) LIKE ?)
      ORDER BY p.publishedAt DESC
      LIMIT ?
    `).bind(searchTerm, searchTerm, limit).all();
    
    return results.map((p: any) => ({
      ...p,
      category: p.category_id ? { name: p.categoryName, slug: p.categorySlug } : null
    }));
  }
  
  const local = await getLocalDb();
  if (local) {
    const published = (local.data.posts || []).filter((p: any) => p.status === 'published');
    const q = query.toLowerCase();
    
    const matched = published.filter((p: any) => 
      p.title.toLowerCase().includes(q) || (p.content && p.content.toLowerCase().includes(q))
    ).slice(0, limit);
    
    return matched.map((p: any) => {
      const cat = local.data.categories.find((c: any) => c.id === p.category_id);
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        imageUrl: p.imageUrl,
        category: cat ? { name: cat.name, slug: cat.slug } : null
      };
    });
  }
  return [];
}

export async function createPost(data: any, db?: any): Promise<Post | null> {
  const isSponsoredVal = data.isSponsored ? 1 : 0;
  const createdAtVal = new Date().toISOString();
  const publishedAtVal = data.status === 'published' ? new Date().toISOString() : null;

  if (db) {
    const result = await db.prepare(`
      INSERT INTO posts (
        title, slug, content, excerpt, status, isSponsored, category_id, author_id,
        views, likes, commentCount, readTime, imageUrl, tags, 
        createdAt, publishedAt, metaTitle, metaDescription
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?) RETURNING *
    `).bind(
      data.title, data.slug, data.content, data.excerpt || null, data.status || 'draft',
      isSponsoredVal, data.category_id || null, data.author_id || 1, Math.round(data.views || 0), Math.round(data.likes || 0), data.readTime || 1, data.imageUrl || null,
      data.tags || null, createdAtVal, publishedAtVal, data.metaTitle || null, data.metaDescription || null
    ).first();
    return result;
  }
  
  const local = await getLocalDb();
  if (local) {
    const newPost: Post = {
      id: (local.data.posts?.reduce((max: number, p: any) => p.id > max ? p.id : max, 0) || 0) + 1,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || '',
      status: data.status || 'draft',
      isSponsored: isSponsoredVal,
      category_id: data.category_id || null,
      author_id: data.author_id || 1,
      views: Math.round(data.views || 0),
      likes: Math.round(data.likes || 0),
      commentCount: 0,
      readTime: parseInt(data.readTime) || 1,
      imageUrl: data.imageUrl || '',
      tags: data.tags || '',
      createdAt: createdAtVal,
      publishedAt: publishedAtVal,
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || ''
    };
    local.data.posts.push(newPost);
    await saveLocalDb(local);
    return newPost;
  }
  return null;
}

export async function updatePost(id: number, data: any, db?: any): Promise<Post | null> {
  const isSponsoredVal = typeof data.isSponsored !== 'undefined' ? (data.isSponsored ? 1 : 0) : undefined;
  
  if (db) {
    let updateFields = [];
    let bindValues = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (key === 'isSponsored') {
        updateFields.push(`isSponsored = ?`);
        bindValues.push(isSponsoredVal);
      } else if (key === 'category_id') {
        updateFields.push(`category_id = ?`);
        bindValues.push(value || null);
      } else {
        updateFields.push(`${key} = ?`);
        bindValues.push(value);
      }
    }
    
    if (data.status === 'published') {
      updateFields.push(`publishedAt = ?`);
      bindValues.push(new Date().toISOString());
    }
    
    if (updateFields.length === 0) return null;
    
    bindValues.push(id);
    const sql = `UPDATE posts SET ${updateFields.join(', ')} WHERE id = ? RETURNING *`;
    const result = await db.prepare(sql).bind(...bindValues).first();
    return result;
  }
  
  const local = await getLocalDb();
  if (local) {
    const idx = local.data.posts.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      if (data.status === 'published' && local.data.posts[idx].status !== 'published') {
        data.publishedAt = new Date().toISOString();
      }
      local.data.posts[idx] = { 
        ...local.data.posts[idx], 
        ...data,
        isSponsored: typeof isSponsoredVal !== 'undefined' ? isSponsoredVal : local.data.posts[idx].isSponsored
      };
      await saveLocalDb(local);
      return local.data.posts[idx];
    }
  }
  return null;
}

export async function deletePost(id: number, db?: any): Promise<boolean> {
  if (db) {
    const { success } = await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    return success;
  }
  const local = await getLocalDb();
  if (local) {
    const before = local.data.posts.length;
    local.data.posts = local.data.posts.filter((p: any) => p.id !== id);
    await saveLocalDb(local);
    return local.data.posts.length < before;
  }
  return false;
}

export async function likePost(id: number, db?: any): Promise<number> {
  if (db) {
    await db.prepare("UPDATE posts SET likes = likes + 1 WHERE id = ?").bind(id).run();
    const result = await db.prepare("SELECT likes FROM posts WHERE id = ?").bind(id).first();
    return result ? result.likes : 0;
  }
  const local = await getLocalDb();
  if (local) {
    const post = local.data.posts.find((p: any) => p.id === id);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      await saveLocalDb(local);
      return post.likes;
    }
  }
  return 0;
}

// --- COMMENTS ---

export async function getComments(db?: any): Promise<Comment[]> {
  if (db) {
    const { results } = await db.prepare("SELECT * FROM comments ORDER BY createdAt DESC").all();
    return results;
  }
  const local = await getLocalDb();
  if (local) {
    return local.data.comments || [];
  }
  return [];
}

export async function getCommentsByPost(postId: number, db?: any): Promise<Comment[]> {
  if (db) {
    const { results } = await db.prepare("SELECT * FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY createdAt DESC").bind(postId).all();
    return results;
  }
  const local = await getLocalDb();
  if (local) {
    return (local.data.comments || []).filter((c: any) => c.post_id === postId && c.status === 'approved');
  }
  return [];
}

export async function createComment(data: any, db?: any): Promise<Comment | null> {
  const createdAtVal = new Date().toISOString();
  if (db) {
    const result = await db.prepare(`
      INSERT INTO comments (post_id, author_name, author_email, content, status, createdAt)
      VALUES (?, ?, ?, ?, 'pending', ?) RETURNING *
    `).bind(data.post_id, data.author_name, data.author_email || null, data.content, createdAtVal).first();
    return result;
  }
  const local = await getLocalDb();
  if (local) {
    const newComment: Comment = {
      id: (local.data.comments?.reduce((max: number, c: any) => c.id > max ? c.id : max, 0) || 0) + 1,
      post_id: data.post_id,
      author_name: data.author_name,
      author_email: data.author_email || '',
      content: data.content,
      status: 'pending',
      createdAt: createdAtVal
    };
    local.data.comments.push(newComment);
    await saveLocalDb(local);
    return newComment;
  }
  return null;
}

export async function updateCommentStatus(id: number, status: 'approved' | 'spam', db?: any): Promise<boolean> {
  if (db) {
    const { success } = await db.prepare("UPDATE comments SET status = ? WHERE id = ?").bind(status, id).run();
    return success;
  }
  const local = await getLocalDb();
  if (local) {
    const comment = local.data.comments.find((c: any) => c.id === id);
    if (comment) {
      comment.status = status;
      await saveLocalDb(local);
      return true;
    }
  }
  return false;
}

export async function deleteComment(id: number, db?: any): Promise<boolean> {
  if (db) {
    const { success } = await db.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
    return success;
  }
  const local = await getLocalDb();
  if (local) {
    const before = local.data.comments.length;
    local.data.comments = local.data.comments.filter((c: any) => c.id !== id);
    await saveLocalDb(local);
    return local.data.comments.length < before;
  }
  return false;
}

// --- GENERAL STATS (FOR DASHBOARD) ---

export async function getDashboardStats(db?: any): Promise<any> {
  if (db) {
    const totalPosts = await db.prepare("SELECT COUNT(*) as count FROM posts").first();
    const publishedPosts = await db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'published'").first();
    const scheduledPosts = await db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'scheduled'").first();
    const totalViews = await db.prepare("SELECT SUM(views) as count FROM posts").first();
    const totalLikes = await db.prepare("SELECT SUM(likes) as count FROM posts").first();
    const totalComments = await db.prepare("SELECT COUNT(*) as count FROM comments").first();
    const pendingComments = await db.prepare("SELECT COUNT(*) as count FROM comments WHERE status = 'pending'").first();
    const totalUsers = await db.prepare("SELECT COUNT(*) as count FROM users").first();
    
    return {
      totalPosts: totalPosts?.count || 0,
      publishedPosts: publishedPosts?.count || 0,
      scheduledPosts: scheduledPosts?.count || 0,
      totalViews: totalViews?.count || 0,
      totalLikes: totalLikes?.count || 0,
      totalComments: totalComments?.count || 0,
      pendingComments: pendingComments?.count || 0,
      totalUsers: totalUsers?.count || 0
    };
  }
  
  const local = await getLocalDb();
  if (local) {
    const posts = local.data.posts || [];
    const comments = local.data.comments || [];
    const users = local.data.users || [];
    
    return {
      totalPosts: posts.length,
      publishedPosts: posts.filter((p: any) => p.status === 'published').length,
      scheduledPosts: posts.filter((p: any) => p.status === 'scheduled').length,
      totalViews: posts.reduce((sum: number, p: any) => sum + (p.views || 0), 0),
      totalLikes: posts.reduce((sum: number, p: any) => sum + (p.likes || 0), 0),
      totalComments: comments.length,
      pendingComments: comments.filter((c: any) => c.status === 'pending').length,
      totalUsers: users.length
    };
  }
  
  return {
    totalPosts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    pendingComments: 0,
    totalUsers: 0
  };
}

// --- SETTINGS ---

export async function getSettings(db?: any): Promise<any> {
  if (db) {
    const { results } = await db.prepare("SELECT * FROM settings").all();
    const settingsObj: any = {};
    results.forEach((row: any) => {
      settingsObj[row.key] = row.value;
    });
    return settingsObj;
  }
  const local = await getLocalDb();
  if (local) {
    return local.data.settings || {};
  }
  return {};
}

export async function updateSetting(key: string, value: string, db?: any): Promise<boolean> {
  if (db) {
    const { success } = await db.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?"
    ).bind(key, value, value).run();
    return success;
  }
  const local = await getLocalDb();
  if (local) {
    if (!local.data.settings) local.data.settings = {};
    local.data.settings[key] = value;
    await saveLocalDb(local);
    return true;
  }
  return false;
}

// --- PUSH SUBSCRIPTIONS ---

export async function savePushSubscription(data: any, db?: any): Promise<boolean> {
  const createdAtVal = new Date().toISOString();
  if (db) {
    try {
      await db.prepare(
        "INSERT INTO push_subscriptions (endpoint, keys, createdAt) VALUES (?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET keys = ?"
      ).bind(data.endpoint, JSON.stringify(data.keys), createdAtVal, JSON.stringify(data.keys)).run();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  
  const local = await getLocalDb();
  if (local) {
    if (!local.data.push_subscriptions) local.data.push_subscriptions = [];
    const exists = local.data.push_subscriptions.find((s: any) => s.endpoint === data.endpoint);
    if (!exists) {
      local.data.push_subscriptions.push({
        id: (local.data.push_subscriptions.reduce((max: number, s: any) => s.id > max ? s.id : max, 0) || 0) + 1,
        endpoint: data.endpoint,
        keys: JSON.stringify(data.keys),
        createdAt: createdAtVal
      });
    } else {
      exists.keys = JSON.stringify(data.keys);
    }
    await saveLocalDb(local);
    return true;
  }
  return false;
}

export async function getPushSubscriptions(db?: any): Promise<PushSubscription[]> {
  if (db) {
    try {
      const { results } = await db.prepare("SELECT * FROM push_subscriptions").all();
      return results;
    } catch (e) {
      return []; // Table might not exist yet
    }
  }
  const local = await getLocalDb();
  if (local) {
    return local.data.push_subscriptions || [];
  }
  return [];
}

// --- PAGES ---

export async function getPages(db?: any): Promise<Page[]> {
  if (db) {
    try {
      const { results } = await db.prepare("SELECT * FROM pages ORDER BY createdAt DESC").all();
      return results;
    } catch (e) {
      return [];
    }
  }
  const local = await getLocalDb();
  if (local) {
    return local.data.pages || [];
  }
  return [];
}

export async function getPageBySlug(slug: string, db?: any): Promise<Page | null> {
  if (db) {
    try {
      return await db.prepare("SELECT * FROM pages WHERE slug = ?").bind(slug).first();
    } catch (e) {
      return null;
    }
  }
  const local = await getLocalDb();
  if (local && local.data.pages) {
    return local.data.pages.find((p: any) => p.slug === slug) || null;
  }
  return null;
}

export async function createPage(data: any, db?: any): Promise<Page | null> {
  const createdAtVal = new Date().toISOString();
  if (db) {
    try {
      const result = await db.prepare(`
        INSERT INTO pages (
          title, slug, section1, slider_images, hero_image, hero_slogan, 
          hero_button_text, hero_button_link, section3, gallery_images, 
          references_data, section6, metaTitle, metaDescription, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
      `).bind(
        data.title || '', data.slug, data.section1 || '', data.slider_images || '[]',
        data.hero_image || '', data.hero_slogan || '', data.hero_button_text || '', data.hero_button_link || '',
        data.section3 || '', data.gallery_images || '[]', data.references_data || '[]',
        data.section6 || '', data.metaTitle || '', data.metaDescription || '', createdAtVal
      ).first();
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  
  const local = await getLocalDb();
  if (local) {
    if (!local.data.pages) local.data.pages = [];
    const newPage: Page = {
      id: (local.data.pages.reduce((max: number, p: any) => p.id > max ? p.id : max, 0) || 0) + 1,
      title: data.title || '',
      slug: data.slug,
      section1: data.section1 || '',
      slider_images: data.slider_images || '[]',
      hero_image: data.hero_image || '',
      hero_slogan: data.hero_slogan || '',
      hero_button_text: data.hero_button_text || '',
      hero_button_link: data.hero_button_link || '',
      section3: data.section3 || '',
      gallery_images: data.gallery_images || '[]',
      references_data: data.references_data || '[]',
      section6: data.section6 || '',
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || '',
      createdAt: createdAtVal
    };
    local.data.pages.push(newPage);
    await saveLocalDb(local);
    return newPage;
  }
  return null;
}

export async function updatePage(id: number, data: any, db?: any): Promise<Page | null> {
  if (db) {
    try {
      let updateFields = [];
      let bindValues = [];
      for (const [key, value] of Object.entries(data)) {
        updateFields.push(`${key} = ?`);
        bindValues.push(value);
      }
      if (updateFields.length === 0) return null;
      bindValues.push(id);
      
      const sql = `UPDATE pages SET ${updateFields.join(', ')} WHERE id = ? RETURNING *`;
      const result = await db.prepare(sql).bind(...bindValues).first();
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  
  const local = await getLocalDb();
  if (local && local.data.pages) {
    const idx = local.data.pages.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      local.data.pages[idx] = { ...local.data.pages[idx], ...data };
      await saveLocalDb(local);
      return local.data.pages[idx];
    }
  }
  return null;
}

export async function deletePage(id: number, db?: any): Promise<boolean> {
  if (db) {
    try {
      const { success } = await db.prepare("DELETE FROM pages WHERE id = ?").bind(id).run();
      return success;
    } catch (e) {
      return false;
    }
  }
  const local = await getLocalDb();
  if (local && local.data.pages) {
    const before = local.data.pages.length;
    local.data.pages = local.data.pages.filter((p: any) => p.id !== id);
    await saveLocalDb(local);
    return local.data.pages.length < before;
  }
  return false;
}
// ==========================
// ECOMMERCE SLIDERS
// ==========================

export async function getSliders(db?: any): Promise<EcommerceSlider[]> {
  if (db) {
    const { results } = await db.prepare("SELECT * FROM ecommerce_sliders ORDER BY sort_order ASC, id DESC").all();
    return results as EcommerceSlider[];
  }
  const local = await getLocalDb();
  if (local && local.data.ecommerce_sliders) {
    return local.data.ecommerce_sliders.sort((a: any, b: any) => {
      if (a.sort_order === b.sort_order) return b.id - a.id;
      return a.sort_order - b.sort_order;
    });
  }
  return [];
}

export async function getSliderById(id: number, db?: any): Promise<EcommerceSlider | null> {
  if (db) {
    const result = await db.prepare("SELECT * FROM ecommerce_sliders WHERE id = ?").bind(id).first();
    return result as EcommerceSlider | null;
  }
  const local = await getLocalDb();
  if (local && local.data.ecommerce_sliders) {
    return local.data.ecommerce_sliders.find((s: any) => s.id === id) || null;
  }
  return null;
}

export async function createSlider(data: any, db?: any): Promise<EcommerceSlider | null> {
  const now = new Date().toISOString();
  if (db) {
    const result = await db.prepare(
      "INSERT INTO ecommerce_sliders (image_url, title, subtitle, button_text, link_url, status, sort_order, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *"
    ).bind(
      data.image_url,
      data.title || null,
      data.subtitle || null,
      data.button_text || null,
      data.link_url || null,
      data.status || 'aktif',
      data.sort_order || 0,
      now
    ).first();
    return result as EcommerceSlider;
  }
  const local = await getLocalDb();
  if (local) {
    if (!local.data.ecommerce_sliders) local.data.ecommerce_sliders = [];
    const newId = local.data.ecommerce_sliders.length > 0 ? Math.max(...local.data.ecommerce_sliders.map((s:any)=>s.id)) + 1 : 1;
    const newSlider = { id: newId, ...data, createdAt: now };
    local.data.ecommerce_sliders.push(newSlider);
    await saveLocalDb(local.data);
    return newSlider as EcommerceSlider;
  }
  return null;
}

export async function updateSlider(id: number, data: any, db?: any): Promise<EcommerceSlider | null> {
  if (db) {
    const result = await db.prepare(
      "UPDATE ecommerce_sliders SET image_url = ?, title = ?, subtitle = ?, button_text = ?, link_url = ?, status = ?, sort_order = ? WHERE id = ? RETURNING *"
    ).bind(
      data.image_url,
      data.title || null,
      data.subtitle || null,
      data.button_text || null,
      data.link_url || null,
      data.status || 'aktif',
      data.sort_order || 0,
      id
    ).first();
    return result as EcommerceSlider;
  }
  const local = await getLocalDb();
  if (local && local.data.ecommerce_sliders) {
    const idx = local.data.ecommerce_sliders.findIndex((s:any) => s.id === id);
    if (idx !== -1) {
      local.data.ecommerce_sliders[idx] = { ...local.data.ecommerce_sliders[idx], ...data };
      await saveLocalDb(local.data);
      return local.data.ecommerce_sliders[idx];
    }
  }
  return null;
}

export async function deleteSlider(id: number, db?: any): Promise<boolean> {
  if (db) {
    await db.prepare("DELETE FROM ecommerce_sliders WHERE id = ?").bind(id).run();
    return true;
  }
  const local = await getLocalDb();
  if (local && local.data.ecommerce_sliders) {
    local.data.ecommerce_sliders = local.data.ecommerce_sliders.filter((s:any) => s.id !== id);
    await saveLocalDb(local.data);
    return true;
  }
  return false;
}
