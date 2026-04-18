-- ============================================================================
-- StitchUp: Orders (Main Order Entity)
-- File: 11_orders.sql
-- ============================================================================

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consumer_id INT NOT NULL,
  tailor_id INT,
  order_status ENUM('created', 'material_received', 'tailor_assigned', 'cutting_started', 'stitching_in_progress', 'final_touch', 'ready_for_collection', 'completed', 'cancelled') DEFAULT 'created',
  delivery_date DATE,
  estimated_delivery_date DATE,
  special_instructions TEXT,
  total_cost DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2),
  urgency_level ENUM('normal', 'express', 'priority') DEFAULT 'normal',
  number_of_items INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (consumer_id) REFERENCES user_consumer(id) ON DELETE RESTRICT,
  FOREIGN KEY (tailor_id) REFERENCES user_tailor(id) ON DELETE SET NULL,
  KEY idx_consumer_id (consumer_id),
  KEY idx_tailor_id (tailor_id),
  KEY idx_order_status (order_status),
  KEY idx_created_at (created_at),
  KEY idx_delivery_date (delivery_date),
  KEY idx_urgency_level (urgency_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
