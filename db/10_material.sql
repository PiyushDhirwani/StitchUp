-- ============================================================================
-- StitchUp: Material/Fabric Specifications
-- File: 10_material.sql
-- ============================================================================

CREATE TABLE material (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material_name VARCHAR(100) NOT NULL,
  material_type VARCHAR(100),
  color VARCHAR(50),
  pattern VARCHAR(100),
  weight_gsm INT,
  fiber_content VARCHAR(255),
  care_instructions TEXT,
  supplier_id INT,
  cost_per_meter DECIMAL(8, 2),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_material_name (material_name),
  KEY idx_material_type (material_type),
  KEY idx_color (color),
  KEY idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample materials
INSERT INTO material (material_name, material_type, color, pattern, weight_gsm, fiber_content) VALUES
('Cotton', 'Natural', 'White', 'Plain', 150, '100% Cotton'),
('Silk', 'Natural', 'Off-white', 'Plain', 120, '100% Silk'),
('Georgette', 'Synthetic Blend', 'Beige', 'Plain', 90, '60% Polyester, 40% Cotton'),
('Chiffon', 'Synthetic Blend', 'Light Pink', 'Plain', 70, '100% Polyester'),
('Cotton Blend', 'Blend', 'Navy Blue', 'Print', 160, '80% Cotton, 20% Polyester'),
('Crepe', 'Synthetic', 'Maroon', 'Plain', 140, '100% Polyester'),
('Linen', 'Natural', 'Beige', 'Plain', 170, '100% Linen'),
('Satin', 'Synthetic', 'Gold', 'Plain', 130, '100% Polyester');
