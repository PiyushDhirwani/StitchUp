-- Add measurement_method to order_details
-- 'manual_measurements' = consumer provides body measurements
-- 'reference_clothing' = consumer sends similar existing clothes for tailor to measure from
ALTER TABLE order_details
  ADD COLUMN measurement_method ENUM('manual_measurements', 'reference_clothing') NOT NULL DEFAULT 'manual_measurements' AFTER body_measurement_id,
  MODIFY COLUMN body_measurement_id INT NULL;
