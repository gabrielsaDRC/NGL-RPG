import React, { useState } from 'react';
import { Sword, Flame, Shield, Power, X, Trash2 } from 'lucide-react';
import { Ability, Character, ICharacterStats } from '../types/character';

interface CombatSystemProps {
  character: Character;
  stats: ICharacterStats;
  onResourceChange: (type: 'mp' | 'fatigue' | 'both', value: number, abilityName?: string) => Promise<boolean>;
  onToggleAbility: (id: string) => void;
  onAbilityRoll: (ability: string, diceType: number, rolls: number[], total: number, cost: { type: string; value: number }) => void;
}

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

  // Filter abilities by type (attack or active)
  const combatAbilities = character.abilities.filter(
    ability => ability.type === 'attack_skill' || ability.type === 'attribute_buff'
  );

  const calculateAttackDamage = (ability: Ability) => {
    if (!ability.attack) return 0;
    const baseDamage = ability.attack.damageType === 'physical' 
      ? stats.physicalDamage 
      : parseFloat(stats.magicDamage);
    return Math.floor(baseDamage * ability.attack.value);
  };

  const handleAbilityAction = async (ability: Ability) => {
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

    if (ability.type === 'attack_skill' && ability.attack) {
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
    } else {
      onToggleAbility(ability.id);
    }
  };

  const getAbilityIcon = (ability: Ability) => {
    if (ability.type === 'attack_skill') {
      return ability.attack?.damageType === 'physical' ? <Sword size={20} /> : <Flame size={20} />;
    }
    return ability.type === 'attribute_buff' ? <Shield size={20} /> : <Power size={20} />;
  };

  const clearAttackResults = () => {
    setAttackResults([]);
  };

  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
          Sistema de Combate
        </h2>
        {attackResults.length > 0 && (
          <button
            onClick={clearAttackResults}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={20} />
            <span>Limpar</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <select
            value={selectedAbility}
            onChange={(e) => setSelectedAbility(e.target.value)}
            className="flex-1 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
          >
            <option value="">Selecione uma habilidade</option>
            <optgroup label="Habilidades de Ataque">
              {combatAbilities
                .filter(ability => ability.type === 'attack_skill')
                .map(ability => (
                  <option key={ability.id} value={ability.id}>
                    {ability.name} ({ability.attack?.damageType === 'physical' ? 'Físico' : 'Mágico'})
                  </option>
                ))}
            </optgroup>
            <optgroup label="Habilidades Ativas">
              {combatAbilities
                .filter(ability => ability.type === 'attribute_buff')
                .map(ability => (
                  <option key={ability.id} value={ability.id}>
                    {ability.name}
                  </option>
                ))}
            </optgroup>
          </select>

          <button
            onClick={() => {
              const ability = character.abilities.find(a => a.id === selectedAbility);
              if (ability) handleAbilityAction(ability);
            }}
            disabled={!selectedAbility}
            className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {selectedAbility && (
              getAbilityIcon(character.abilities.find(a => a.id === selectedAbility)!)
            )}
            <span>Usar Habilidade</span>
          </button>
        </div>

        {/* Active Abilities */}
        {character.activeAbilities.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[#00ffe1] font-medium">Habilidades Ativas</h3>
            <div className="flex flex-wrap gap-2">
              {character.abilities
                .filter(ability => character.activeAbilities.includes(ability.id))
                .map(ability => (
                  <div
                    key={ability.id}
                    className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ff88] rounded-lg px-3 py-1.5 flex items-center gap-2"
                  >
                    {getAbilityIcon(ability)}
                    <span>{ability.name}</span>
                    <button
                      onClick={() => onToggleAbility(ability.id)}
                      className="text-[#00ffe1] hover:text-[#00ff88] ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Attack Results */}
        {attackResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[#00ffe1] font-medium">Últimos Ataques</h3>
            <div className="space-y-2">
              {attackResults.map((result, index) => (
                <div
                  key={result.timestamp}
                  className={`bg-[#1a1a1a] p-3 rounded-lg border border-[#00ffe1] ${
                    index === 0 && showDamageAnimation ? 'animate-pulse' : ''
                  }`}
                >
                  <div className="text-[#00ffe1] font-medium mb-1">
                    {result.abilityName}
                  </div>
                  <div className="text-[#00ffe1] text-sm">
                    Multiplicador: {result.value}x
                  </div>
                  <div className="text-[#00ff88] font-bold">
                    Dano Total: {result.total}
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