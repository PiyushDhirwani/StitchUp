-- ============================================================================
-- StitchUp: Template Sub Types (Variations)
-- File: 09_template_sub_type.sql
-- ============================================================================

CREATE TABLE template_sub_type (
  id INT PRIMARY KEY AUTO_INCREMENT,
  template_type_id INT NOT NULL,
  sub_type_name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  sizing_notes TEXT,
  status ENUM('active', 'retired') DEFAULT 'active',
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  retired_at TIMESTAMP,
  FOREIGN KEY (template_type_id) REFERENCES template_type(id) ON DELETE CASCADE,
  KEY idx_template_type_id (template_type_id),
  KEY idx_sub_type_name (sub_type_name),
  KEY idx_status (status),
  UNIQUE KEY unique_subtype (template_type_id, sub_type_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample subtypes for Salwar Suit (template_type_id = 1)
INSERT INTO template_sub_type (template_type_id, sub_type_name, description, display_order) VALUES
(1, 'Traditional', 'Classic salwar suit design', 1),
(1, 'Modern', 'Contemporary salwar suit', 2),
(1, 'Indo-Western', 'Fusion style salwar', 3);

-- Sample subtypes for Kurta (template_type_id = 2)
INSERT INTO template_sub_type (template_type_id, sub_type_name, description, display_order) VALUES
(2, 'Short Kurta', 'Knee-length kurta', 1),
(2, 'Long Kurta', 'Full-length kurta', 2),
(2, 'Embroidered Kurta', 'Heavily embellished kurta', 3);

-- Sample subtypes for Dupatta (template_type_id = 4)
INSERT INTO template_sub_type (template_type_id, sub_type_name, description, display_order) VALUES
(4, 'Plain Dupatta', 'Simple dupatta scarf', 1),
(4, 'Embroidered Dupatta', 'Embroidered scarf', 2);

-- Sample subtypes for Churidar (template_type_id = 7)
INSERT INTO template_sub_type (template_type_id, sub_type_name, description, display_order) VALUES
(7, 'Regular Churidar', 'Standard churidar fit', 1),
(7, 'Formal Churidar', 'Formal occasion churidar', 2);
