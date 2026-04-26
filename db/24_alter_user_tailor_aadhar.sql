-- Add Aadhaar number and address proof URL columns to user_tailor table
ALTER TABLE user_tailor
  ADD COLUMN aadhar_number VARCHAR(12) NULL AFTER shop_registration_number,
  ADD COLUMN address_proof_url VARCHAR(500) NULL AFTER aadhar_number;
