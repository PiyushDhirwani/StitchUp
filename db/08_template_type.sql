-- ============================================================================
-- StitchUp: Template Types (Main Categories)
-- File: 08_template_type.sql
-- ============================================================================

CREATE TABLE template_type (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  category VARCHAR(50),
  status ENUM('active', 'retired') DEFAULT 'active',
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  retired_at TIMESTAMP,
  KEY idx_type_name (type_name),
  KEY idx_status (status),
  KEY idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample template types
INSERT INTO template_type (type_name, description, category, display_order) VALUES
('Salwar Suit', 'Traditional/modern salwar suit set', 'Traditional', 1),
('Kurta', 'Casual or formal kurta', 'Traditional', 2),
('Saree Blouse', 'Custom blouse for saree', 'Traditional', 3),
('Dupatta', 'Traditional scarf/dupatta', 'Accessories', 4),
('Dress', 'Western or fusion dress', 'Western', 5),
('Sherwani', 'Traditional formal wear', 'Formal', 6),
('Churidar', 'Formal or casual churidar pants', 'Traditional', 7),
('Lehenga Blouse', 'Custom blouse for lehenga', 'Traditional', 8),
('Custom Ensemble', 'Custom combination piece', 'Custom', 9);
