# Fix Supabase Schema Error

The application is trying to use a `combat_data` column in the `messages` table that doesn't exist in your Supabase database.

## Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project: `btbhuahghwlfvkovzuor`

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration SQL**
   Copy and paste this SQL code and execute it:

```sql
-- Add combat_data column to messages table
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS combat_data jsonb DEFAULT NULL;

-- Update the sender_type check constraint to include 'combat'
ALTER TABLE messages 
  DROP CONSTRAINT IF EXISTS messages_sender_type_check;

ALTER TABLE messages 
  ADD CONSTRAINT messages_sender_type_check 
  CHECK (sender_type IN ('player', 'master', 'system', 'roll', 'combat'));
```

4. **Verify the Changes**
   After running the SQL, you can verify it worked by running:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'combat_data';
```

5. **Refresh Your Application**
   Once the migration is applied, refresh your application and the error should be resolved.

## What This Migration Does:
- Adds a `combat_data` column to store combat-related message data in JSON format
- Updates the sender_type constraint to allow 'combat' as a valid message type
- Uses `IF NOT EXISTS` to safely add the column without errors if it already exists

The combat system in your chat will work properly once this migration is applied.