import React, { useState } from 'react';
import { X, Sword, Shield, Edit2, Power, AlertTriangle, Plus, Minus, Sparkles, Zap, Star, Flame, Crown, Brain } from 'lucide-react';
import { Ability, AttributeBonus, AbilityType, ResourceType, StatType } from '../types/character';
import { Modal } from './Modal';

interface AbilitiesProps {
  abilities: Ability[];
  onAbilitiesChange: (abilities: Ability[]) => void;
  onResourceChange: (type: ResourceType, value: number, abilityName?: string) => Promise<boolean>;
  activeAbilities: string[];
  onToggleAbility: (id: string) => void;
  onAbilityRoll: (ability: string, diceType: number, rolls: number[], total: number, cost: { type: ResourceType; value: number }) => void;
  stats: {
    physicalDamage: number;
    magicDamage: string;
  };
  readOnly?: boolean;
}

const ABILITY_TYPES = {
  attribute_buff: {
    name: 'Habilidade Ativa',
    icon: <Shield className="w-6 h-6 text-green-400" />,
    description: 'Buffs temporários de atributos',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-400/50',
    textColor: 'text-green-400',
    bgColor: 'bg-green-900/20',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]'
  },
  attack_skill: {
    name: 'Habilidade de Ataque',
    icon: <Sword className="w-6 h-6 text-red-400" />,
    description: 'Ataques especiais com multiplicadores',
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-400/50',
    textColor: 'text-red-400',
    bgColor: 'bg-red-900/20',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]'
  },
  passive_skill: {
    name: 'Habilidade Passiva',
    icon: <Power className="w-6 h-6 text-purple-400" />,
    description: 'Efeitos permanentes automáticos',
    color: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-400/50',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    glowColor: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]'
  }
};

