-- ============================================================================
-- StitchUp: Order Items (Line Items in Order)
-- NEW TABLE - Supports Multiple Items Per Order (e.g., Salwar + Kurta + Scarf)
-- File: 12_order_items.sql
-- ============================================================================

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  item_sequence INT NOT NULL,
  template_type_id INT NOT NULL,
  template_sub_type_id INT NOT NULL,
  material_id INT,
  quantity INT DEFAULT 1,
  length_meters DECIMAL(5, 2),
  item_description TEXT,
  item_cost DECIMAL(10, 2),
  item_discount DECIMAL(10, 2) DEFAULT 0,
  item_final_cost DECIMAL(10, 2),
  customization_details TEXT,
  embroidery_required BOOLEAN DEFAULT false,
  embroidery_details TEXT,
  design_reference_url VARCHAR(500),
  special_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (template_type_id) REFERENCES template_type(id) ON DELETE RESTRICT,
  FOREIGN KEY (template_sub_type_id) REFERENCES template_sub_type(id) ON DELETE RESTRICT,
  FOREIGN KEY (material_id) REFERENCES material(id) ON DELETE SET NULL,
  KEY idx_order_id (order_id),
  KEY idx_template_type_id (template_type_id),
  KEY idx_template_sub_type_id (template_sub_type_id),
  UNIQUE KEY unique_order_item_sequence (order_id, item_sequence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INDEX for efficient order retrieval with items
CREATE INDEX idx_order_items_order ON order_items(order_id, item_sequence);
