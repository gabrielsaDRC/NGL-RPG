/*
  # Create Sessions and Messages Tables

  1. New Tables
    - `sessions`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
    - `messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `content` (text)
      - `sender_name` (text)
      - `sender_type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (temporary sessions)
*/

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  content text NOT NULL,
  sender_name text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('player', 'master', 'system')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions
CREATE POLICY "Allow public read sessions"
  ON sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert sessions"
  ON sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for messages
CREATE POLICY "Allow public read messages"
  ON messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert messages"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create index for faster message queries
CREATE INDEX messages_session_id_idx ON messages(session_id);
CREATE INDEX messages_created_at_idx ON messages(created_at);