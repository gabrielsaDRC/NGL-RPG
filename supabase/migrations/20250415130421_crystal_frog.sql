/*
  # Update Messages Table for Roll Data

  1. Changes
    - Add roll_data column to messages table
    - Update sender_type check constraint to include 'roll' type

  2. Notes
    - Safe migration that preserves existing data
    - Adds support for storing roll data in JSON format
*/

-- Add roll_data column to messages table
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS roll_data jsonb DEFAULT NULL;

-- Update the sender_type check constraint to include 'roll'
ALTER TABLE messages 
  DROP CONSTRAINT IF EXISTS messages_sender_type_check;

ALTER TABLE messages 
  ADD CONSTRAINT messages_sender_type_check 
  CHECK (sender_type IN ('player', 'master', 'system', 'roll'));