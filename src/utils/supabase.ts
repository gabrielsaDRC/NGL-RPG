import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 20,
      reconnect: true,
      heartbeatIntervalMs: 10000,
      timeoutMs: 60000
    }
  }
});

export const createSession = async () => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([{ created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const joinSession = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .select()
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
};