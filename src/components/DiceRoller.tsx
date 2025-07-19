import React, { useState } from 'react';
import { Sword, Wind, Crosshair, Brain, Heart, Trash2, Flame, Sparkles, Zap, Star, Crown, Shield } from 'lucide-react';
import { AttributeBonus, Character } from '../types/character';

interface DiceRoll {
  id: string;
  type: 'attack' | 'dodge' | 'initiative' | 'attribute';
  rolls: number[];
  total: number;
  attackType?: 'physical' | 'magical';
  attackValue?: number;
  isCritical: boolean;
  timestamp: number;
}

interface DiceRollerProps {
  onRoll?: (diceType: number, rolls: number[], total: number, context?: string, attributeValue?: number, isCritical?: boolean) => void;
  character: Character;
  stats?: {
    attack: number;
    magicAttack: number;
  };
}

const ROLL_TYPES = {
  attack: {
    physical: {
      name: 'Ataque Físico',
      icon: <Sword className="w-6 h-6" />,
      color: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-400/50',
      textColor: 'text-orange-400',
      glowColor: 'shadow-[0_0_15px_rgba(251,146,60,0.5)]'
    },
    magical: {
      name: 'Ataque Mágico',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-blue-500/20 to-purple-500/20',
      borderColor: 'border-blue-400/50',
      textColor: 'text-blue-400',
      glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'
    }
  },
  dodge: {
    name: 'Esquiva',
    icon: <Wind className="w-6 h-6" />,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-400/50',
    textColor: 'text-green-400',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]'
  },
  initiative: {
    name: 'Iniciativa',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-400/50',
    textColor: 'text-yellow-400',
    glowColor: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]'
  }
};

const ATTRIBUTES = {
  str: { name: 'Força', icon: <Sword className="w-5 h-5" />, color: 'text-red-400' },
  vit: { name: 'Constituição', icon: <Heart className="w-5 h-5" />, color: 'text-pink-400' },
  agi: { name: 'Agilidade', icon: <Wind className="w-5 h-5" />, color: 'text-green-400' },
  int: { name: 'Inteligência', icon: <Brain className="w-5 h-5" />, color: 'text-blue-400' },
  sense: { name: 'Percepção', icon: <Crosshair className="w-5 h-5" />, color: 'text-purple-400' }
};

