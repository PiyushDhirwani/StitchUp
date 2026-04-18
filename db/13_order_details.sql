-- ============================================================================
-- StitchUp: Order Details (Overall Order Specifications)
-- File: 13_order_details.sql
-- ============================================================================

CREATE TABLE order_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL UNIQUE,
  fabric_provided ENUM('consumer_provided', 'platform_arranged') DEFAULT 'consumer_provided',
  body_measurement_id INT,
  total_fabric_length_meters DECIMAL(5, 2),
  delivery_address_line1 VARCHAR(255),
  delivery_address_line2 VARCHAR(255),
  delivery_city VARCHAR(100),
  delivery_state VARCHAR(100),
  delivery_postal_code VARCHAR(20),
  is_delivery_same_as_profile BOOLEAN DEFAULT true,
  packaging_instructions TEXT,
  payment_schedule ENUM('upfront', 'advance_and_final', 'upon_delivery') DEFAULT 'advance_and_final',
  advance_payment_percentage INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (body_measurement_id) REFERENCES body_measurements(id) ON DELETE SET NULL,
  KEY idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
