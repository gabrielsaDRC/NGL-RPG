/*
  # Add Combat Message Support

  1. Changes
    - Add combat_data column to messages table
    - Update sender_type check constraint to include 'combat' type

  2. Notes
    - Safe migration that preserves existing data
    - Adds support for storing combat data in JSON format
*/

-- Add combat_data column to messages table
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS combat_data jsonb DEFAULT NULL;

-- Update the sender_type check constraint to include 'combat'
ALTER TABLE messages 
  DROP CONSTRAINT IF EXISTS messages_sender_type_check;

ALTER TABLE messages 
  ADD CONSTRAINT messages_sender_type_check 
  CHECK (sender_type IN ('player', 'master', 'system', 'roll', 'combat'));