-- ============================================================================
-- StitchUp: Audit Logs (System Audit Trail)
-- File: 22_audit_logs.sql
-- ============================================================================

CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  request_id VARCHAR(100),
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_user_id (user_id),
  KEY idx_entity_type_id (entity_type, entity_id),
  KEY idx_created_at (created_at),
  KEY idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
