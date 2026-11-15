-- Bokul Cloth Store schema. Apply once as a MySQL admin:
--   sudo mysql bokul_store < db/migrations/001_schema.sql
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(60)  NOT NULL UNIQUE,
  name        VARCHAR(80)  NOT NULL,
  headline    VARCHAR(160) NOT NULL,
  description TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug             VARCHAR(120) NOT NULL UNIQUE,
  name             VARCHAR(140) NOT NULL,
  category_id      INT UNSIGNED NOT NULL,
  summary          VARCHAR(255) NOT NULL,
  description      TEXT         NOT NULL,
  fabric           VARCHAR(120) NOT NULL,
  care             VARCHAR(255) NOT NULL,
  color            VARCHAR(60)  NOT NULL,
  price            INT UNSIGNED NOT NULL,          -- whole taka
  compare_at_price INT UNSIGNED NULL,
  image            VARCHAR(255) NOT NULL,
  featured         TINYINT(1)   NOT NULL DEFAULT 0,
  active           TINYINT(1)   NOT NULL DEFAULT 1,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_products_active (active, category_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_sizes (
  product_id INT UNSIGNED NOT NULL,
  size       VARCHAR(20)  NOT NULL,
  stock      INT UNSIGNED NOT NULL DEFAULT 0,
  sort_order INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, size),
  CONSTRAINT fk_sizes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number   VARCHAR(20)  NOT NULL UNIQUE,
  access_token   CHAR(32)     NOT NULL,
  customer_name  VARCHAR(120) NOT NULL,
  email          VARCHAR(254) NOT NULL,
  phone          VARCHAR(30)  NOT NULL,
  address        VARCHAR(500) NOT NULL,
  city           VARCHAR(80)  NOT NULL,
  delivery_zone  ENUM('inside_dhaka','outside_dhaka') NOT NULL,
  notes          VARCHAR(500) NULL,
  subtotal       INT UNSIGNED NOT NULL,
  shipping_fee   INT UNSIGNED NOT NULL,
  total          INT UNSIGNED NOT NULL,
  payment_method ENUM('cod')  NOT NULL DEFAULT 'cod',
  status         ENUM('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_status (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id     INT UNSIGNED NOT NULL,
  product_id   INT UNSIGNED NULL,
  product_name VARCHAR(140) NOT NULL,
  product_slug VARCHAR(120) NOT NULL,
  image        VARCHAR(255) NOT NULL,
  size         VARCHAR(20)  NOT NULL,
  unit_price   INT UNSIGNED NOT NULL,
  quantity     INT UNSIGNED NOT NULL,
  line_total   INT UNSIGNED NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(254) NOT NULL,
  phone      VARCHAR(30)  NULL,
  subject    VARCHAR(160) NOT NULL,
  message    TEXT         NOT NULL,
  handled    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(254) NOT NULL UNIQUE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
