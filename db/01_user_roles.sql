-- ============================================================================
-- StitchUp: User Roles Management
-- File: 01_user_roles.sql
-- ============================================================================

CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT INTO user_roles (role_name, description) VALUES
('consumer', 'End customer placing stitching orders'),
('tailor', 'Professional tailor/stitcher'),
('admin', 'Platform administrator'),
('support', 'Customer support staff');
