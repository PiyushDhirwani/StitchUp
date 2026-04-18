-- ============================================================================
-- StitchUp: Tailor Verification Documents (PAN, Aadhar, etc.)
-- File: 06_tailor_verification.sql
-- ============================================================================

CREATE TABLE tailor_verification (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tailor_id INT NOT NULL,
  verification_type ENUM('pan', 'aadhar', 'gst', 'shop_license', 'other') NOT NULL,
  document_url VARCHAR(500),
  document_number VARCHAR(100),
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  rejection_reason TEXT,
  verified_by INT,
  FOREIGN KEY (tailor_id) REFERENCES user_tailor(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_tailor_id (tailor_id),
  KEY idx_verification_type (verification_type),
  KEY idx_status (status),
  UNIQUE KEY unique_tailor_verification_type (tailor_id, verification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
