-- ============================================================================
-- StitchUp: Database Schema - Master File
-- This file includes all tables in dependency order
-- ============================================================================

-- Step 1: Foundation Tables
-- ============================================================================
SOURCE 01_user_roles.sql;
SOURCE 02_users.sql;

-- Step 2: User Profiles
-- ============================================================================
SOURCE 03_user_consumer.sql;
SOURCE 04_body_measurements.sql;
SOURCE 05_user_tailor.sql;
SOURCE 06_tailor_verification.sql;
SOURCE 07_tailor_bank_details.sql;

-- Step 3: Templates & Materials
-- ============================================================================
SOURCE 08_template_type.sql;
SOURCE 09_template_sub_type.sql;
SOURCE 10_material.sql;

-- Step 4: Orders & Workflow
-- ============================================================================
SOURCE 11_orders.sql;
SOURCE 12_order_items.sql;
SOURCE 13_order_details.sql;
SOURCE 14_order_status_history.sql;
SOURCE 15_consumer_tailor_match.sql;
SOURCE 16_appointments.sql;

-- Step 5: Payments
-- ============================================================================
SOURCE 17_payment_methods.sql;
SOURCE 18_payment_transactions.sql;

-- Step 6: Feedback & Support
-- ============================================================================
SOURCE 19_ratings_reviews.sql;
SOURCE 20_support_tickets.sql;

-- Step 7: System Tables
-- ============================================================================
SOURCE 21_notifications.sql;
SOURCE 22_audit_logs.sql;

-- ============================================================================
-- Database Setup Complete
-- ============================================================================
