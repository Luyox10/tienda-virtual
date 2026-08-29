-- ==================================================
-- Tienda Virtual - Esquema inicial para TiDB
-- ==================================================

-- IMPORTANTE:
-- Crea/selecciona la base de datos manualmente en TiDB Cloud o en tu cliente MySQL
-- antes de ejecutar este script.
-- Ejemplo: CREATE DATABASE IF NOT EXISTS `tienda_virtual` CHARACTER SET utf8mb4;
-- Ejemplo: USE `tienda_virtual`;
-- Si el nombre de tu base de datos contiene guiones, usa backticks: USE `tienda-virtual-db`;

-- ==================================================
-- Tabla: roles
-- ==================================================
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==================================================
-- Tabla: users
-- ==================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==================================================
-- Tabla: shifts (turnos)
-- ==================================================
CREATE TABLE IF NOT EXISTS shifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  manual_override TINYINT(1) DEFAULT NULL COMMENT 'NULL=automático, 1=forzar abierto, 0=forzar cerrado',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==================================================
-- Tabla: products
-- ==================================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shift_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url MEDIUMTEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==================================================
-- Tabla: product_daily_availability
-- ==================================================
CREATE TABLE IF NOT EXISTS product_daily_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  availability_date DATE NOT NULL,
  is_sold_out TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pda_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_pda_product_date (product_id, availability_date)
) ENGINE=InnoDB;

-- ==================================================
-- Tabla: orders
-- ==================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  shift_id INT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_orders_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==================================================
-- Tabla: order_items
-- ==================================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT DEFAULT NULL,
  product_name VARCHAR(120) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==================================================
-- Tabla: payments
-- ==================================================
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  method VARCHAR(30) NOT NULL DEFAULT 'YAPE',
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(10,2) NOT NULL,
  voucher_url VARCHAR(255) DEFAULT NULL,
  reviewed_by INT DEFAULT NULL,
  review_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==================================================
-- Datos iniciales
-- ==================================================

INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrador del sistema'),
  ('customer', 'Cliente de la tienda'),
  ('cashier', 'Cajero / atención')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO shifts (name, start_time, end_time, is_enabled, manual_override) VALUES
  ('MAÑANA', '06:00:00', '13:00:00', 1, NULL),
  ('TARDE', '13:30:00', '18:30:00', 1, NULL),
  ('NOCHE', '19:00:00', '23:00:00', 0, NULL)
ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time);

INSERT INTO products (shift_id, name, description, price, image_url, is_active) VALUES
  (1, 'Causa de pollo', 'Causa rellena de pollo', 15.00, 'imagenes/productos/causa-pollo.jpg', 1),
  (2, 'Papa rellena', 'Papa rellena tradicional', 12.00, 'imagenes/productos/papa-rellena.jpg', 1)
ON DUPLICATE KEY UPDATE description = VALUES(description), price = VALUES(price), image_url = VALUES(image_url);
