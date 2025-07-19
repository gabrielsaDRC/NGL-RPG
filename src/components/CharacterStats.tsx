import React, { useState } from 'react';
import { Heart, Sparkles, Sword, Flame, Shield, Wind } from 'lucide-react';
import { ICharacterStats } from '../types/character';

interface CharacterStatsProps {
  stats: ICharacterStats;
  onFatigueChange: (value: number) => void;
  onHpChange: (value: number) => void;
  onMpChange: (value: number) => void;
  readOnly?: boolean;
}

export const CharacterStats: React.FC<CharacterStatsProps> = ({
  stats,
  onFatigueChange,
  onHpChange,
  onMpChange,
  readOnly = false
}) => {
  const [customHpValue, setCustomHpValue] = useState('');
  const [customMpValue, setCustomMpValue] = useState('');
  const [showCustomHp, setShowCustomHp] = useState(false);
  const [showCustomMp, setShowCustomMp] = useState(false);
  const [isHpHealing, setIsHpHealing] = useState(false);

  const handleHpChange = (newValue: number) => {
    const clampedValue = Math.max(0, Math.min(stats.hp, newValue));
    onHpChange(clampedValue);
  };

  const handleMpChange = (newValue: number) => {
    const clampedValue = Math.max(0, Math.min(stats.mp, newValue));
    onMpChange(clampedValue);
  };

  const handleCustomHpSubmit = () => {
    const value = parseInt(customHpValue);
    if (!isNaN(value)) {
      if (isHpHealing) {
        handleHpChange(stats.currentHp + value);
      } else {
        handleHpChange(stats.currentHp - value);
      }
      setCustomHpValue('');
      setShowCustomHp(false);
    }
  };

  const handleCustomMpSubmit = () => {
    const value = parseInt(customMpValue);
    if (!isNaN(value)) {
      handleMpChange(stats.currentMp - value);
      setCustomMpValue('');
      setShowCustomMp(false);
    }
  };

  const getHpColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage <= 25) return 'text-red-500';
    if (percentage <= 50) return 'text-orange-500';
    if (percentage <= 75) return 'text-yellow-500';
    return 'text-[#00ff88]';
  };

  const getMpColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage <= 25) return 'text-blue-300';
    if (percentage <= 50) return 'text-blue-400';
    if (percentage <= 75) return 'text-blue-500';
    return 'text-blue-600';
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full max-w-[600px] space-y-6">
        {/* HP and MP Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* HP */}
          <div className="flex items-center space-x-4">
            <Heart size={20} className="text-[#00ffe1] drop-shadow-[0_0_5px_#00ffe1]" />
            <div className="flex-1">
              <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#00ffe1] rounded-lg p-2">
                <button
                  onClick={() => handleHpChange(stats.currentHp - 5)}
                  className="text-[#00ffe1] hover:text-[#00ff88] px-1"
                  disabled={readOnly}
                >
                  -5
                </button>
                <button
                  onClick={() => setShowCustomHp(!showCustomHp)}
                  className={`${getHpColor(stats.currentHp, stats.hp)} hover:opacity-80`}
                >
                  {stats.currentHp}/{stats.hp}
                </button>
                <button
                  onClick={() => handleHpChange(stats.currentHp + 5)}
                  className="text-[#00ffe1] hover:text-[#00ff88] px-1"
                  disabled={readOnly}
                >
                  +5
                </button>
              </div>
              {showCustomHp && (
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsHpHealing(false)}
                      className={`flex-1 px-2 py-1 rounded-lg transition-colors ${
                        !isHpHealing
                          ? 'bg-red-500 text-white'
                          : 'bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1]'
                      }`}
                    >
                      Dano
                    </button>
                    <button
                      onClick={() => setIsHpHealing(true)}
                      className={`flex-1 px-2 py-1 rounded-lg transition-colors ${
                        isHpHealing
                          ? 'bg-[#00ff88] text-[#1a1a1a]'
                          : 'bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1]'
                      }`}
                    >
                      Cura
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customHpValue}
                      onChange={(e) => setCustomHpValue(e.target.value)}
                      placeholder={isHpHealing ? "Quantidade" : "Dano"}
                      className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-1 text-sm"
                    />
                    <button
                      onClick={handleCustomHpSubmit}
                      className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-2 hover:bg-[#2a2a2a]"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
              <div className="w-full bg-[#1a1a1a] rounded-full h-1 mt-1 border border-[#00ffe1] overflow-hidden">
                <div
                  className={`h-full ${getHpColor(stats.currentHp, stats.hp)} transition-all duration-300`}
                  style={{ width: `${(stats.currentHp / stats.hp) * 100}%`, backgroundColor: 'currentColor' }}
                />
              </div>
            </div>
          </div>

          {/* MP */}
          <div className="flex items-center space-x-4">
            <Sparkles size={20} className="text-[#00ffe1] drop-shadow-[0_0_5px_#00ffe1]" />
            <div className="flex-1">
              <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#00ffe1] rounded-lg p-2">
                <button
                  onClick={() => handleMpChange(stats.currentMp - 5)}
                  className="text-[#00ffe1] hover:text-[#00ff88] px-1"
                  disabled={readOnly}
                >
                  -5
                </button>
                <button
                  onClick={() => setShowCustomMp(!showCustomMp)}
                  className={`${getMpColor(stats.currentMp, stats.mp)} hover:opacity-80`}
                >
                  {stats.currentMp}/{stats.mp}
                </button>
                <button
                  onClick={() => handleMpChange(stats.currentMp + 5)}
                  className="text-[#00ffe1] hover:text-[#00ff88] px-1"
                  disabled={readOnly}
                >
                  +5
                </button>
              </div>
              {showCustomMp && (
                <div className="flex mt-2 gap-2">
                  <input
                    type="number"
                    value={customMpValue}
                    onChange={(e) => setCustomMpValue(e.target.value)}
                    placeholder="Custo"
                    className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-1 text-sm"
                  />
                  <button
                    onClick={handleCustomMpSubmit}
                    className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-2 hover:bg-[#2a2a2a]"
                  >
                    OK
                  </button>
                </div>
              )}
              <div className="w-full bg-[#1a1a1a] rounded-full h-1 mt-1 border border-[#00ffe1] overflow-hidden">
                <div
                  className={`h-full ${getMpColor(stats.currentMp, stats.mp)} transition-all duration-300`}
                  style={{ width: `${(stats.currentMp / stats.mp) * 100}%`, backgroundColor: 'currentColor' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Physical and Magical Damage Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-4">
            <Sword size={20} className="text-[#00ffe1] drop-shadow-[0_0_5px_#00ffe1]" />
            <div className="flex-1">
              <div className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 text-center">
                {stats.physicalDamage}
              </div>
              <div className="text-xs text-[#00ffe1]/70 text-center mt-1">Dano Físico</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Flame size={20} className="text-[#00ffe1] drop-shadow-[0_0_5px_#00ffe1]" />
            <div className="flex-1">
              <div className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 text-center">
                {stats.magicDamage}
              </div>
              <div className="text-xs text-[#00ffe1]/70 text-center mt-1">Dano Mágico</div>
            </div>
          </div>
        </div>

        {/* Combat Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center space-x-4">
            <Sword size={20} className="text-[#00ffe1] drop-shadow-[0_0_5px_#00ffe1]" />
            <div className="flex-1">
              <div className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 text-center">
                {stats.attack}
              </div>
              <div className="text-xs text-[#00ffe1]/70 text-center mt-1">Ataque</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Flame size={20} className="text-[#00ffe1] drop-shadow-[0_0_5px_#00ffe1]" />
            <div className="flex-1">
              <div className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 text-center">
                {stats.magicAttack}
              </div>
              <div className="text-xs text-[#00ffe1]/70 text-center mt-1">Ataque Mágico</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Shield size={20} className="text-[#00ffe1] drop-shadow-[0_0_5px_#00ffe1]" />
            <div className="flex-1">
              <div className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 text-center">
                {stats.defense}
              </div>
              <div className="text-xs text-[#00ffe1]/70 text-center mt-1">Defesa</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Wind size={20} className="text-[#00ffe1] drop-shadow-[0_0_5px_#00ffe1]" />
            <div className="flex-1">
              <div className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 text-center">
                {stats.speed}
              </div>
              <div className="text-xs text-[#00ffe1]/70 text-center mt-1">Velocidade</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};