/*
  # Add combat_data column to messages table

  1. New Columns
    - `combat_data` (jsonb, nullable) - stores combat-related message data in JSON format
  
  2. Schema Changes
    - Updates the sender_type constraint to include 'combat' as a valid message type
    - Adds combat_data column for storing structured combat information
  
  3. Security
    - No RLS changes needed as messages table already has appropriate policies
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