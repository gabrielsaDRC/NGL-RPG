import React from 'react';
import { Power, Users, UserCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onAccept: (role: 'player' | 'master') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#000c1a] to-[#001830] flex items-center justify-center p-4 z-50">
      {/* Magical Runes Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
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

      <div className="relative max-w-2xl w-full">
        {/* Top Decorative Line */}
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffe1] to-transparent" />
        
        {/* Main Panel */}
        <div className="relative border border-[#00ffe1]/30 rounded-lg p-8 bg-[#000c1a]/90 backdrop-blur-sm">
          {/* Glowing Effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#00ffe1]/5 to-transparent pointer-events-none" />
          
          {/* Content */}
          <div className="relative space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-[#00ffe1] tracking-wider drop-shadow-[0_0_10px_#00ffe1]">
                SISTEMA
              </h1>
              <p className="text-xl text-[#00ffe1]/70">
                Selecione seu papel
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/30 to-transparent" />

            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => onAccept('player')}
                className="group relative px-8 py-6 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex flex-col items-center gap-4 text-[#00ffe1]">
                  <UserCircle2 className="w-12 h-12" />
                  <div className="text-center">
                    <span className="block text-xl font-bold tracking-wider">JOGADOR</span>
                    <span className="text-sm opacity-75">Criar e gerenciar personagem</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onAccept('master')}
                className="group relative px-8 py-6 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex flex-col items-center gap-4 text-[#00ffe1]">
                  <Users className="w-12 h-12" />
                  <div className="text-center">
                    <span className="block text-xl font-bold tracking-wider">MESTRE</span>
                    <span className="text-sm opacity-75">Gerenciar sessão</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Line */}
        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffe1] to-transparent" />
      </div>
    </div>
  );
};