import React from 'react';
import { Sword, Sparkles, Crown, Star, Zap } from 'lucide-react';

interface CombatPreferencesProps {
  attackAttribute: 'physical' | 'magical';
  onPreferenceChange: (type: 'attack', attribute: 'physical' | 'magical') => void;
}

const ATTACK_TYPES = {
  physical: {
    name: 'Ataque Físico',
    icon: <Sword className="w-4 h-4" />,
    description: 'Força bruta e habilidade marcial',
    color: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-400/50',
    textColor: 'text-orange-400',
    glowColor: 'shadow-[0_0_15px_rgba(251,146,60,0.5)]'
  },
  magical: {
    name: 'Ataque Mágico',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Poder arcano e energia mística',
    color: 'from-blue-500/20 to-purple-500/20',
    borderColor: 'border-blue-400/50',
    textColor: 'text-blue-400',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'
  }
};

export const CombatPreferences: React.FC<CombatPreferencesProps> = ({
  attackAttribute,
  onPreferenceChange
}) => {
  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-4 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg border border-[#00ffe1]/50 bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5">
          <Crown className="w-5 h-5 text-[#00ffe1]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
            Preferências de Combate
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-[#00ffe1]" />
          <span className="text-sm font-medium text-[#00ffe1]">Tipo de Ataque Principal</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {Object.entries(ATTACK_TYPES).map(([key, type]) => (
            <button
              key={key}
              onClick={() => onPreferenceChange('attack', key as 'physical' | 'magical')}
              className={`
                group relative p-3 rounded-lg border transition-all duration-300 overflow-hidden
                ${attackAttribute === key
                  ? `bg-gradient-to-br ${type.color} ${type.borderColor} ${type.glowColor}`
                  : 'bg-[#001830] border-[#00ffe1]/30 hover:border-[#00ffe1] hover:bg-[#002040]'
                }
              `}
            >
              {/* Magical Effect Background */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
              </div>

              <div className="relative flex items-center gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg border ${attackAttribute === key ? type.borderColor : 'border-[#00ffe1]/30'} bg-gradient-to-br ${attackAttribute === key ? type.color : 'from-[#1a1a1a] to-[#2a2a2a]'} transition-all duration-300`}>
                  {type.icon}
                </div>

                {/* Content */}
                <div className="text-left">
                  <h3 className={`text-sm font-bold ${attackAttribute === key ? type.textColor : 'text-[#00ffe1]'} transition-colors`}>
                    {type.name}
                  </h3>
                  <p className="text-[#00ffe1]/70 text-xs">
                    {type.description}
                  </p>
                </div>

                {/* Selection Indicator */}
                {attackAttribute === key && (
                  <div className="absolute -top-1 -right-1">
                    <div className={`p-1 rounded-full ${type.bgColor} ${type.borderColor} border ${type.glowColor}`}>
                      <Zap className={`w-3 h-3 ${type.textColor}`} />
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};