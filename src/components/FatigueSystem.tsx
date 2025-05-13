import React, { useState } from 'react';
import { Battery, Moon, Option as Potion } from 'lucide-react';

interface FatigueSystemProps {
  fatigue: number;
  onFatigueChange: (value: number, action?: string) => void;
  readOnly?: boolean;
}

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
    if (fatigue >= 120) return { text: 'Desmaiado!', color: 'text-red-600' };
    if (fatigue >= 100) return { text: '-2 em todos os testes', color: 'text-red-500' };
    if (fatigue >= 75) return { text: 'Muito cansado', color: 'text-orange-500' };
    if (fatigue >= 50) return { text: 'Cansado', color: 'text-yellow-500' };
    return { text: 'Normal', color: 'text-[#00ff88]' };
  };

  const status = getFatigueStatus();

  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <h2 className="text-2xl font-bold text-[#00ffe1] mb-6 drop-shadow-[0_0_10px_#00ffe1]">
        Sistema de Fadiga
      </h2>

      <div className="flex items-center space-x-4 mb-4">
        <Battery size={24} className="text-[#00ffe1]" />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#00ffe1]">Nível de Fadiga: {fatigue}</span>
            <span className={`font-bold ${status.color}`}>{status.text}</span>
          </div>
          <div className="w-full bg-[#1a1a1a] rounded-full h-2 border border-[#00ffe1]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getFatigueColor(fatigue)}`}
              style={{ width: `${Math.min(100, (fatigue / 120) * 100)}%`, backgroundColor: 'currentColor' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        <button
          onClick={() => handleFatigueAction('physical')}
          disabled={readOnly}
          className={`group relative bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed ${
            activeAction === 'physical' ? 'opacity-50' : ''
          }`}
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
          </div>

          <div className="relative text-[#00ffe1] px-4 py-3">
            Ataque Físico (+5)
          </div>
        </button>

        <button
          onClick={() => handleFatigueAction('magical')}
          disabled={readOnly}
          className={`group relative bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed ${
            activeAction === 'magical' ? 'opacity-50' : ''
          }`}
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
          </div>

          <div className="relative text-[#00ffe1] px-4 py-3">
            Ataque Mágico (+5)
          </div>
        </button>

        <button
          onClick={() => handleFatigueAction('dodge')}
          disabled={readOnly}
          className={`group relative bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed ${
            activeAction === 'dodge' ? 'opacity-50' : ''
          }`}
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
          </div>

          <div className="relative text-[#00ffe1] px-4 py-3">
            Esquiva (+3~10)
          </div>
        </button>

        <button
          onClick={() => handleFatigueAction('rest')}
          disabled={readOnly}
          className={`group relative bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed ${
            activeAction === 'rest' ? 'opacity-50' : ''
          }`}
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
          </div>

          <div className="relative flex items-center justify-center gap-2 text-[#00ffe1] px-4 py-3">
            <Moon size={20} />
            <span>Descansar 1h (-25)</span>
          </div>
        </button>

        <button
          onClick={() => handleFatigueAction('potion')}
          disabled={readOnly}
          className={`group relative bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed ${
            activeAction === 'potion' ? 'opacity-50' : ''
          }`}
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
          </div>

          <div className="relative flex items-center justify-center gap-2 text-[#00ffe1] px-4 py-3">
            <Potion size={20} />
            <span>Usar Poção (-15)</span>
          </div>
        </button>
      </div>
    </div>
  );
};