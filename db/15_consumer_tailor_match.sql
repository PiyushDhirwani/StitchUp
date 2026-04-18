-- ============================================================================
-- StitchUp: Consumer-Tailor Matching
-- File: 15_consumer_tailor_match.sql
-- ============================================================================

CREATE TABLE consumer_tailor_match (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  consumer_id INT NOT NULL,
  tailor_id INT NOT NULL,
  match_score DECIMAL(3, 2),
  distance_km DECIMAL(8, 2),
  tailor_availability_status ENUM('available', 'busy', 'on_leave') DEFAULT 'available',
  match_reason TEXT,
  matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  matched_by VARCHAR(50) DEFAULT 'algorithm',
  rejection_reason TEXT,
  rejected_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  is_selected BOOLEAN DEFAULT false,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (consumer_id) REFERENCES user_consumer(id) ON DELETE CASCADE,
  FOREIGN KEY (tailor_id) REFERENCES user_tailor(id) ON DELETE CASCADE,
  KEY idx_order_id (order_id),
  KEY idx_consumer_id (consumer_id),
  KEY idx_tailor_id (tailor_id),
  KEY idx_is_active (is_active),
  KEY idx_is_selected (is_selected),
  KEY idx_match_score (match_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
