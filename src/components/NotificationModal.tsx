import React, { useState } from 'react';
import { Bell, X, Send, Users, UserCircle } from 'lucide-react';
import { Modal } from './Modal';
import { sendNotification } from '../utils/notifications';

interface NotificationModalProps {
  character: {
    name: string;
  };
  connectedUsers?: { user: string }[];
}

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

            <div className="flex justify-center pt-4">
              <button
                onClick={handleSendNotification}
                disabled={!title.trim() || !message.trim()}
                className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Button Glow Effect */}
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