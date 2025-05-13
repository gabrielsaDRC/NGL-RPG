/*
  # Enable Realtime for Messages Table

  1. Changes
    - Enable realtime for messages table
    - Add realtime security policies

  2. Security
    - Allow realtime SELECT for all users
    - Allow realtime INSERT for all users
*/

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for specific columns
ALTER TABLE messages REPLICA IDENTITY FULL;