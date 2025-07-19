import React, { useState } from 'react';
import { Sword, Flame, Shield, Power, X, Trash2, Sparkles, Zap, Star, Crown } from 'lucide-react';
import { Ability, Character, ICharacterStats } from '../types/character';
import { supabase } from '../utils/supabase';

interface CombatSystemProps {
  character: Character;
  stats: ICharacterStats;
  onResourceChange: (type: 'mp' | 'fatigue' | 'both', value: number, abilityName?: string) => Promise<boolean>;
  onToggleAbility: (id: string) => void;
  onAbilityRoll: (ability: string, diceType: number, rolls: number[], total: number, cost: { type: string; value: number }) => void;
}

const ABILITY_TYPES = {
  attribute_buff: {
    name: 'Ativa',
    icon: <Shield className="w-4 h-4 text-green-400" />,
    description: 'Buffs temporários',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-400/50',
    textColor: 'text-green-400',
    bgColor: 'bg-green-900/20',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]'
  },
  attack_skill: {
    name: 'Ataque',
    icon: <Sword className="w-4 h-4 text-red-400" />,
    description: 'Ataques especiais',
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-400/50',
    textColor: 'text-red-400',
    bgColor: 'bg-red-900/20',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]'
  },
  passive_skill: {
    name: 'Passiva',
    icon: <Power className="w-4 h-4 text-purple-400" />,
    description: 'Efeitos permanentes',
    color: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-400/50',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    glowColor: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]'
  }
};

const RESOURCE_TYPES = {
  mp: {
    name: 'MP',
    icon: '💙',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-400/50'
  },
  fatigue: {
    name: 'Fadiga',
    icon: '⚡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-400/50'
  },
  both: {
    name: 'Ambos',
    icon: '🔥',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-400/50'
  },
  none: {
    name: 'Passiva',
    icon: '✨',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-400/50'
  }
};

