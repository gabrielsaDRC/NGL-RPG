import React, { useState } from 'react';
import { X, Sword, Shield, Edit2, Power, AlertTriangle, Plus, Minus } from 'lucide-react';
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

  const getAbilityIcon = (type: AbilityType) => {
    switch (type) {
      case 'attack_skill':
        return <Sword size={20} className="text-[#00ffe1]" />;
      case 'attribute_buff':
      case 'passive_skill':
        return <Shield size={20} className="text-[#00ffe1]" />;
    }
  };

  const getAbilityTypeName = (type: AbilityType) => {
    switch (type) {
      case 'attribute_buff': return 'Habilidade Ativa';
      case 'attack_skill': return 'Habilidade de Ataque';
      case 'passive_skill': return 'Habilidade Passiva';
    }
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
    
    return (
      <div className="bg-[rgba(0,20,40,0.3)] p-4 rounded-lg border border-[#00ffe1]/50">
        <div className="flex items-center gap-2 mb-4">
          {getAbilityIcon(type)}
          <h3 className="text-xl font-bold text-[#00ffe1]">{title}</h3>
        </div>
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-[#00ffe1] opacity-50 text-center py-2">
              Nenhum(a) {title.toLowerCase()} disponível
            </div>
          ) : (
            items.map((ability) => (
              <div 
                key={ability.id} 
                className={`bg-[#1a1a1a] p-3 rounded-lg border transition-all duration-300 ${
                  editingAbility === ability.id 
                    ? 'border-[#00ff88] shadow-[0_0_15px_#00ff88]' 
                    : activeAbilities.includes(ability.id)
                    ? 'border-[#00ff88] shadow-[0_0_10px_#00ff88]'
                    : 'border-[#00ffe1]'
                } ${showDamageAnimation === ability.id ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[#00ffe1] font-semibold">{ability.name}</h3>
                        <span className="text-[#00ffe1] opacity-75 text-sm">
                          ({formatCost(ability.cost)})
                        </span>
                      </div>
                      {ability.description && (
                        <p className="text-[#00ffe1] opacity-75 text-sm italic">
                          {ability.description}
                        </p>
                      )}
                      {(ability.bonuses.length > 0 || ability.attack || ability.statBonuses) && (
                        <p className="text-[#00ffe1] opacity-75 text-sm">
                          {formatBonuses(ability)}
                        </p>
                      )}
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="flex items-center gap-2">
                      {ability.type !== 'passive_skill' && (
                        <button
                          onClick={() => toggleAbility(ability)}
                          className={`${
                            activeAbilities.includes(ability.id)
                              ? 'text-[#00ff88]'
                              : 'text-[#00ffe1] hover:text-[#00ff88]'
                          }`}
                        >
                          <Power size={16} />
                        </button>
                      )}
                      {ability.type === 'attack_skill' && (
                        <button
                          onClick={() => rollAttack(ability)}
                          className="text-[#00ffe1] hover:text-[#00ff88]"
                        >
                          <Sword size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditAbility(ability)}
                        className={`${
                          editingAbility === ability.id 
                            ? 'text-[#00ff88]' 
                            : 'text-[#00ffe1] hover:text-[#00ff88]'
                        }`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveAbility(ability.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {attackResults.find(result => result.id === ability.id) && (
                  <div className="mt-2 p-2 bg-[#2a2a2a] rounded-lg">
                    <div className="text-[#00ffe1] text-sm">
                      Multiplicador: {attackResults.find(result => result.id === ability.id)?.value}x
                    </div>
                    <div className="text-[#00ff88] font-bold text-sm">
                      Dano Total: {attackResults.find(result => result.id === ability.id)?.total}
                    </div>
                  </div>
                )}

                {deletingAbility === ability.id && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                      <AlertTriangle size={16} />
                      <span>Tem certeza que deseja excluir esta habilidade?</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmDeleteAbility(ability.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={cancelDeleteAbility}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
          Habilidades
        </h2>
        {!readOnly && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            <Plus size={20} />
            <span>Adicionar Habilidade</span>
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
        title={editingAbility ? 'Editar Habilidade' : 'Adicionar Habilidade'}
      >
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            value={newAbility.name}
            onChange={(e) => setNewAbility(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome da habilidade"
            className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
          />

          <textarea
            value={newAbility.description}
            onChange={(e) => setNewAbility(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição da habilidade"
            className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            rows={2}
          />

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleTypeChange('attribute_buff')}
              className={`flex items-center justify-center gap-2 p-2 rounded-lg border ${
                newAbility.type === 'attribute_buff'
                  ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1]'
                  : 'bg-[#2a2a2a] text-[#00ffe1] border-[#00ffe1]'
              }`}
            >
              <Shield size={20} />
              Habilidade Ativa
            </button>
            <button
              onClick={() => handleTypeChange('attack_skill')}
              className={`flex items-center justify-center gap-2 p-2 rounded-lg border ${
                newAbility.type === 'attack_skill'
                  ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1]'
                  : 'bg-[#2a2a2a] text-[#00ffe1] border-[#00ffe1]'
              }`}
            >
              <Sword size={20} />
              Habilidade de Ataque
            </button>
            <button
              onClick={() => handleTypeChange('passive_skill')}
              className={`flex items-center justify-center gap-2 p-2 rounded-lg border ${
                newAbility.type === 'passive_skill'
                  ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1]'
                  : 'bg-[#2a2a2a] text-[#00ffe1] border-[#00ffe1]'
              }`}
            >
              <Power size={20} />
              Habilidade Passiva
            </button>
          </div>

          {newAbility.type !== 'passive_skill' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#00ffe1] mb-1">Tipo de Custo</label>
                <select
                  value={newAbility.cost?.type}
                  onChange={(e) => setNewAbility(prev => ({
                    ...prev,
                    cost: {
                      ...prev.cost!,
                      type: e.target.value as ResourceType
                    }
                  }))}
                  className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                >
                  <option value="mp">Mana</option>
                  <option value="fatigue">Fadiga</option>
                  <option value="both">Ambos</option>
                </select>
              </div>

              {(newAbility.cost?.type === 'mp' || newAbility.cost?.type === 'both') && (
                <div>
                  <label className="block text-[#00ffe1] mb-1">Custo de Mana</label>
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
                    className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                  />
                </div>
              )}

              {(newAbility.cost?.type === 'fatigue' || newAbility.cost?.type === 'both') && (
                <div>
                  <label className="block text-[#00ffe1] mb-1">Custo de Fadiga</label>
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
                    className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                  />
                </div>
              )}
            </div>
          )}

          {newAbility.type === 'attack_skill' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#00ffe1] mb-1">Multiplicador de Dano</label>
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
                  className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-[#00ffe1] mb-1">Tipo de Dano</label>
                <select
                  value={newAbility.attack?.damageType}
                  onChange={(e) => setNewAbility(prev => ({
                    ...prev,
                    attack: {
                      ...prev.attack!,
                      damageType: e.target.value as 'physical' | 'magical'
                    }
                  }))}
                  className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                >
                  <option value="physical">Dano Físico</option>
                  <option value="magical">Dano Mágico</option>
                </select>
              </div>
            </div>
          )}

          {(newAbility.type === 'attribute_buff' || newAbility.type === 'passive_skill') && (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[#00ffe1] font-medium">Bônus de Atributos</h3>
                  <button
                    onClick={handleAddBonus}
                    className="flex items-center space-x-2 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-1 hover:bg-[#3a3a3a]"
                  >
                    <Plus size={16} />
                    <span>Adicionar</span>
                  </button>
                </div>

                {(newAbility.bonuses || []).map((bonus, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <select
                      value={bonus.attribute}
                      onChange={(e) => handleBonusChange(index, 'attribute', e.target.value)}
                      className="bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                    >
                      {['str', 'vit', 'agi', 'int', 'sense'].map(attr => (
                        <option key={attr} value={attr}>{attr.toUpperCase()}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={bonus.value}
                      onChange={(e) => handleBonusChange(index, 'value', e.target.value)}
                      className="w-20 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                    />
                    <button
                      onClick={() => handleRemoveBonus(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-[#00ffe1] font-medium">Bônus de Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'hp', label: 'Vida' },
                    { key: 'mp', label: 'Mana' },
                    { key: 'physicalDamage', label: 'Dano Físico' },
                    { key: 'magicDamage', label: 'Dano Mágico' },
                    { key: 'attack', label: 'Ataque' },
                    { key: 'magicAttack', label: 'Ataque Mágico' },
                    { key: 'speed', label: 'Velocidade' },
                    { key: 'defense', label: 'Defesa' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-[#00ffe1] text-sm">{label}:</label>
                      <input
                        type="number"
                        value={newAbility.statBonuses?.[key as keyof Ability['statBonuses']] || ''}
                        onChange={(e) => handleStatBonusChange(key as keyof Ability['statBonuses'], parseInt(e.target.value))}
                        placeholder="0"
                        className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={editingAbility ? handleUpdateAbility : handleAddAbility}
              disabled={!isValidAbility()}
              className="flex items-center space-x-2 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              <span>{editingAbility ? 'Atualizar' : 'Adicionar'} Habilidade</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AbilitiesSection;