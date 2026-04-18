-- ============================================================================
-- StitchUp: Payment Methods (Stored User Payment Methods)
-- File: 17_payment_methods.sql
-- ============================================================================

CREATE TABLE payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  payment_method_type ENUM('credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'other') NOT NULL,
  provider VARCHAR(100),
  display_name VARCHAR(100),
  payment_details VARCHAR(500),
  token_id VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_user_id (user_id),
  KEY idx_is_default (is_default),
  KEY idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