export const CombatSystem: React.FC<CombatSystemProps> = ({
  character,
  stats,
  onResourceChange,
  onToggleAbility,
  onAbilityRoll
}) => {
  const [selectedAbility, setSelectedAbility] = useState<string>('');
  const [attackResults, setAttackResults] = useState<{ abilityName: string; value: number; total: number; timestamp: number }[]>([]);
  const [showDamageAnimation, setShowDamageAnimation] = useState(false);

  const combatAbilities = character.abilities.filter(
    ability => ability.type === 'attack_skill' || ability.type === 'attribute_buff'
  );

  const selectedAbilityData = character.abilities.find(a => a.id === selectedAbility);

  const calculateAttackDamage = (ability: Ability) => {
    if (!ability.attack) return 0;
    const baseDamage = ability.attack.damageType === 'physical' 
      ? stats.physicalDamage 
      : parseFloat(stats.magicDamage);
    return Math.floor(baseDamage * ability.attack.value);
  };

  const sendAbilityMessage = async (ability: Ability, total?: number, isDeactivation?: boolean) => {
    const sessionId = localStorage.getItem('rpg-session-id');
    if (!sessionId) return;

    let content = '';

    // Header with ability type
    content += `**${ability.type === 'attack_skill' ? '⚔️ HABILIDADE DE ATAQUE' : '🛡️ HABILIDADE ATIVA'}**\n\n`;

    // Ability name and description
    content += `**${ability.name}**`;
    if (ability.description) {
      content += `\n*${ability.description}*`;
    }

    // Attack details for attack skills
    if (ability.type === 'attack_skill' && ability.attack) {
      content += '\n\n**Dano:**';
      content += `\n▸ Base: ${ability.attack.value}x ${ability.attack.damageType === 'physical' ? 'Dano Físico' : 'Dano Mágico'}`;
      if (total !== undefined) {
        content += `\n▸ Total: **${total}**`;
      }
    }

    // Bonuses
    if (ability.bonuses?.length > 0) {
      content += '\n\n**Bônus:**';
      ability.bonuses.forEach(bonus => {
        const sign = bonus.value >= 0 ? '+' : '';
        content += ` ▸ ${bonus.attribute.toUpperCase()} ${sign}${bonus.value}`;
      });
    }

    // Cost
    if (ability.cost.type !== 'none') {
      content += '\n\n**Custo:**';
      if (ability.cost.type === 'both') {
        content += ` ▸ ${ability.cost.mpCost} MP`;
        content += ` ▸ ${ability.cost.fatigueCost} Fadiga`;
      } else {
        const cost = ability.cost.type === 'mp' ? ability.cost.mpCost : ability.cost.fatigueCost;
        content += ` ▸ ${cost} ${ability.cost.type.toUpperCase()}`;
      }
    }

    // Status (Activated/Deactivated)
    content += `\n**Status:** ${isDeactivation ? '❌ Desativada' : '✅ Ativada/Utilizada'}`;

    await supabase.from('messages').insert({
      content,
      sender_name: character.name,
      sender_type: 'player',
      session_id: sessionId
    });
  };

  const handleAbilityAction = async (ability: Ability, actionType: 'activate' | 'attack') => {
    if (!ability) return;

    if (ability.cost.type === 'both') {
      const mpSuccess = await onResourceChange('mp', ability.cost.mpCost || 0, ability.name);
      const fatigueSuccess = await onResourceChange('fatigue', ability.cost.fatigueCost || 0, ability.name);
      if (!mpSuccess || !fatigueSuccess) return;
    } else if (ability.cost.type !== 'none') {
      const success = await onResourceChange(
        ability.cost.type,
        ability.cost.type === 'mp' ? ability.cost.mpCost || 0 : ability.cost.fatigueCost || 0,
        ability.name
      );
      if (!success) return;
    }

    if (actionType === 'attack' && ability.type === 'attack_skill' && ability.attack) {
      const total = calculateAttackDamage(ability);
      
      setAttackResults(prev => [{
        abilityName: ability.name,
        value: ability.attack!.value,
        total,
        timestamp: Date.now()
      }, ...prev].slice(0, 5));

      setShowDamageAnimation(true);
      setTimeout(() => setShowDamageAnimation(false), 1000);

      onAbilityRoll(ability.name, ability.attack.value, [total], total, {
        type: ability.cost.type,
        value: ability.cost.type === 'mp' ? ability.cost.mpCost || 0 : ability.cost.fatigueCost || 0
      });

      await sendAbilityMessage(ability, total);
    } else if (actionType === 'activate' && ability.type === 'attribute_buff') {
      const isDeactivation = character.activeAbilities.includes(ability.id);
      onToggleAbility(ability.id);
      await sendAbilityMessage(ability, undefined, isDeactivation);
    }
  };

  const formatCost = (cost: { type: string; mpCost?: number; fatigueCost?: number }) => {
    if (cost.type === 'none') return 'Passiva';
    if (cost.type === 'both') {
      return `${cost.mpCost} MP + ${cost.fatigueCost} Fadiga`;
    }
    return cost.type === 'mp' ? `${cost.mpCost} MP` : `${cost.fatigueCost} Fadiga`;
  };

  const formatBonuses = (ability: Ability) => {
    const bonusStrings = [];

    if (ability.bonuses.length > 0) {
      bonusStrings.push(
        ability.bonuses.map(bonus => {
          const sign = bonus.value >= 0 ? '+' : '';
          return `${bonus.attribute.toUpperCase()} ${sign}${bonus.value}`;
        }).join(', ')
      );
    }

    if (ability.attack) {
      bonusStrings.push(
        `${ability.attack.value}x ${ability.attack.damageType === 'physical' ? 'Físico' : 'Mágico'}`
      );
    }

    if (ability.statBonuses) {
      const statBonusStrings = Object.entries(ability.statBonuses)
        .filter(([_, value]) => value !== undefined && value !== 0)
        .map(([stat, value]) => {
          const sign = value >= 0 ? '+' : '';
          switch (stat) {
            case 'hp': return `Vida ${sign}${value}`;
            case 'mp': return `Mana ${sign}${value}`;
            case 'physicalDamage': return `Dano Físico ${sign}${value}`;
            case 'magicDamage': return `Dano Mágico ${sign}${value}`;
            case 'attack': return `Ataque ${sign}${value}`;
            case 'magicAttack': return `Ataque Mágico ${sign}${value}`;
            case 'speed': return `Velocidade ${sign}${value}`;
            case 'defense': return `Defesa ${sign}${value}`;
            default: return '';
          }
        })
        .filter(Boolean);

      if (statBonusStrings.length > 0) {
        bonusStrings.push(statBonusStrings.join(', '));
      }
    }

    return bonusStrings.join(' | ');
  };

  const clearAttackResults = () => {
    setAttackResults([]);
  };

  const getAbilityTypeStyle = (type: string) => {
    return ABILITY_TYPES[type as keyof typeof ABILITY_TYPES] || ABILITY_TYPES.attribute_buff;
  };

  // Função para obter o ícone correto baseado no tipo de dano da habilidade de ataque
  const getAbilityIcon = (ability: Ability) => {
    if (ability.type === 'attack_skill' && ability.attack) {
      return ability.attack.damageType === 'physical' 
        ? <Sword className="w-4 h-4 text-red-400" />
        : <Sparkles className="w-4 h-4 text-blue-400" />;
    }
    return getAbilityTypeStyle(ability.type).icon;
  };

  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-4 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg border border-[#00ffe1]/50 bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5">
            <Sword className="w-5 h-5 text-[#00ffe1]" />
          </div>
          <h2 className="text-lg font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
            Sistema de Combate
          </h2>
        </div>
        {attackResults.length > 0 && (
          <button
            onClick={clearAttackResults}
            className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors text-xs"
          >
            <Trash2 size={14} />
            <span>Limpar</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Ability Selection */}
        <select
          value={selectedAbility}
          onChange={(e) => setSelectedAbility(e.target.value)}
          className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 text-sm focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ffe1] transition-all"
        >
          <option value="">Escolha uma habilidade para combate</option>
          <optgroup label="🗡️ Habilidades de Ataque">
            {combatAbilities
              .filter(ability => ability.type === 'attack_skill')
              .map(ability => (
                <option key={ability.id} value={ability.id}>
                  {ability.name} ({ability.attack?.damageType === 'physical' ? 'Físico' : 'Mágico'})
                </option>
              ))}
          </optgroup>
          <optgroup label="🛡️ Habilidades Ativas">
            {combatAbilities
              .filter(ability => ability.type === 'attribute_buff')
              .map(ability => (
                <option key={ability.id} value={ability.id}>
                  {ability.name}
                </option>
              ))}
          </optgroup>
        </select>

        {/* Selected Ability Card - Reorganized Layout */}
        {selectedAbilityData && (
          <div className={`
            bg-[#1a1a1a] p-3 rounded-lg border transition-all duration-300
            ${getAbilityTypeStyle(selectedAbilityData.type).borderColor}
            ${getAbilityTypeStyle(selectedAbilityData.type).glowColor}
          `}>
            {/* Header with Name and Cost */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${getAbilityTypeStyle(selectedAbilityData.type).borderColor} bg-gradient-to-br ${getAbilityTypeStyle(selectedAbilityData.type).color}`}>
                  {getAbilityIcon(selectedAbilityData)}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${getAbilityTypeStyle(selectedAbilityData.type).textColor}`}>
                    {selectedAbilityData.name}
                  </h4>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full border ${getAbilityTypeStyle(selectedAbilityData.type).borderColor} ${getAbilityTypeStyle(selectedAbilityData.type).textColor} bg-gradient-to-r ${getAbilityTypeStyle(selectedAbilityData.type).color} font-bold`}>
                    {getAbilityTypeStyle(selectedAbilityData.type).name}
                  </span>
                </div>
              </div>

              {/* Cost Badge - Moved to top right */}
              <span className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold ${RESOURCE_TYPES[selectedAbilityData.cost.type as keyof typeof RESOURCE_TYPES]?.borderColor} ${RESOURCE_TYPES[selectedAbilityData.cost.type as keyof typeof RESOURCE_TYPES]?.color} bg-gradient-to-r ${RESOURCE_TYPES[selectedAbilityData.cost.type as keyof typeof RESOURCE_TYPES]?.bgColor}`}>
                <span>{RESOURCE_TYPES[selectedAbilityData.cost.type as keyof typeof RESOURCE_TYPES]?.icon}</span>
                <span>{formatCost(selectedAbilityData.cost)}</span>
              </span>
            </div>

            {/* Effects */}
            {formatBonuses(selectedAbilityData) && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                  {formatBonuses(selectedAbilityData).split(' | ').slice(0, 2).map((bonus, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1]/30 rounded-full text-xs"
                    >
                      {bonus}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attack Preview and Action - Side by side */}
            {selectedAbilityData.type === 'attack_skill' && selectedAbilityData.attack && (
              <div className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-lg border border-[#00ffe1]/30">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[#00ffe1]/75">Dano:</span>
                    <span className="text-[#00ffe1] font-medium">
                      {selectedAbilityData.attack.value}x
                    </span>
                    <span className="text-[#00ffe1]/75">×</span>
                    <span className="text-[#00ff88] font-bold">
                      {selectedAbilityData.attack.damageType === 'physical' ? stats.physicalDamage : stats.magicDamage}
                    </span>
                    <span className="text-[#00ffe1]/75">=</span>
                    <span className="text-[#00ff88] font-bold">
                      {calculateAttackDamage(selectedAbilityData)}
                    </span>
                  </div>
                </div>

                {/* Attack Button - Next to damage */}
                <button
                  onClick={() => handleAbilityAction(selectedAbilityData, 'attack')}
                  className="group relative px-3 py-1 bg-[#001830] border border-red-400 rounded-lg overflow-hidden transition-all hover:bg-red-900/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/20 to-red-400/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                  </div>

                  <div className="relative flex items-center justify-center gap-1 text-red-400 font-bold text-xs">
                    {selectedAbilityData.attack.damageType === 'physical' ? (
                      <Sword className="w-3 h-3" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>ATACAR</span>
                  </div>
                </button>
              </div>
            )}

            {/* Activate/Deactivate Button for Buff Skills */}
            {selectedAbilityData.type === 'attribute_buff' && (
              <div className="flex justify-center">
                <button
                  onClick={() => handleAbilityAction(selectedAbilityData, 'activate')}
                  className={`
                    group relative px-4 py-1.5 border rounded-lg overflow-hidden transition-all
                    ${character.activeAbilities.includes(selectedAbilityData.id)
                      ? 'bg-red-900/20 border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-[#001830] border-green-400 hover:bg-green-900/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                    }
                  `}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={`absolute inset-0 bg-gradient-to-r ${character.activeAbilities.includes(selectedAbilityData.id) ? 'from-red-400/0 via-red-400/20 to-red-400/0' : 'from-green-400/0 via-green-400/20 to-green-400/0'} animate-[shine_1.5s_ease-in-out_infinite]`} />
                  </div>

                  <div className={`relative flex items-center justify-center gap-1 font-bold text-xs ${character.activeAbilities.includes(selectedAbilityData.id) ? 'text-red-400' : 'text-green-400'}`}>
                    {character.activeAbilities.includes(selectedAbilityData.id) ? (
                      <>
                        <X className="w-3 h-3" />
                        <span>DESATIVAR</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3" />
                        <span>ATIVAR</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Abilities - Compact */}
        {character.activeAbilities.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-[#00ffe1] flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Habilidades Ativas
            </h3>
            <div className="flex flex-wrap gap-1">
              {character.abilities
                .filter(ability => character.activeAbilities.includes(ability.id))
                .map(ability => {
                  const typeStyle = getAbilityTypeStyle(ability.type);
                  return (
                    <div
                      key={ability.id}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${typeStyle.borderColor} bg-gradient-to-r ${typeStyle.color} ${typeStyle.glowColor}`}
                    >
                      <div className="flex items-center gap-1">
                        {getAbilityIcon(ability)}
                        <span className={`font-medium text-xs ${typeStyle.textColor}`}>{ability.name}</span>
                      </div>
                      <button
                        onClick={() => handleAbilityAction(ability, 'activate')}
                        className={`${typeStyle.textColor} hover:text-red-400 transition-colors`}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Attack Results - Compact */}
        {attackResults.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-[#00ffe1] flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Últimos Ataques
            </h3>
            <div className="space-y-1">
              {attackResults.slice(0, 2).map((result, index) => (
                <div
                  key={result.timestamp}
                  className={`bg-[#1a1a1a] p-1.5 rounded-lg border border-[#00ffe1] transition-all duration-300 ${
                    index === 0 && showDamageAnimation ? 'animate-pulse border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00ffe1] font-medium text-xs">
                        {result.abilityName}
                      </span>
                      <span className="text-[#00ffe1]/75 text-xs">
                        {result.value}x
                      </span>
                      <span className="text-[#00ff88] font-bold text-xs">
                        {result.total}
                      </span>
                    </div>
                    <div className="text-xs text-[#00ffe1]/50">
                      {new Date(result.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};