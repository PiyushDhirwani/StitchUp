-- ============================================================================
-- StitchUp: Order Status History (Audit Trail)
-- File: 14_order_status_history.sql
-- ============================================================================

CREATE TABLE order_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  previous_status ENUM('created', 'material_received', 'tailor_assigned', 'cutting_started', 'stitching_in_progress', 'final_touch', 'ready_for_collection', 'completed', 'cancelled'),
  current_status ENUM('created', 'material_received', 'tailor_assigned', 'cutting_started', 'stitching_in_progress', 'final_touch', 'ready_for_collection', 'completed', 'cancelled') NOT NULL,
  changed_by INT,
  status_notes TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_order_id (order_id),
  KEY idx_changed_at (changed_at),
  KEY idx_current_status (current_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
