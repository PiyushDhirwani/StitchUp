-- Add DigiPIN column to consumer and tailor tables
ALTER TABLE user_consumer
  ADD COLUMN digipin VARCHAR(15) NULL AFTER longitude;

ALTER TABLE user_tailor
  ADD COLUMN digipin VARCHAR(15) NULL AFTER longitude;
