-- ============================================================================
-- StitchUp: Tailor Bank Details
-- File: 07_tailor_bank_details.sql
-- ============================================================================

CREATE TABLE tailor_bank_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tailor_id INT NOT NULL UNIQUE,
  bank_name VARCHAR(100),
  account_holder_name VARCHAR(100),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  account_type ENUM('savings', 'current') DEFAULT 'savings',
  upi_id VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tailor_id) REFERENCES user_tailor(id) ON DELETE CASCADE,
  KEY idx_tailor_id (tailor_id),
  KEY idx_is_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
