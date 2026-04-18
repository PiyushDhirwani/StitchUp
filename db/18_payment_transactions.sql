-- ============================================================================
-- StitchUp: Payment Transactions
-- File: 18_payment_transactions.sql
-- ============================================================================

CREATE TABLE payment_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  consumer_id INT NOT NULL,
  tailor_id INT,
  transaction_type ENUM('advance_payment', 'final_payment', 'refund', 'adjustment', 'tailor_payout') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method_id INT,
  payment_gateway VARCHAR(50),
  payment_gateway_transaction_id VARCHAR(100),
  payment_status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
  payment_date TIMESTAMP,
  transaction_reference VARCHAR(100),
  failure_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (consumer_id) REFERENCES user_consumer(id) ON DELETE CASCADE,
  FOREIGN KEY (tailor_id) REFERENCES user_tailor(id) ON DELETE SET NULL,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL,
  KEY idx_order_id (order_id),
  KEY idx_consumer_id (consumer_id),
  KEY idx_tailor_id (tailor_id),
  KEY idx_payment_status (payment_status),
  KEY idx_created_at (created_at),
  KEY idx_transaction_reference (transaction_reference),
  KEY idx_transaction_type (transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
