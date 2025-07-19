import React, { useState } from 'react';
import { Power, Users, UserCircle2, Scroll, Sword, Sparkles, Star, Crown, Shield } from 'lucide-react';
import { RulesScreen } from './RulesScreen';

interface WelcomeScreenProps {
  onAccept: (role: 'player' | 'master') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAccept }) => {
  const [showRules, setShowRules] = useState(false);

  if (showRules) {
    return <RulesScreen onBack={() => setShowRules(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#000c1a] to-[#001830] flex items-center justify-center p-4 z-50">
      {/* Magical Runes Background - Reduced size */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-16 h-16 border border-[#00ffe1]/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `float ${4 + Math.random() * 3}s infinite ease-in-out ${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Animated Magical Particles - Reduced quantity */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#00ffe1]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.4,
              transform: 'scale(0)',
              animation: `magical-sparkle ${2 + Math.random() * 4}s infinite ease-in-out ${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative max-w-3xl w-full">
        {/* Top Decorative Line */}
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffe1] to-transparent" />
        
        {/* Main Panel - Reduced padding and size */}
        <div className="relative border border-[#00ffe1]/30 rounded-lg p-6 bg-[#000c1a]/90 backdrop-blur-sm">
          {/* Glowing Effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#00ffe1]/5 to-transparent pointer-events-none" />
          
          {/* Content - More compact */}
          <div className="relative space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-full bg-[#00ffe1]/10 animate-pulse-glow"></div>
                  <div className="relative p-4 rounded-full border-2 border-[#00ffe1] shadow-[0_0_20px_#00ffe1]">
                    <Shield className="w-10 h-10 text-[#00ffe1]" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-[#00ffe1] tracking-wider drop-shadow-[0_0_10px_#00ffe1]">
                SISTEMA RPG
              </h1>
              <p className="text-lg text-[#00ffe1]/70">
                Selecione seu papel
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/30 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => onAccept('player')}
                className="group relative px-4 py-5 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_15px_#00ffe1] hover:scale-105"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex flex-col items-center gap-3 text-[#00ffe1]">
                  <div className="p-3 rounded-full border border-[#00ffe1] bg-[#001830] group-hover:shadow-[0_0_10px_#00ffe1] transition-all">
                    <UserCircle2 className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-bold tracking-wider">JOGADOR</span>
                    <span className="text-xs opacity-75 block">Criar personagem</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onAccept('master')}
                className="group relative px-4 py-5 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_15px_#00ffe1] hover:scale-105"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex flex-col items-center gap-3 text-[#00ffe1]">
                  <div className="p-3 rounded-full border border-[#00ffe1] bg-[#001830] group-hover:shadow-[0_0_10px_#00ffe1] transition-all">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-bold tracking-wider">MESTRE</span>
                    <span className="text-xs opacity-75 block">Gerenciar sessão</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowRules(true)}
                className="group relative px-4 py-5 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_15px_#00ffe1] hover:scale-105"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex flex-col items-center gap-3 text-[#00ffe1]">
                  <div className="p-3 rounded-full border border-[#00ffe1] bg-[#001830] group-hover:shadow-[0_0_10px_#00ffe1] transition-all">
                    <Scroll className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-bold tracking-wider">REGRAS</span>
                    <span className="text-xs opacity-75 block">Consultar regras</span>
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