import React, { useState } from 'react';
import { Battery, Moon, Zap, Sparkles, Star, Crown, Flame } from 'lucide-react';

interface FatigueSystemProps {
  fatigue: number;
  onFatigueChange: (value: number, action?: string) => void;
  readOnly?: boolean;
}

const FATIGUE_ACTIONS = {
  physical: {
    name: 'Ataque Físico',
    icon: <Zap className="w-4 h-4" />,
    cost: 5,
    color: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-400/50',
    textColor: 'text-orange-400',
    glowColor: 'shadow-[0_0_15px_rgba(251,146,60,0.5)]'
  },
  magical: {
    name: 'Ataque Mágico',
    icon: <Sparkles className="w-4 h-4" />,
    cost: 5,
    color: 'from-blue-500/20 to-purple-500/20',
    borderColor: 'border-blue-400/50',
    textColor: 'text-blue-400',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'
  },
  dodge: {
    name: 'Esquiva',
    icon: <Star className="w-4 h-4" />,
    cost: '3-10',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-400/50',
    textColor: 'text-green-400',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]'
  },
  rest: {
    name: 'Descanso (1h)',
    icon: <Moon className="w-4 h-4" />,
    cost: -25,
    color: 'from-indigo-500/20 to-purple-500/20',
    borderColor: 'border-indigo-400/50',
    textColor: 'text-indigo-400',
    glowColor: 'shadow-[0_0_15px_rgba(99,102,241,0.5)]'
  },
  potion: {
    name: 'Usar Poção',
    icon: <Crown className="w-4 h-4" />,
    cost: -15,
    color: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-pink-400/50',
    textColor: 'text-pink-400',
    glowColor: 'shadow-[0_0_15px_rgba(244,114,182,0.5)]'
  }
};

export const FatigueSystem: React.FC<FatigueSystemProps> = ({ 
  fatigue, 
  onFatigueChange,
  readOnly = false
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleFatigueAction = (type: 'physical' | 'magical' | 'dodge' | 'rest' | 'potion') => {
    if (readOnly) return;

    let change = 0;
    let action = '';
    
    switch (type) {
      case 'physical':
        change = 5;
        action = 'Ataque Físico';
        break;
      case 'magical':
        change = 5;
        action = 'Ataque Mágico';
        break;
      case 'dodge':
        change = Math.floor(Math.random() * 8) + 3; // 3-10
        action = 'Esquiva';
        break;
      case 'rest':
        change = -25;
        action = 'Descanso de 1 hora';
        break;
      case 'potion':
        change = -15;
        action = 'Uso de Poção';
        break;
    }

    const newFatigue = Math.max(0, Math.min(120, fatigue + change));
    
    // Set active action for animation
    setActiveAction(type);
    setTimeout(() => setActiveAction(null), 1000);

    onFatigueChange(newFatigue, action);
  };

  const getFatigueColor = (fatigue: number) => {
    if (fatigue >= 120) return 'text-red-600';
    if (fatigue >= 100) return 'text-red-500';
    if (fatigue >= 75) return 'text-orange-500';
    if (fatigue >= 50) return 'text-yellow-500';
    return 'text-[#00ff88]';
  };

  const getFatigueStatus = () => {
    if (fatigue >= 120) return { text: 'Desmaiado!', color: 'text-red-600', bgColor: 'bg-red-900/20', borderColor: 'border-red-500/50' };
    if (fatigue >= 100) return { text: '-2 em todos os testes', color: 'text-red-500', bgColor: 'bg-red-900/20', borderColor: 'border-red-500/50' };
    if (fatigue >= 75) return { text: 'Muito cansado', color: 'text-orange-500', bgColor: 'bg-orange-900/20', borderColor: 'border-orange-500/50' };
    if (fatigue >= 50) return { text: 'Cansado', color: 'text-yellow-500', bgColor: 'bg-yellow-900/20', borderColor: 'border-yellow-500/50' };
    return { text: 'Normal', color: 'text-[#00ff88]', bgColor: 'bg-green-900/20', borderColor: 'border-green-500/50' };
  };

  const status = getFatigueStatus();

  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-4 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg border border-[#00ffe1]/50 bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5">
          <Battery className="w-5 h-5 text-[#00ffe1]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
            Sistema de Fadiga
          </h2>
        </div>
      </div>

      {/* Fatigue Display */}
      <div className="mb-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#00ffe1] relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ffe1]/5 to-transparent animate-pulse" />
        
        <div className="relative">
          {/* Progress Bar */}
          <div className="w-full bg-[#2a2a2a] rounded-full h-2 border border-[#00ffe1]/30 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getFatigueColor(fatigue)} relative overflow-hidden`}
              style={{ 
                width: `${Math.min(100, (fatigue / 120) * 100)}%`, 
                backgroundColor: 'currentColor'
              }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <div className={`px-2 py-1 rounded-full border ${status.borderColor} ${status.bgColor} ${status.color} font-bold text-xs text-center shadow-lg`}>
              {status.text}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(FATIGUE_ACTIONS).map(([key, action]) => (
          <button
            key={key}
            onClick={() => handleFatigueAction(key as any)}
            disabled={readOnly}
            className={`
              group relative p-2 rounded-lg border transition-all duration-300 overflow-hidden
              ${activeAction === key 
                ? 'opacity-50 scale-95' 
                : `bg-gradient-to-br ${action.color} ${action.borderColor} hover:${action.glowColor} hover:scale-105`
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {/* Magical Effect Background */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex flex-col items-center gap-1">
              <div className={`p-1 rounded-lg border ${action.borderColor} bg-gradient-to-br ${action.color}`}>
                {action.icon}
              </div>
              
              <div className="text-center">
                <div className={`font-bold text-xs ${action.textColor}`}>
                  {action.name}
                </div>
                <div className="text-[#00ffe1]/70 text-xs">
                  {typeof action.cost === 'number' 
                    ? action.cost > 0 
                      ? `+${action.cost}` 
                      : `${action.cost}`
                    : action.cost
                  }
                </div>
              </div>
            </div>

            {/* Pulse effect for active action */}
            {activeAction === key && (
              <div className="absolute inset-0 border border-white/50 rounded-lg animate-ping" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};