export const DiceRoller: React.FC<DiceRollerProps> = ({ 
  onRoll,
  character,
  stats
}) => {
  const [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [rolling, setRolling] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<keyof AttributeBonus>('str');

  const rollDice = (type: 'attack' | 'dodge' | 'initiative' | 'attribute') => {
    setRolling(true);
    
    // Roll 2d10
    const roll1 = Math.floor(Math.random() * 10) + 1;
    const roll2 = Math.floor(Math.random() * 10) + 1;
    const rolls = [roll1, roll2];
    const total = roll1 + roll2;
    const isCritical = roll1 === 10 && roll2 === 10;

    let attackType: 'physical' | 'magical' | undefined;
    let attackValue: number | undefined;

    // Calculate the attribute value based on the roll type
    if (type === 'attack') {
      attackType = character.combatPreferences.attackAttribute;
      attackValue = attackType === 'physical' 
        ? (stats?.attack || 0) 
        : (stats?.magicAttack || 0);
    } else if (type === 'dodge' || type === 'initiative') {
      // For dodge and initiative, use the character's agility
      attackValue = character.attributes.agi;
    } else if (type === 'attribute') {
      // For attribute tests, use the selected attribute's value
      attackValue = character.attributes[selectedAttribute];
    }

    const newRoll: DiceRoll = {
      id: crypto.randomUUID(),
      type,
      rolls,
      total,
      attackType,
      attackValue,
      isCritical,
      timestamp: Date.now(),
    };

    setRolls(prev => [newRoll, ...prev].slice(0, 5));
    
    if (onRoll) {
      const context = type === 'attribute' 
        ? `Teste de ${selectedAttribute.toUpperCase()}`
        : type === 'attack'
        ? `${character.combatPreferences.attackAttribute === 'physical' ? 'Ataque Físico' : 'Ataque Mágico'}`
        : `${getRollTypeName(type)}`;
      onRoll(10, rolls, total, context, attackValue, isCritical);
    }
    
    setTimeout(() => setRolling(false), 500);
  };

  const clearRolls = () => {
    setRolls([]);
  };

  const getRollTypeName = (type: 'attack' | 'dodge' | 'initiative' | 'attribute') => {
    switch (type) {
      case 'attack':
        return character.combatPreferences.attackAttribute === 'physical' ? 'Ataque Físico' : 'Ataque Mágico';
      case 'dodge':
        return 'Esquiva';
      case 'initiative':
        return 'Iniciativa';
      case 'attribute':
        return 'Teste de Atributo';
    }
  };

  const getAttackStyle = () => {
    return ROLL_TYPES.attack[character.combatPreferences.attackAttribute];
  };

  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-4 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      {/* Magical Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-12 h-12 border border-[#00ffe1]/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `float ${3 + Math.random() * 4}s infinite ease-in-out ${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg border border-[#00ffe1]/50 bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5">
              <Crown className="w-5 h-5 text-[#00ffe1]" />
            </div>
            <h2 className="text-lg font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
              Rolagem de Dados
            </h2>
          </div>
          {rolls.length > 0 && (
            <button
              onClick={clearRolls}
              className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors text-xs"
            >
              <Trash2 size={14} />
              <span>Limpar</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Main Attack Button */}
          <div className="md:col-span-2">
            <button
              onClick={() => rollDice('attack')}
              disabled={rolling}
              className={`
                group relative w-full p-3 rounded-xl border-2 transition-all duration-300 overflow-hidden
                ${rolling ? 'animate-pulse scale-95' : `bg-gradient-to-br ${getAttackStyle().color} ${getAttackStyle().borderColor} hover:${getAttackStyle().glowColor} hover:scale-105`}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {/* Magical Effect Background */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
              </div>

              <div className="relative flex items-center justify-center gap-3">
                <div className={`p-2 rounded-lg border ${getAttackStyle().borderColor} bg-gradient-to-br ${getAttackStyle().color}`}>
                  {getAttackStyle().icon}
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getAttackStyle().textColor}`}>
                    {getAttackStyle().name}
                  </div>
                  <div className="text-[#00ffe1]/70 text-xs">
                    2d10 + {character.combatPreferences.attackAttribute === 'physical' ? 'Ataque' : 'Ataque Mágico'}
                  </div>
                </div>
              </div>

              {rolling && (
                <div className="absolute inset-0 border-2 border-white/50 rounded-xl animate-ping" />
              )}
            </button>
          </div>

          {/* Secondary Actions */}
          <button
            onClick={() => rollDice('dodge')}
            disabled={rolling}
            className={`
              group relative p-3 rounded-xl border-2 transition-all duration-300 overflow-hidden
              ${rolling ? 'animate-pulse scale-95' : `bg-gradient-to-br ${ROLL_TYPES.dodge.color} ${ROLL_TYPES.dodge.borderColor} hover:${ROLL_TYPES.dodge.glowColor} hover:scale-105`}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex items-center justify-center gap-2">
              <div className={`p-1.5 rounded-lg border ${ROLL_TYPES.dodge.borderColor} bg-gradient-to-br ${ROLL_TYPES.dodge.color}`}>
                {ROLL_TYPES.dodge.icon}
              </div>
              <div className="text-center">
                <div className={`font-bold text-sm ${ROLL_TYPES.dodge.textColor}`}>
                  {ROLL_TYPES.dodge.name}
                </div>
                <div className="text-[#00ffe1]/70 text-xs">
                  2d10 + AGI
                </div>
              </div>
            </div>
          </button>

          {/* Initiative */}
          <button
            onClick={() => rollDice('initiative')}
            disabled={rolling}
            className={`
              group relative p-3 rounded-xl border-2 transition-all duration-300 overflow-hidden
              ${rolling ? 'animate-pulse scale-95' : `bg-gradient-to-br ${ROLL_TYPES.initiative.color} ${ROLL_TYPES.initiative.borderColor} hover:${ROLL_TYPES.initiative.glowColor} hover:scale-105`}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex items-center justify-center gap-2">
              <div className={`p-1.5 rounded-lg border ${ROLL_TYPES.initiative.borderColor} bg-gradient-to-br ${ROLL_TYPES.initiative.color}`}>
                {ROLL_TYPES.initiative.icon}
              </div>
              <div className="text-center">
                <div className={`font-bold text-sm ${ROLL_TYPES.initiative.textColor}`}>
                  {ROLL_TYPES.initiative.name}
                </div>
                <div className="text-[#00ffe1]/70 text-xs">
                  2d10 + AGI
                </div>
              </div>
            </div>
          </button>

          {/* Attribute Test - Full Width */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <select
                value={selectedAttribute}
                onChange={(e) => setSelectedAttribute(e.target.value as keyof AttributeBonus)}
                className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-2 focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ffe1] transition-all text-sm"
              >
                {Object.entries(ATTRIBUTES).map(([key, attr]) => (
                  <option key={key} value={key}>
                    {attr.name} ({key.toUpperCase()})
                  </option>
                ))}
              </select>

              <button
                onClick={() => rollDice('attribute')}
                disabled={rolling}
                className={`
                  group relative flex-1 p-2 rounded-xl border-2 transition-all duration-300 overflow-hidden
                  ${rolling ? 'animate-pulse scale-95' : 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:scale-105'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex items-center justify-center gap-2">
                  <div className="p-1.5 rounded-lg border border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-violet-500/20">
                    {ATTRIBUTES[selectedAttribute].icon}
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm text-purple-400">
                      Testar {ATTRIBUTES[selectedAttribute].name}
                    </div>
                    <div className="text-[#00ffe1]/70 text-xs">
                      2d10 + {selectedAttribute.toUpperCase()}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Roll Results */}
          {rolls.length > 0 && (
            <div className="md:col-span-2 mt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {rolls.slice(0, 4).map(roll => {
                  const finalTotal = roll.total + (roll.attackValue || 0);
                  const criticalTotal = roll.isCritical ? finalTotal * 2 : finalTotal;
                  
                  return (
                    <div
                      key={roll.id}
                      className={`
                        bg-[#1a1a1a] rounded-lg p-3 border-2 transition-all duration-300
                        ${roll.isCritical
                          ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse'
                          : 'border-[#00ffe1]/30'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {roll.type === 'attack' && roll.attackType === 'physical' && <Sword className="w-4 h-4 text-orange-400" />}
                          {roll.type === 'attack' && roll.attackType === 'magical' && <Sparkles className="w-4 h-4 text-blue-400" />}
                          {roll.type === 'dodge' && <Wind className="w-4 h-4 text-green-400" />}
                          {roll.type === 'initiative' && <Zap className="w-4 h-4 text-yellow-400" />}
                          {roll.type === 'attribute' && ATTRIBUTES[selectedAttribute].icon}
                          <span className="text-[#00ffe1] font-medium text-sm">
                            {getRollTypeName(roll.type)}
                          </span>
                        </div>
                        {roll.isCritical && (
                          <span className="text-yellow-500 font-bold animate-pulse flex items-center gap-1 text-xs">
                            <Crown className="w-3 h-3" />
                            CRÍTICO!
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#00ffe1]/75">2d10:</span>
                          <span className="text-[#00ffe1] font-mono">
                            [{roll.rolls.join('] [')}] = {roll.total}
                          </span>
                        </div>
                        
                        {roll.attackValue !== undefined && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#00ffe1]/75">
                              {roll.type === 'attack' 
                                ? `${roll.attackType === 'physical' ? 'Ataque Físico' : 'Ataque Mágico'}`
                                : roll.type === 'dodge' || roll.type === 'initiative'
                                ? 'Agilidade'
                                : ATTRIBUTES[selectedAttribute].name}:
                            </span>
                            <span className="text-[#00ffe1] font-medium">
                              {roll.attackValue}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[#00ff88] font-bold text-sm">
                            Total Final: {finalTotal}
                          </span>
                          {roll.isCritical && (
                            <span className="text-yellow-400 font-bold text-sm">
                              ({criticalTotal} com crítico)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};