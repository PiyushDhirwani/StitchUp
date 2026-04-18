-- ============================================================================
-- StitchUp: Body Measurements for Consumers
-- File: 04_body_measurements.sql
-- ============================================================================

CREATE TABLE body_measurements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consumer_id INT NOT NULL,
  name VARCHAR(100),
  height_cm DECIMAL(5, 2),
  weight_kg DECIMAL(5, 2),
  chest_cm DECIMAL(5, 2),
  waist_cm DECIMAL(5, 2),
  hips_cm DECIMAL(5, 2),
  shoulder_width_cm DECIMAL(5, 2),
  arm_length_cm DECIMAL(5, 2),
  inseam_cm DECIMAL(5, 2),
  neck_cm DECIMAL(5, 2),
  bust_cm DECIMAL(5, 2),
  back_length_cm DECIMAL(5, 2),
  notes TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (consumer_id) REFERENCES user_consumer(id) ON DELETE CASCADE,
  KEY idx_consumer_id (consumer_id),
  KEY idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