const RESOURCE_TYPES = {
  mp: {
    name: 'Mana',
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

const DAMAGE_TYPES = {
  physical: {
    name: 'Físico',
    icon: <Sword className="w-4 h-4" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-400/50'
  },
  magical: {
    name: 'Mágico',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-400/50'
  }
};

const STATS = [
  { key: 'hp', label: 'Vida', icon: '❤️' },
  { key: 'mp', label: 'Mana', icon: '💙' },
  { key: 'physicalDamage', label: 'Dano Físico', icon: '⚔️' },
  { key: 'magicDamage', label: 'Dano Mágico', icon: '🔮' },
  { key: 'attack', label: 'Ataque', icon: '💪' },
  { key: 'magicAttack', label: 'Ataque Mágico', icon: '✨' },
  { key: 'speed', label: 'Velocidade', icon: '💨' },
  { key: 'defense', label: 'Defesa', icon: '🛡️' }
] as const;

const ATTRIBUTES = ['str', 'vit', 'agi', 'int', 'sense'] as const;

export const AbilitiesSection: React.FC<AbilitiesProps> = ({
  abilities,
  onAbilitiesChange,
  onResourceChange,
  activeAbilities,
  onToggleAbility,
  onAbilityRoll,
  stats,
  readOnly = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAbility, setEditingAbility] = useState<string | null>(null);
  const [deletingAbility, setDeletingAbility] = useState<string | null>(null);
  const [attackResults, setAttackResults] = useState<{ id: string; value: number; total: number; timestamp: number }[]>([]);
  const [showDamageAnimation, setShowDamageAnimation] = useState<string | null>(null);

  // Form state
  const [newAbility, setNewAbility] = useState<Partial<Ability>>({
    name: '',
    description: '',
    type: 'attribute_buff',
    cost: {
      type: 'mp',
      mpCost: 10,
      fatigueCost: 5
    },
    bonuses: [],
    attack: {
      value: 1,
      damageType: 'physical'
    },
    modifier: {
      stat: 'physicalDamage',
      value: 10
    },
    statBonuses: {}
  });

  const handleBonusChange = (index: number, field: 'attribute' | 'value', value: string | number) => {
    setNewAbility(prev => ({
      ...prev,
      bonuses: (prev.bonuses || []).map((bonus, i) =>
        i === index
          ? {
              ...bonus,
              [field]: field === 'attribute' ? value : Number(value)
            }
          : bonus
      )
    }));
  };

  const handleStatBonusChange = (stat: keyof Ability['statBonuses'], value: number) => {
    setNewAbility(prev => ({
      ...prev,
      statBonuses: {
        ...prev.statBonuses,
        [stat]: value || undefined
      }
    }));
  };

  const handleAddBonus = () => {
    setNewAbility(prev => ({
      ...prev,
      bonuses: [...(prev.bonuses || []), { attribute: 'str', value: 0 }]
    }));
  };

  const handleRemoveBonus = (index: number) => {
    setNewAbility(prev => ({
      ...prev,
      bonuses: (prev.bonuses || []).filter((_, i) => i !== index)
    }));
  };

  const isValidAbility = () => {
    if (!newAbility.name?.trim()) return false;

    if (newAbility.cost?.type === 'both') {
      if (!newAbility.cost.mpCost || !newAbility.cost.fatigueCost) return false;
    } else if (newAbility.cost?.type !== 'none') {
      if (newAbility.cost?.type === 'mp' && !newAbility.cost.mpCost) return false;
      if (newAbility.cost?.type === 'fatigue' && !newAbility.cost.fatigueCost) return false;
    }

    return true;
  };

  const handleAddAbility = () => {
    if (isValidAbility()) {
      const ability: Ability = {
        id: crypto.randomUUID(),
        name: newAbility.name!.trim(),
        description: newAbility.description?.trim() || '',
        type: newAbility.type as AbilityType,
        cost: newAbility.cost!,
        bonuses: newAbility.bonuses || [],
        statBonuses: Object.keys(newAbility.statBonuses || {}).length > 0 ? newAbility.statBonuses : undefined,
        ...(newAbility.type === 'attack_skill' && {
          attack: newAbility.attack
        })
      };

      // If it's a passive skill, automatically add it to active abilities
      if (ability.type === 'passive_skill' && (ability.bonuses.length > 0 || ability.statBonuses)) {
        onToggleAbility(ability.id);
      }

      onAbilitiesChange([...abilities, ability]);
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewAbility({
      name: '',
      description: '',
      type: 'attribute_buff',
      cost: {
        type: 'mp',
        mpCost: 10,
        fatigueCost: 5
      },
      bonuses: [],
      attack: {
        value: 1,
        damageType: 'physical'
      },
      modifier: {
        stat: 'physicalDamage',
        value: 10
      },
      statBonuses: {}
    });
    setEditingAbility(null);
  };

  const handleRemoveAbility = (id: string) => {
    setDeletingAbility(id);
  };

  const confirmDeleteAbility = (id: string) => {
    const ability = abilities.find(a => a.id === id);
    if (ability?.type === 'passive_skill' && activeAbilities.includes(id)) {
      onToggleAbility(id); // Remove passive bonuses before deleting
    }
    onAbilitiesChange(abilities.filter(ability => ability.id !== id));
    if (editingAbility === id) {
      resetForm();
    }
    setDeletingAbility(null);
  };

  const cancelDeleteAbility = () => {
    setDeletingAbility(null);
  };

  const handleEditAbility = (ability: Ability) => {
    setEditingAbility(ability.id);
    setNewAbility(ability);
    setIsModalOpen(true);
  };

  const handleUpdateAbility = () => {
    if (!editingAbility || !isValidAbility()) return;

    const oldAbility = abilities.find(a => a.id === editingAbility);
    const wasPassive = oldAbility?.type === 'passive_skill';
    const hadBonuses = oldAbility?.bonuses.length > 0 || oldAbility?.statBonuses;

    const updatedAbility: Ability = {
      id: editingAbility,
      name: newAbility.name!.trim(),
      description: newAbility.description?.trim() || '',
      type: newAbility.type as AbilityType,
      cost: newAbility.cost!,
      bonuses: newAbility.bonuses || [],
      statBonuses: Object.keys(newAbility.statBonuses || {}).length > 0 ? newAbility.statBonuses : undefined,
      ...(newAbility.type === 'attack_skill' && {
        attack: newAbility.attack
      })
    };

    // Handle passive skill bonuses
    if (wasPassive && hadBonuses && activeAbilities.includes(editingAbility)) {
      onToggleAbility(editingAbility); // Remove old passive bonuses
    }

    onAbilitiesChange(abilities.map(ability => 
      ability.id === editingAbility ? updatedAbility : ability
    ));

    // If it's a passive skill with bonuses, automatically activate it
    if (updatedAbility.type === 'passive_skill' && 
        (updatedAbility.bonuses.length > 0 || updatedAbility.statBonuses)) {
      onToggleAbility(updatedAbility.id);
    }

    handleCloseModal();
  };

  const handleTypeChange = (type: AbilityType) => {
    setNewAbility(prev => ({
      ...prev,
      type,
      cost: {
        type: type === 'passive_skill' ? 'none' : 'mp',
        mpCost: 10,
        fatigueCost: 5
      }
    }));
  };

  const toggleAbility = async (ability: Ability) => {
    if (!activeAbilities.includes(ability.id)) {
      if (ability.cost.type === 'both') {
        const mpSuccess = await onResourceChange('mp', ability.cost.mpCost || 0, ability.name);
        const fatigueSuccess = await onResourceChange('fatigue', ability.cost.fatigueCost || 0, ability.name);
        if (mpSuccess && fatigueSuccess) {
          onToggleAbility(ability.id);
        }
      } else if (ability.cost.type !== 'none') {
        const success = await onResourceChange(
          ability.cost.type,
          ability.cost.type === 'mp' ? ability.cost.mpCost || 0 : ability.cost.fatigueCost || 0,
          ability.name
        );
        if (success) {
          onToggleAbility(ability.id);
        }
      } else {
        onToggleAbility(ability.id);
      }
    } else {
      onToggleAbility(ability.id);
    }
  };

  const calculateAttackDamage = (ability: Ability) => {
    if (!ability.attack) return 0;
    const baseDamage = ability.attack.damageType === 'physical' 
      ? stats.physicalDamage 
      : parseFloat(stats.magicDamage);
    return Math.floor(baseDamage * ability.attack.value);
  };

  const rollAttack = async (ability: Ability) => {
    if (!ability.attack) return;

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

    const total = calculateAttackDamage(ability);
    
    setAttackResults(prev => [{
      id: ability.id,
      value: ability.attack!.value,
      total,
      timestamp: Date.now()
    }, ...prev].slice(0, 5));

    setShowDamageAnimation(ability.id);
    setTimeout(() => setShowDamageAnimation(null), 1000);

    onAbilityRoll(ability.name, ability.attack.value, [total], total, {
      type: ability.cost.type,
      value: ability.cost.type === 'mp' ? ability.cost.mpCost || 0 : ability.cost.fatigueCost || 0
    });
  };

  const clearAttackResults = () => {
    setAttackResults([]);
  };

  const getAbilityTypeStyle = (type: AbilityType) => {
    return ABILITY_TYPES[type];
  };

  // Função para obter o ícone correto baseado no tipo de dano da habilidade de ataque
  const getAbilityIcon = (ability: Ability) => {
    if (ability.type === 'attack_skill' && ability.attack) {
      return ability.attack.damageType === 'physical' 
        ? <Sword className="w-5 h-5 text-red-400" />
        : <Sparkles className="w-5 h-5 text-blue-400" />;
    }
    return getAbilityTypeStyle(ability.type).icon;
  };

  const formatCost = (cost: { type: ResourceType; mpCost?: number; fatigueCost?: number }) => {
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
        `${ability.attack.value}x ${ability.attack.damageType === 'physical' ? 'Dano Físico' : 'Dano Mágico'}`
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

  const renderAbilityList = (type: AbilityType, title: string) => {
    const items = abilities.filter(ability => ability.type === type);
    const typeStyle = getAbilityTypeStyle(type);
    
    return (
      <div className={`bg-[rgba(0,20,40,0.3)] p-4 rounded-lg border ${typeStyle.borderColor}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg border ${typeStyle.borderColor} bg-gradient-to-br ${typeStyle.color}`}>
            {typeStyle.icon}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${typeStyle.textColor}`}>{title}</h3>
            <p className="text-[#00ffe1]/70 text-xs">{typeStyle.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.length === 0 ? (
            <div className="text-[#00ffe1] opacity-50 text-center py-4 border border-dashed border-[#00ffe1]/20 rounded-lg md:col-span-2">
              <div className="flex flex-col items-center gap-2">
                {typeStyle.icon}
                <span className="text-sm">Nenhuma {title.toLowerCase()} disponível</span>
              </div>
            </div>
          ) : (
            items.map((ability) => {
              const isActive = activeAbilities.includes(ability.id);
              const isEditing = editingAbility === ability.id;
              
              return (
                <div 
                  key={ability.id} 
                  className={`
                    relative overflow-hidden
                    bg-[#1a1a1a] p-3 rounded-lg border transition-all duration-300
                    group
                    ${isEditing 
                      ? 'border-[#00ff88] shadow-[0_0_15px_#00ff88]' 
                      : isActive
                      ? `${typeStyle.borderColor} ${typeStyle.glowColor}`
                      : 'border-[#00ffe1]/30 hover:border-[#00ffe1]/50'
                    }
                    ${showDamageAnimation === ability.id ? 'animate-pulse' : ''}
                  `}
                >
                  {/* Magical Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <div className="relative">
                    <div className="flex items-start gap-3">
                      {/* Ability Icon */}
                      <div className={`p-2 rounded-lg border ${isActive ? typeStyle.borderColor : 'border-[#00ffe1]/30'} bg-gradient-to-br ${isActive ? typeStyle.color : 'from-[#1a1a1a] to-[#2a2a2a]'} transition-all duration-300 flex-shrink-0`}>
                        {getAbilityIcon(ability)}
                      </div>

                      {/* Ability Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h4 className={`font-bold text-sm ${isActive ? typeStyle.textColor : 'text-[#00ffe1]'}`}>
                                {ability.name}
                              </h4>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full border ${typeStyle.borderColor} ${typeStyle.textColor} bg-gradient-to-r ${typeStyle.color}`}>
                                {typeStyle.name}
                              </span>
                            </div>
                            
                            {ability.description && (
                              <p className="text-[#00ffe1]/75 text-xs mb-1 italic line-clamp-1" title={ability.description}>
                                {ability.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-[#00ffe1]/75 mb-1">
                              <span className="flex items-center gap-1">
                                <span>{RESOURCE_TYPES[ability.cost.type].icon}</span>
                                <span>{formatCost(ability.cost)}</span>
                              </span>
                            </div>

                            {formatBonuses(ability) && (
                              <div className="flex items-center gap-1 text-xs">
                                <Star className="w-3 h-3 text-[#00ffe1]" />
                                <span className="text-[#00ffe1]/75 truncate" title={formatBonuses(ability)}>
                                  {formatBonuses(ability)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-1 ml-1">
                            {/* CORREÇÃO: Só mostrar botão de ativar/desativar para habilidades ativas (attribute_buff) */}
                            {ability.type === 'attribute_buff' && !readOnly && (
                              <button
                                onClick={() => toggleAbility(ability)}
                                className={`
                                  p-1 rounded-full text-xs border transition-all duration-300
                                  ${isActive
                                    ? `${typeStyle.bgColor} ${typeStyle.borderColor} ${typeStyle.textColor}`
                                    : 'bg-[#1a1a1a] border-[#00ffe1]/50 text-[#00ffe1] hover:border-[#00ffe1]'
                                  }
                                `}
                                title={isActive ? "Desativar" : "Ativar"}
                              >
                                <Power size={12} />
                              </button>
                            )}
                            
                            {ability.type === 'attack_skill' && !readOnly && (
                              <button
                                onClick={() => rollAttack(ability)}
                                className="p-1 rounded-full text-xs border border-[#00ffe1]/50 text-[#00ffe1] hover:border-[#00ffe1] transition-all"
                                title="Usar Ataque"
                              >
                                {ability.attack?.damageType === 'physical' ? (
                                  <Sword size={12} />
                                ) : (
                                  <Sparkles size={12} />
                                )}
                              </button>
                            )}
                            
                            {!readOnly && (
                              <>
                                <button
                                  onClick={() => handleEditAbility(ability)}
                                  className={`p-1 rounded-full text-xs border transition-all ${
                                    isEditing 
                                      ? 'text-[#00ff88] border-[#00ff88]' 
                                      : 'text-[#00ffe1] border-[#00ffe1]/50 hover:border-[#00ffe1]'
                                  }`}
                                  title="Editar"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleRemoveAbility(ability.id)}
                                  className="p-1 rounded-full text-xs border border-red-400/30 text-red-400 hover:border-red-400 transition-all"
                                  title="Excluir"
                                >
                                  <X size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Attack Results */}
                        {attackResults.find(result => result.id === ability.id) && (
                          <div className="mt-1 p-1.5 bg-[#2a2a2a] rounded text-xs border border-[#00ffe1]/30">
                            <div className="flex items-center justify-between">
                              <div className="text-[#00ffe1]">
                                <span className="opacity-75">Mult:</span>
                                <span className="font-bold ml-1">{attackResults.find(result => result.id === ability.id)?.value}x</span>
                              </div>
                              <div className="text-[#00ff88] font-bold">
                                <span className="opacity-75">Dano:</span>
                                <span className="ml-1">{attackResults.find(result => result.id === ability.id)?.total}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Delete Confirmation */}
                        {deletingAbility === ability.id && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center gap-1 text-red-500 mb-1">
                              <AlertTriangle size={12} />
                              <span className="text-xs">Excluir esta habilidade?</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => confirmDeleteAbility(ability.id)}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              >
                                Sim
                              </button>
                              <button
                                onClick={cancelDeleteAbility}
                                className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                              >
                                Não
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border border-[#00ffe1]/50 bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5">
            <Zap className="w-6 h-6 text-[#00ffe1]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
              Habilidades
            </h2>
            <p className="text-[#00ffe1]/70 text-sm">Poderes e técnicas especiais</p>
          </div>
        </div>
        
        {!readOnly && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            <Plus size={20} />
            <span>Adicionar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {renderAbilityList('attribute_buff', 'Habilidades Ativas')}
        {renderAbilityList('attack_skill', 'Habilidades de Ataque')}
        {renderAbilityList('passive_skill', 'Habilidades Passivas')}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAbility ? 'Editar Habilidade' : 'Criar Nova Habilidade'}
      >
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-2 mb-8">
            <div className="flex items-center justify-center gap-2">
              <Brain className="w-8 h-8 text-[#00ffe1]" />
              <h3 className="text-2xl font-bold text-[#00ffe1]">
                {editingAbility ? 'Modificar Habilidade' : 'Criar Habilidade'}
              </h3>
            </div>
            <p className="text-[#00ffe1]/70">
              {editingAbility ? 'Modifique as propriedades da habilidade' : 'Desenvolva uma nova habilidade mágica'}
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/30 to-transparent mb-8" />

          {/* Basic Information */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#00ffe1] mb-2 font-medium">Nome da Habilidade</label>
                <input
                  type="text"
                  value={newAbility.name}
                  onChange={(e) => setNewAbility(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Rajada de Fogo"
                  className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                />
              </div>

              <div>
                <label className="block text-[#00ffe1] mb-2 font-medium">Descrição</label>
                <textarea
                  value={newAbility.description}
                  onChange={(e) => setNewAbility(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva os efeitos da habilidade"
                  className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                  rows={2}
                />
              </div>
            </div>

            {/* Ability Type Selection */}
            <div>
              <h4 className="text-lg font-medium text-[#00ffe1] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Tipo de Habilidade
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(ABILITY_TYPES).map(([key, type]) => (
                  <button
                    key={key}
                    onClick={() => handleTypeChange(key as AbilityType)}
                    className={`
                      group relative p-6 rounded-xl border-2 transition-all duration-300
                      ${newAbility.type === key
                        ? `bg-gradient-to-br ${type.color} ${type.borderColor} shadow-[0_0_20px_rgba(0,255,225,0.3)]`
                        : 'bg-[#001830] border-[#00ffe1]/30 hover:border-[#00ffe1] hover:bg-[#002040]'
                      }
                    `}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/10 to-[#00ffe1]/0 animate-[shine_2s_ease-in-out_infinite]" />
                    </div>
                    <div className="relative flex flex-col items-center gap-3">
                      {type.icon}
                      <span className="font-bold text-[#00ffe1]">{type.name}</span>
                      <span className="text-sm text-[#00ffe1]/70 text-center">{type.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Configuration */}
            {newAbility.type !== 'passive_skill' && (
              <div>
                <h4 className="text-lg font-medium text-[#00ffe1] mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Custo da Habilidade
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(RESOURCE_TYPES).filter(([key]) => key !== 'none').map(([key, resource]) => (
                      <button
                        key={key}
                        onClick={() => setNewAbility(prev => ({
                          ...prev,
                          cost: {
                            ...prev.cost!,
                            type: key as ResourceType
                          }
                        }))}
                        className={`
                          flex items-center justify-center gap-2 p-3 rounded-lg border transition-all
                          ${newAbility.cost?.type === key
                            ? `${resource.bgColor} ${resource.borderColor} ${resource.color}`
                            : 'bg-[#001830] border-[#00ffe1]/30 text-[#00ffe1] hover:border-[#00ffe1]/50'
                          }
                        `}
                      >
                        <span>{resource.icon}</span>
                        <span className="font-medium">{resource.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(newAbility.cost?.type === 'mp' || newAbility.cost?.type === 'both') && (
                      <div>
                        <label className="block text-[#00ffe1] mb-2 font-medium flex items-center gap-2">
                          💙 Custo de Mana
                        </label>
                        <input
                          type="number"
                          value={newAbility.cost?.mpCost}
                          onChange={(e) => setNewAbility(prev => ({
                            ...prev,
                            cost: {
                              ...prev.cost!,
                              mpCost: Math.max(0, parseInt(e.target.value) || 0)
                            }
                          }))}
                          min="0"
                          className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
                        />
                      </div>
                    )}

                    {(newAbility.cost?.type === 'fatigue' || newAbility.cost?.type === 'both') && (
                      <div>
                        <label className="block text-[#00ffe1] mb-2 font-medium flex items-center gap-2">
                          ⚡ Custo de Fadiga
                        </label>
                        <input
                          type="number"
                          value={newAbility.cost?.fatigueCost}
                          onChange={(e) => setNewAbility(prev => ({
                            ...prev,
                            cost: {
                              ...prev.cost!,
                              fatigueCost: Math.max(0, parseInt(e.target.value) || 0)
                            }
                          }))}
                          min="0"
                          className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Attack Configuration */}
            {newAbility.type === 'attack_skill' && (
              <div>
                <h4 className="text-lg font-medium text-[#00ffe1] mb-4 flex items-center gap-2">
                  <Sword className="w-5 h-5" />
                  Configuração de Ataque
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#00ffe1] mb-2 font-medium">Multiplicador de Dano</label>
                    <input
                      type="number"
                      value={newAbility.attack?.value}
                      onChange={(e) => setNewAbility(prev => ({
                        ...prev,
                        attack: {
                          ...prev.attack!,
                          value: Math.max(0, parseFloat(e.target.value) || 0)
                        }
                      }))}
                      min="0"
                      step="0.1"
                      className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[#00ffe1] mb-2 font-medium">Tipo de Dano</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(DAMAGE_TYPES).map(([key, damage]) => (
                        <button
                          key={key}
                          onClick={() => setNewAbility(prev => ({
                            ...prev,
                            attack: {
                              ...prev.attack!,
                              damageType: key as 'physical' | 'magical'
                            }
                          }))}
                          className={`
                            flex items-center justify-center gap-2 p-3 rounded-lg border transition-all
                            ${newAbility.attack?.damageType === key
                              ? `${damage.bgColor} ${damage.borderColor} ${damage.color}`
                              : 'bg-[#001830] border-[#00ffe1]/30 text-[#00ffe1] hover:border-[#00ffe1]/50'
                            }
                          `}
                        >
                          {damage.icon}
                          <span>{damage.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attribute Bonuses */}
            {(newAbility.type === 'attribute_buff' || newAbility.type === 'passive_skill') && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-[#00ffe1] flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Bônus de Atributos
                  </h4>
                  <button
                    onClick={handleAddBonus}
                    className="group relative px-4 py-2 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_15px_#00ffe1]"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                    </div>
                    <div className="relative flex items-center gap-2 text-[#00ffe1] font-medium">
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </div>
                  </button>
                </div>

                <div className="space-y-3">
                  {(newAbility.bonuses || []).map((bonus, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#001830] rounded-lg border border-[#00ffe1]/30">
                      <select
                        value={bonus.attribute}
                        onChange={(e) => handleBonusChange(index, 'attribute', e.target.value)}
                        className="bg-[#002040] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 focus:border-[#00ff88] transition-all"
                      >
                        {ATTRIBUTES.map(attr => (
                          <option key={attr} value={attr}>{attr.toUpperCase()}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={bonus.value}
                        onChange={(e) => handleBonusChange(index, 'value', parseInt(e.target.value) || 0)}
                        className="w-24 bg-[#002040] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 focus:border-[#00ff88] transition-all"
                      />
                      <button
                        onClick={() => handleRemoveBonus(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Bonuses */}
            {(newAbility.type === 'attribute_buff' || newAbility.type === 'passive_skill') && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-[#00ffe1] flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Bônus de Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {STATS.map(({ key, label, icon }) => (
                    <div key={key} className="space-y-2">
                      <label className="flex items-center gap-2 text-[#00ffe1] text-sm font-medium">
                        <span>{icon}</span>
                        {label}
                      </label>
                      <input
                        type="number"
                        value={newAbility.statBonuses?.[key] || ''}
                        onChange={(e) => handleStatBonusChange(key, parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center pt-6">
              <button
                onClick={editingAbility ? handleUpdateAbility : handleAddAbility}
                disabled={!isValidAbility()}
                className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
                  {editingAbility ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  <span>{editingAbility ? 'ATUALIZAR' : 'CRIAR'} HABILIDADE</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AbilitiesSection;