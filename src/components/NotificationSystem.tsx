import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  targetUser?: string;
}

interface NotificationSystemProps {
  character: {
    name: string;
  };
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ character }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const sessionId = localStorage.getItem('rpg-session-id');
    if (!sessionId) return;

    const channel = supabase.channel(`notifications:${sessionId}`)
      .on(
        'broadcast',
        { event: 'notification' },
        (payload) => {
          const notification = payload.payload as Notification;
          
          if (!notification.targetUser || notification.targetUser === character.name) {
            setNotifications(prev => [...prev, notification]);
            
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [character.name]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="relative h-full flex items-center justify-center">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className="relative max-w-2xl w-full mx-4 animate-fade-in"
          >
            {/* Top Decorative Line */}
            <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffe1] to-transparent" />
            
            {/* Main Panel */}
            <div className="relative border border-[#00ffe1]/30 rounded-lg p-8 bg-[#000c1a]/90 backdrop-blur-sm">
              {/* Glowing Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#00ffe1]/5 to-transparent pointer-events-none" />
              
              {/* Magical Runes */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-24 h-24 border border-[#00ffe1]/20"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                        animation: `float ${5 + Math.random() * 5}s infinite ease-in-out ${Math.random() * 5}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Content */}
              <div className="relative space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-bold text-[#00ffe1] tracking-wider drop-shadow-[0_0_10px_#00ffe1]">
                    {notification.title}
                  </h1>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/30 to-transparent" />

                <div className="space-y-6 text-center">
                  <p className="text-xl text-white leading-relaxed">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Decorative Line */}
            <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffe1] to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
};