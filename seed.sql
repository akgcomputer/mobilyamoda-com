DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'abone',
  status TEXT NOT NULL DEFAULT 'pasif',
  createdAt TEXT NOT NULL,
  ip TEXT,
  lastLogin TEXT
);

INSERT INTO users (name, email, password, role, status, createdAt)
VALUES ('Admin', 'admin@laflaf.net', 'lafLAF123!!', 'admin', 'aktif', '2026-05-25');
