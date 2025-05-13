import { supabase } from './supabase';

export const sendNotification = async (
  sessionId: string,
  title: string,
  message: string,
  type: 'success' | 'warning' | 'error' | 'info' = 'info',
  targetUser?: string
) => {
  if (!sessionId) return;

  const notification = {
    id: crypto.randomUUID(),
    title,
    message,
    type,
    targetUser
  };

  await supabase.channel(`notifications:${sessionId}`)
    .send({
      type: 'broadcast',
      event: 'notification',
      payload: notification
    });
};