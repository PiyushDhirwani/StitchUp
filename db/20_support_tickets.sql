-- ============================================================================
-- StitchUp: Support & Grievance Tickets
-- File: 20_support_tickets.sql
-- ============================================================================

CREATE TABLE support_tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT,
  raised_by INT NOT NULL,
  raised_by_type ENUM('consumer', 'tailor') NOT NULL,
  ticket_type ENUM('quality_issue', 'delay', 'miscommunication', 'payment_issue', 'material_issue', 'measurement_issue', 'refund_request', 'other') NOT NULL,
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  attachments JSON,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  ticket_status ENUM('open', 'in_progress', 'waiting_for_customer', 'waiting_for_tailor', 'resolved', 'closed') DEFAULT 'open',
  assigned_to INT,
  category VARCHAR(50),
  resolution_notes TEXT,
  resolution_type VARCHAR(100),
  compensation_offered DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (raised_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_order_id (order_id),
  KEY idx_raised_by (raised_by),
  KEY idx_ticket_status (ticket_status),
  KEY idx_priority (priority),
  KEY idx_created_at (created_at),
  KEY idx_ticket_type (ticket_type),
  KEY idx_assigned_to (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
