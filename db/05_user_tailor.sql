-- ============================================================================
-- StitchUp: Tailor Profile
-- File: 05_user_tailor.sql
-- ============================================================================

CREATE TABLE user_tailor (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  shop_name VARCHAR(255) NOT NULL,
  shop_address_line1 VARCHAR(255),
  shop_address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  shop_registration_number VARCHAR(100),
  business_type VARCHAR(100),
  years_of_experience INT,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verification_status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_city_state (city, state),
  KEY idx_coordinates (latitude, longitude),
  KEY idx_is_verified (is_verified),
  KEY idx_average_rating (average_rating),
  KEY idx_verification_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
