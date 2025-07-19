import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Star, Sparkles, Crown, Shield, Zap } from 'lucide-react';

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

const NOTIFICATION_TYPES = {
  success: {
    icon: <Star className="w-8 h-8 text-green-400" />,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-400/50',
    textColor: 'text-green-400',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]'
  },
  warning: {
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-400/50',
    textColor: 'text-yellow-400',
    glowColor: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]'
  },
  error: {
    icon: <Shield className="w-8 h-8 text-red-400" />,
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-400/50',
    textColor: 'text-red-400',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]'
  },
  info: {
    icon: <Crown className="w-8 h-8 text-blue-400" />,
    color: 'from-blue-500/20 to-purple-500/20',
    borderColor: 'border-blue-400/50',
    textColor: 'text-blue-400',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'
  }
};

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
        {notifications.map(notification => {
          const notificationType = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
          
          return (
            <div
              key={notification.id}
              className="relative max-w-2xl w-full mx-4 animate-fade-in"
            >
              {/* Top Decorative Line */}
              <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffe1] to-transparent" />
              
              {/* Main Panel */}
              <div className="relative border-2 border-[#00ffe1]/30 rounded-xl p-8 bg-[#000c1a]/90 backdrop-blur-sm">
                {/* Glowing Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#00ffe1]/5 to-transparent pointer-events-none" />
                
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
                  <div className="flex items-center justify-center gap-4">
                    <div className={`p-4 rounded-full border-2 ${notificationType.borderColor} bg-gradient-to-br ${notificationType.color} ${notificationType.glowColor}`}>
                      {notificationType.icon}
                    </div>
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

                  {/* Animated Particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full ${notificationType.textColor}`}
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          opacity: 0.3 + Math.random() * 0.5,
                          transform: 'scale(0)',
                          animation: `magical-sparkle ${3 + Math.random() * 5}s infinite ease-in-out ${Math.random() * 5}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Decorative Line */}
              <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffe1] to-transparent" />
            </div>
          );
        })}
      </div>
    </div>
  );
};