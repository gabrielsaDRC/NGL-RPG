import React, { useState } from 'react';
import { Bell, X, Send, Users, UserCircle, Star, Sparkles, Crown, Shield } from 'lucide-react';
import { Modal } from './Modal';
import { sendNotification } from '../utils/notifications';

interface NotificationModalProps {
  character: {
    name: string;
  };
  connectedUsers?: { user: string }[];
}

const NOTIFICATION_TYPES = [
  { 
    id: 'info', 
    name: 'Informação', 
    icon: <Crown className="w-6 h-6 text-blue-400" />, 
    color: 'from-blue-500/20 to-purple-500/20',
    borderColor: 'border-blue-400/50',
    textColor: 'text-blue-400',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'
  },
  { 
    id: 'success', 
    name: 'Sucesso', 
    icon: <Star className="w-6 h-6 text-green-400" />, 
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-400/50',
    textColor: 'text-green-400',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]'
  },
  { 
    id: 'warning', 
    name: 'Alerta', 
    icon: <Sparkles className="w-6 h-6 text-yellow-400" />, 
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-400/50',
    textColor: 'text-yellow-400',
    glowColor: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]'
  },
  { 
    id: 'error', 
    name: 'Perigo', 
    icon: <Shield className="w-6 h-6 text-red-400" />, 
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-400/50',
    textColor: 'text-red-400',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]'
  }
];

export const NotificationModal: React.FC<NotificationModalProps> = ({
  character,
  connectedUsers = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'warning' | 'error' | 'info'>('info');
  const [targetUser, setTargetUser] = useState<string>('');

  const handleSendNotification = async () => {
    const sessionId = localStorage.getItem('rpg-session-id');
    if (!sessionId || !title.trim() || !message.trim()) return;

    await sendNotification(
      sessionId,
      title,
      message,
      type,
      targetUser || undefined
    );

    setTitle('');
    setMessage('');
    setType('info');
    setTargetUser('');
    setIsOpen(false);
  };

  const selectedType = NOTIFICATION_TYPES.find(t => t.id === type) || NOTIFICATION_TYPES[0];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1]"
      >
        {/* Button Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
        </div>

        <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
          <Bell className="w-5 h-5" />
          <span>ENVIAR NOTIFICAÇÃO</span>
        </div>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="SISTEMA"
      >
        <div className="relative space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xl text-[#00ffe1]/70">
              Notificação do Sistema
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/30 to-transparent" />

          <div className="space-y-6">
            {/* Notification Type Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {NOTIFICATION_TYPES.map(notificationType => (
                <button
                  key={notificationType.id}
                  onClick={() => setType(notificationType.id as any)}
                  className={`
                    group relative p-4 rounded-xl border-2 transition-all duration-300
                    ${type === notificationType.id
                      ? `bg-gradient-to-br ${notificationType.color} ${notificationType.borderColor} ${notificationType.glowColor}`
                      : 'bg-[#001830] border-[#00ffe1]/30 hover:border-[#00ffe1] hover:bg-[#002040]'
                    }
                  `}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
                  </div>
                  <div className="relative flex flex-col items-center gap-2">
                    {notificationType.icon}
                    <span className={`font-bold text-sm ${type === notificationType.id ? notificationType.textColor : 'text-[#00ffe1]'}`}>
                      {notificationType.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                placeholder="Título da Notificação"
              />
            </div>

            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                placeholder="Mensagem da Notificação"
                rows={4}
              />
            </div>

            <div>
              <select
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
              >
                <option value="">Todos os jogadores</option>
                {connectedUsers.map(user => (
                  <option key={user.user} value={user.user}>{user.user}</option>
                ))}
              </select>
            </div>

            {/* Preview */}
            {title && message && (
              <div className={`p-4 rounded-lg border-2 ${selectedType.borderColor} bg-gradient-to-r ${selectedType.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  {selectedType.icon}
                  <h3 className={`font-bold text-lg ${selectedType.textColor}`}>
                    Prévia: {title}
                  </h3>
                </div>
                <p className="text-[#00ffe1]/90 ml-9">
                  {message}
                </p>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button
                onClick={handleSendNotification}
                disabled={!title.trim() || !message.trim()}
                className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
                  <Send className="w-5 h-5" />
                  <span>ENVIAR</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};