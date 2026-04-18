-- ============================================================================
-- StitchUp: Appointments & Scheduling
-- File: 16_appointments.sql
-- ============================================================================

CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  consumer_id INT NOT NULL,
  tailor_id INT NOT NULL,
  appointment_type ENUM('initial_consultation', 'measurement', 'fabric_drop', 'fitting', 'final_pickup') NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time_start TIME,
  appointment_time_end TIME,
  duration_minutes INT DEFAULT 30,
  appointment_status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show') DEFAULT 'scheduled',
  notes TEXT,
  location_type ENUM('shop', 'consumer_home', 'virtual') DEFAULT 'shop',
  location_address VARCHAR(500),
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (consumer_id) REFERENCES user_consumer(id) ON DELETE CASCADE,
  FOREIGN KEY (tailor_id) REFERENCES user_tailor(id) ON DELETE CASCADE,
  KEY idx_order_id (order_id),
  KEY idx_tailor_id (tailor_id),
  KEY idx_consumer_id (consumer_id),
  KEY idx_appointment_date (appointment_date),
  KEY idx_appointment_status (appointment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
