-- ============================================================================
-- StitchUp: Ratings & Reviews
-- File: 19_ratings_reviews.sql
-- ============================================================================

CREATE TABLE ratings_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewer_type ENUM('consumer', 'tailor') NOT NULL,
  tailor_id INT,
  overall_rating INT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INT CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating INT CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  review_title VARCHAR(200),
  review_text TEXT,
  items_reviewed VARCHAR(500),
  pros TEXT,
  cons TEXT,
  photos_url JSON,
  is_verified_purchase BOOLEAN DEFAULT true,
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  response_from_tailor TEXT,
  response_date TIMESTAMP,
  recommendation_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tailor_id) REFERENCES user_tailor(id) ON DELETE CASCADE,
  KEY idx_order_id (order_id),
  KEY idx_tailor_id (tailor_id),
  KEY idx_reviewer_id (reviewer_id),
  KEY idx_overall_rating (overall_rating),
  KEY idx_reviewer_type (reviewer_type),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
