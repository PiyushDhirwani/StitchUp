-- ============================================================================
-- StitchUp: Pricing Configuration
-- File: 23_pricing_config.sql
-- Determines final pricing based on: template type, material, customizations,
-- and body configuration complexity
-- ============================================================================

-- Base Pricing by Template Type
CREATE TABLE template_type_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  template_type_id INT NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  price_notes TEXT,
  complexity_level ENUM('simple', 'moderate', 'complex') DEFAULT 'moderate',
  estimated_hours DECIMAL(5, 2),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_type_id) REFERENCES template_type(id) ON DELETE CASCADE,
  UNIQUE KEY unique_template_pricing (template_type_id),
  KEY idx_template_type_id (template_type_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample base prices by template type
INSERT INTO template_type_pricing (template_type_id, base_price, complexity_level, estimated_hours) VALUES
(1, 800.00, 'moderate', 8.0),    -- Salwar Suit
(2, 600.00, 'simple', 6.0),       -- Kurta
(3, 400.00, 'simple', 4.0),       -- Saree Blouse
(4, 150.00, 'simple', 1.5),       -- Dupatta
(5, 900.00, 'moderate', 9.0),     -- Dress
(6, 1200.00, 'complex', 12.0),    -- Sherwani
(7, 500.00, 'simple', 5.0),       -- Churidar
(8, 500.00, 'moderate', 7.0),     -- Lehenga Blouse
(9, 1500.00, 'complex', 15.0);    -- Custom Ensemble

-- ============================================================================
-- Material Cost Multiplier
-- Applied on top of base price (e.g., Silk = 1.5x, Cotton = 1.0x)
-- ============================================================================

CREATE TABLE material_pricing_multiplier (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material_id INT NOT NULL,
  cost_multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
  markup_reason TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES material(id) ON DELETE CASCADE,
  UNIQUE KEY unique_material_multiplier (material_id),
  KEY idx_material_id (material_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample material multipliers
INSERT INTO material_pricing_multiplier (material_id, cost_multiplier, markup_reason) VALUES
(1, 1.0, 'Cotton - Standard'),
(2, 1.5, 'Silk - Premium fabric'),
(3, 1.2, 'Georgette - Moderate premium'),
(4, 1.3, 'Chiffon - Premium finish'),
(5, 1.1, 'Cotton Blend - Slightly premium'),
(6, 1.2, 'Crepe - Moderate premium'),
(7, 1.4, 'Linen - Premium natural fiber'),
(8, 1.6, 'Satin - High-end finish');

-- ============================================================================
-- Body Configuration Complexity Pricing
-- Additional charges based on body measurements and customization
-- ============================================================================

CREATE TABLE body_config_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complexity_factor VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  complexity_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  price_adjustment DECIMAL(10, 2),
  examples TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_complexity_factor (complexity_factor),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample body configuration pricing
INSERT INTO body_config_pricing (complexity_factor, description, complexity_multiplier, price_adjustment, examples) VALUES
('standard', 'Standard body measurements, no special requirements', 1.0, 0.00, 'Regular size, normal proportions'),
('plus_size', 'Plus-size tailoring, additional fabric, special fitting', 1.2, 200.00, 'Larger measurements requiring extra fabric and adjustments'),
('petite', 'Petite sizing, extra adjustments needed', 1.15, 150.00, 'Smaller frame requiring multiple alterations'),
('athletic', 'Athletic build, special chest/shoulder shaping', 1.1, 100.00, 'Broad shoulders, defined waist'),
('custom_proportions', 'Highly custom body proportions', 1.3, 300.00, 'Unusual measurements, multiple custom fittings'),
('first_time_detailed', 'First detailed measurement session', 0.95, -50.00, 'Initial measurement with full body analysis');

-- ============================================================================
-- Customization & Add-On Pricing
-- ============================================================================

CREATE TABLE customization_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customization_type VARCHAR(100) NOT NULL,
  customization_name VARCHAR(200) NOT NULL,
  base_cost DECIMAL(10, 2),
  cost_per_unit VARCHAR(100),
  unit_type VARCHAR(50),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_customization (customization_type, customization_name),
  KEY idx_customization_type (customization_type),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample customization pricing
INSERT INTO customization_pricing (customization_type, customization_name, base_cost, cost_per_unit, unit_type, description) VALUES
-- Embroidery
('embroidery', 'Simple Embroidery', 150.00, '5.00', 'per inch', 'Basic floral or geometric patterns'),
('embroidery', 'Detailed Embroidery', 300.00, '10.00', 'per inch', 'Intricate designs, multiple colors'),
('embroidery', 'Heavy Embroidery (Zari)', 500.00, '20.00', 'per inch', 'Gold/silver thread, luxury embroidery'),
('embroidery', 'Bead Work', 400.00, '15.00', 'per inch', 'Beaded embellishment'),

-- Stitching Modifications
('stitching', 'Side Zippers', 100.00, NULL, NULL, 'Add side zippers to salwar/dress'),
('stitching', 'Extended Length', 50.00, NULL, NULL, 'Make garment longer than template'),
('stitching', 'Shortened Length', 50.00, NULL, NULL, 'Make garment shorter than template'),
('stitching', 'Custom Sleeves', 75.00, NULL, NULL, 'Custom sleeve length or style'),
('stitching', 'Extra Hemming', 30.00, NULL, NULL, 'Additional hemming beyond standard'),

-- Special Treatments
('treatment', 'Pleating Detail', 80.00, NULL, NULL, 'Add pleats to skirt or dupatta'),
('treatment', 'Lace Border', 100.00, NULL, NULL, 'Add decorative lace to edges'),
('treatment', 'Piping Detail', 60.00, NULL, NULL, 'Add piping along seams'),
('treatment', 'Button/Hook Detail', 40.00, '2.00', 'per button', 'Special buttons or hooks');

-- ============================================================================
-- Urgency/Rush Order Pricing
-- ============================================================================

CREATE TABLE urgency_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  urgency_level VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  rush_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  flat_rate_addition DECIMAL(10, 2),
  min_days_notice INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_urgency_level (urgency_level),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample urgency pricing
INSERT INTO urgency_pricing (urgency_level, description, rush_multiplier, flat_rate_addition, min_days_notice) VALUES
('normal', 'Standard turnaround (7-14 days)', 1.0, 0.00, 7),
('express', 'Express service (3-5 days)', 1.25, 200.00, 3),
('priority', 'Priority/Rush (1-2 days)', 1.5, 500.00, 1);

-- ============================================================================
-- Price Calculation Rules & Examples
-- ============================================================================

CREATE TABLE pricing_calculation_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_item_id INT,
  template_type_id INT,
  material_id INT,
  base_template_price DECIMAL(10, 2),
  material_multiplier DECIMAL(3, 2),
  material_adjusted_price DECIMAL(10, 2),
  body_complexity_adjustment DECIMAL(10, 2),
  customization_total DECIMAL(10, 2),
  urgency_multiplier DECIMAL(3, 2),
  subtotal DECIMAL(10, 2),
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_price DECIMAL(10, 2),
  calculation_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_type_id) REFERENCES template_type(id) ON DELETE SET NULL,
  FOREIGN KEY (material_id) REFERENCES material(id) ON DELETE SET NULL,
  KEY idx_order_item_id (order_item_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tailor-Specific Pricing Overrides (Optional)
-- Allows tailors to set their own pricing for specific templates/materials
-- ============================================================================

CREATE TABLE tailor_custom_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tailor_id INT NOT NULL,
  template_type_id INT,
  material_id INT,
  override_base_price DECIMAL(10, 2),
  override_reason TEXT,
  override_status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tailor_id) REFERENCES user_tailor(id) ON DELETE CASCADE,
  FOREIGN KEY (template_type_id) REFERENCES template_type(id) ON DELETE SET NULL,
  FOREIGN KEY (material_id) REFERENCES material(id) ON DELETE SET NULL,
  KEY idx_tailor_id (tailor_id),
  KEY idx_template_type_id (template_type_id),
  KEY idx_material_id (material_id),
  UNIQUE KEY unique_tailor_override (tailor_id, template_type_id, material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Discount Codes/Bulk Pricing
-- ============================================================================

CREATE TABLE discount_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  discount_code VARCHAR(50) UNIQUE,
  discount_name VARCHAR(100),
  discount_type ENUM('percentage', 'flat_amount', 'bulk_order') DEFAULT 'percentage',
  discount_value DECIMAL(10, 2),
  min_order_amount DECIMAL(10, 2),
  min_items_count INT,
  applicable_template_ids JSON,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_discount_code (discount_code),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample discounts
INSERT INTO discount_pricing (discount_code, discount_name, discount_type, discount_value, usage_limit, status) VALUES
('FIRST10', 'First Order Discount', 'percentage', 10.00, 1000, 'active'),
('BULK20', 'Bulk Order Discount', 'percentage', 20.00, 500, 'active'),
('FLAT500', 'Flat 500 Discount', 'flat_amount', 500.00, 100, 'active');

-- ============================================================================
-- PRICE CALCULATION LOGIC (For Backend Implementation)
-- ============================================================================
--
-- FORMULA:
-- --------
-- Final Price = ((Base Price × Material Multiplier) + Body Config Adjustment + Customizations) × Urgency Multiplier - Discount
--
-- EXAMPLE 1: Salwar + Cotton + Simple Embroidery + Normal Urgency
-- -------
-- Base Price (Salwar):           ₹800
-- Material Multiplier (Cotton):   ×1.0 = ₹800
-- Body Config (Standard):         +₹0
-- Simple Embroidery:             +₹150
-- Urgency Multiplier (Normal):    ×1.0
-- Subtotal:                       ₹950
-- Discount (10%):                 -₹95
-- FINAL:                          ₹855
--
-- EXAMPLE 2: Kurta + Silk + Detailed Embroidery + Express
-- -------
-- Base Price (Kurta):             ₹600
-- Material Multiplier (Silk):     ×1.5 = ₹900
-- Body Config (Plus Size):        +₹200
-- Detailed Embroidery (10 sq"):   (₹300 + ₹100) = +₹400
-- Subtotal:                       ₹1500
-- Urgency Multiplier (Express):   ×1.25 = ₹1875
-- No Discount
-- FINAL:                          ₹1875
--
-- EXAMPLE 3: Dupatta + Georgette + Heavy Zari + Priority
-- -------
-- Base Price (Dupatta):           ₹150
-- Material Multiplier (Georgette):×1.2 = ₹180
-- Body Config (None):             +₹0
-- Zari Embroidery (5 sq"):        (₹500 + ₹100) = +₹600
-- Urgency Multiplier (Priority):  ×1.5
-- Subtotal:                       ₹780
-- Final:                          ₹780 × 1.5 = ₹1170
--

-- ============================================================================
-- END OF PRICING CONFIGURATION TABLES
-- ============================================================================
