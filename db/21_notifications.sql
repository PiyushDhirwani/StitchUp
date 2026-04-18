-- ============================================================================
-- StitchUp: Notifications
-- File: 21_notifications.sql
-- ============================================================================

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_type VARCHAR(100),
  title VARCHAR(200),
  message TEXT,
  related_order_id INT,
  related_ticket_id INT,
  notification_category VARCHAR(50),
  notification_priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  notification_status ENUM('unread', 'read', 'archived', 'deleted') DEFAULT 'unread',
  action_url VARCHAR(500),
  action_type VARCHAR(100),
  sent_via ENUM('in_app', 'email', 'sms', 'push') DEFAULT 'in_app',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  archived_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (related_ticket_id) REFERENCES support_tickets(id) ON DELETE SET NULL,
  KEY idx_user_id (user_id),
  KEY idx_notification_status (notification_status),
  KEY idx_created_at (created_at),
  KEY idx_related_order_id (related_order_id),
  KEY idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
