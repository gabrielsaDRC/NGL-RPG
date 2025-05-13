import React, { useState } from 'react';
import { Plus, X, Edit2, AlertTriangle, Sword, Shield, Crown } from 'lucide-react';
import { Equipment, AttributeBonus, EquipmentType, EquipmentRarity, DamageType, EquipmentCategory } from '../types/character';
import { Modal } from './Modal';

interface EquipmentProps {
  equipment: Equipment[];
  onEquipmentChange: (equipment: Equipment[]) => void;
  readOnly?: boolean;
}

const RARITY_LEVELS: Record<EquipmentRarity, { name: string; value: number; color: string }> = {
  mundane: { name: 'Mundana', value: 1, color: 'text-gray-400 border-gray-400/50' },
  uncommon: { name: 'Incomum', value: 2, color: 'text-green-400 border-green-400/50' },
  rare: { name: 'Rara', value: 3, color: 'text-blue-400 border-blue-400/50' },
  epic: { name: 'Épica', value: 4, color: 'text-purple-400 border-purple-400/50' },
  legendary: { name: 'Lendária', value: 5, color: 'text-yellow-400 border-yellow-400/50' },
  artifact: { name: 'Artefato', value: 6, color: 'text-red-400 border-red-400/50' }
};

const EQUIPMENT_CATEGORIES: Record<EquipmentCategory, { name: string; type: EquipmentType }> = {
  ring: { name: 'Anel', type: 'accessory' },
  earring: { name: 'Brinco', type: 'accessory' },
  necklace: { name: 'Colar', type: 'accessory' },
  helmet: { name: 'Capacete', type: 'armor' },
  armor: { name: 'Armadura', type: 'armor' },
  pants: { name: 'Calça', type: 'armor' },
  boots: { name: 'Botas', type: 'armor' },
  cape: { name: 'Capa', type: 'armor' },
  gloves: { name: 'Luvas', type: 'armor' },
  bracelet: { name: 'Bracelete', type: 'accessory' },
  weapon: { name: 'Arma', type: 'weapon' },
  shield: { name: 'Escudo', type: 'weapon' }
};

const ATTRIBUTES: (keyof AttributeBonus)[] = ['str', 'vit', 'agi', 'int', 'sense'];

const STATS = [
  { key: 'hp', label: 'Vida' },
  { key: 'mp', label: 'Mana' },
  { key: 'physicalDamage', label: 'Dano Físico' },
  { key: 'magicDamage', label: 'Dano Mágico' },
  { key: 'attack', label: 'Ataque' },
  { key: 'magicAttack', label: 'Ataque Mágico' },
  { key: 'speed', label: 'Velocidade' },
  { key: 'defense', label: 'Defesa' }
] as const;

export const EquipmentSection: React.FC<EquipmentProps> = ({
  equipment,
  onEquipmentChange,
  readOnly = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<Equipment>>({
    name: '',
    type: 'weapon',
    category: 'weapon',
    rarity: 'mundane',
    durability: 100,
    maxDurability: 100,
    damageType: 'physical',
    bonuses: [],
    statBonuses: {}
  });

  const handleAddBonus = () => {
    setNewItem(prev => ({
      ...prev,
      bonuses: [...(prev.bonuses || []), { attribute: 'str', value: 0 }]
    }));
  };

  const handleRemoveBonus = (index: number) => {
    setNewItem(prev => ({
      ...prev,
      bonuses: (prev.bonuses || []).filter((_, i) => i !== index)
    }));
  };

  const handleBonusChange = (index: number, field: 'attribute' | 'value', value: string | number) => {
    setNewItem(prev => ({
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

  const handleStatBonusChange = (stat: keyof Equipment['statBonuses'], value: number) => {
    setNewItem(prev => ({
      ...prev,
      statBonuses: {
        ...prev.statBonuses,
        [stat]: value || undefined
      }
    }));
  };

  const handleAddEquipment = () => {
    if (!newItem.name?.trim() || !newItem.category) return;

    const newEquipment: Equipment = {
      id: crypto.randomUUID(),
      name: newItem.name.trim(),
      type: newItem.type as EquipmentType,
      category: newItem.category as EquipmentCategory,
      rarity: newItem.rarity as EquipmentRarity,
      durability: newItem.durability || 100,
      maxDurability: newItem.maxDurability || 100,
      damageType: newItem.type === 'weapon' ? newItem.damageType as DamageType : undefined,
      bonuses: newItem.bonuses || [],
      statBonuses: Object.keys(newItem.statBonuses || {}).length > 0 ? newItem.statBonuses : undefined
    };

    onEquipmentChange([...equipment, newEquipment]);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      type: 'weapon',
      category: 'weapon',
      rarity: 'mundane',
      durability: 100,
      maxDurability: 100,
      damageType: 'physical',
      bonuses: [],
      statBonuses: {}
    });
    setEditingEquipment(null);
  };

  const handleRemoveEquipment = (id: string) => {
    setDeletingEquipment(id);
  };

  const confirmDeleteEquipment = (id: string) => {
    onEquipmentChange(equipment.filter(item => item.id !== id));
    if (editingEquipment === id) {
      resetForm();
    }
    setDeletingEquipment(null);
  };

  const cancelDeleteEquipment = () => {
    setDeletingEquipment(null);
  };

  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item.id);
    setNewItem(item);
    setIsModalOpen(true);
  };

  const handleUpdateEquipment = () => {
    if (!editingEquipment || !newItem.name?.trim()) return;

    const updatedEquipment: Equipment = {
      id: editingEquipment,
      name: newItem.name.trim(),
      type: newItem.type as EquipmentType,
      category: newItem.category as EquipmentCategory,
      rarity: newItem.rarity as EquipmentRarity,
      durability: newItem.durability || 100,
      maxDurability: newItem.maxDurability || 100,
      damageType: newItem.type === 'weapon' ? newItem.damageType as DamageType : undefined,
      bonuses: newItem.bonuses || [],
      statBonuses: Object.keys(newItem.statBonuses || {}).length > 0 ? newItem.statBonuses : undefined,
      slot: equipment.find(e => e.id === editingEquipment)?.slot
    };

    onEquipmentChange(equipment.map(item => 
      item.id === editingEquipment ? updatedEquipment : item
    ));
    handleCloseModal();
  };

  const formatBonuses = (item: Equipment) => {
    const bonusStrings = [];

    if (item.bonuses.length > 0) {
      bonusStrings.push(
        item.bonuses.map(bonus => {
          const sign = bonus.value >= 0 ? '+' : '';
          return `${bonus.attribute.toUpperCase()} ${sign}${bonus.value}`;
        }).join(', ')
      );
    }

    if (item.statBonuses) {
      const statBonusStrings = Object.entries(item.statBonuses)
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

  const renderEquipmentList = (type: EquipmentType, title: string) => {
    const items = equipment.filter(item => item.type === type);
    
    return (
      <div className="bg-[rgba(0,20,40,0.3)] p-4 rounded-lg border border-[#00ffe1]/50">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-[#00ffe1]">{title}</h3>
        </div>
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-[#00ffe1] opacity-50 text-center py-2">
              Nenhum(a) {title.toLowerCase()} disponível
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className={`
                  relative overflow-hidden
                  bg-[#1a1a1a] p-3 rounded-lg border
                  transition-all duration-300
                  group
                  ${item.slot ? 'border-[#00ff88] shadow-[0_0_10px_#00ff88]' : RARITY_LEVELS[item.rarity].color}
                `}
              >
                {/* Magical Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${RARITY_LEVELS[item.rarity].color}`}>
                        {item.name}
                      </h3>
                      <span className="text-sm text-[#00ffe1] opacity-75">
                        ({EQUIPMENT_CATEGORIES[item.category].name})
                      </span>
                      {item.type === 'weapon' && item.damageType && (
                        <span className={`text-sm ${item.damageType === 'physical' ? 'text-orange-400' : 'text-blue-400'}`}>
                          [{item.damageType === 'physical' ? 'Físico' : 'Mágico'}]
                        </span>
                      )}
                      {item.slot && (
                        <span className="text-[#00ff88] text-sm">
                          (Equipado)
                        </span>
                      )}
                    </div>
                    {!readOnly && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEquipment(item)}
                          className={`${
                            editingEquipment === item.id 
                              ? 'text-[#00ff88]' 
                              : 'text-[#00ffe1] hover:text-[#00ff88]'
                          }`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveEquipment(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-[#00ffe1] opacity-75">Durabilidade: </span>
                      <span className={`font-medium ${
                        (item.durability / item.maxDurability) > 0.5
                          ? 'text-[#00ff88]'
                          : (item.durability / item.maxDurability) > 0.25
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {item.durability}/{item.maxDurability}
                      </span>
                    </div>
                    <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          (item.durability / item.maxDurability) > 0.5
                            ? 'bg-[#00ff88]'
                            : (item.durability / item.maxDurability) > 0.25
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                        }`}
                        style={{ width: `${(item.durability / item.maxDurability) * 100}%` }}
                      />
                    </div>
                  </div>

                  {formatBonuses(item) && (
                    <p className="mt-1 text-sm text-[#00ffe1] opacity-75">
                      {formatBonuses(item)}
                    </p>
                  )}

                  {deletingEquipment === item.id && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertTriangle size={16} />
                        <span>Tem certeza que deseja excluir este equipamento?</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmDeleteEquipment(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={cancelDeleteEquipment}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
          Equipamentos
        </h2>
        {!readOnly && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            <Plus size={20} />
            <span>Adicionar Equipamento</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-6">
          {renderEquipmentList('weapon', 'Armas')}
          {renderEquipmentList('armor', 'Armaduras')}
          {renderEquipmentList('accessory', 'Acessórios')}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingEquipment ? 'Editar Equipamento' : 'Adicionar Equipamento'}
        >
          <div className="grid grid-cols-1 gap-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#00ffe1]">Informações Básicas</h3>
              
              {/* Equipment Type Selection */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setNewItem(prev => ({ ...prev, type: 'weapon', category: 'weapon' }))}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border transition-all
                    ${newItem.type === 'weapon'
                      ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1]'
                      : 'bg-[#1a1a1a] text-[#00ffe1] border-[#00ffe1] hover:bg-[#2a2a2a]'
                    }
                  `}
                >
                  <Sword size={24} />
                  <span className="text-sm font-medium">Arma</span>
                </button>
                <button
                  onClick={() => setNewItem(prev => ({ ...prev, type: 'armor', category: 'armor' }))}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border transition-all
                    ${newItem.type === 'armor'
                      ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1]'
                      : 'bg-[#1a1a1a] text-[#00ffe1] border-[#00ffe1] hover:bg-[#2a2a2a]'
                    }
                  `}
                >
                  <Shield size={24} />
                  <span className="text-sm font-medium">Armadura</span>
                </button>
                <button
                  onClick={() => setNewItem(prev => ({ ...prev, type: 'accessory', category: 'ring' }))}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border transition-all
                    ${newItem.type === 'accessory'
                      ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1]'
                      : 'bg-[#1a1a1a] text-[#00ffe1] border-[#00ffe1] hover:bg-[#2a2a2a]'
                    }
                  `}
                >
                  <Crown size={24} />
                  <span className="text-sm font-medium">Acessório</span>
                </button>
              </div>
  
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#00ffe1] mb-1">Nome</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do equipamento"
                    className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                  />
                </div>
  
                <div>
                  <label className="block text-[#00ffe1] mb-1">Categoria</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as EquipmentCategory }))}
                    className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                  >
                    {Object.entries(EQUIPMENT_CATEGORIES)
                      .filter(([_, { type }]) => type === newItem.type)
                      .map(([key, { name }]) => (
                        <option key={key} value={key}>{name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
  
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#00ffe1] mb-1">Raridade</label>
                  <select
                    value={newItem.rarity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, rarity: e.target.value as EquipmentRarity }))}
                    className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                  >
                    {Object.entries(RARITY_LEVELS).map(([key, { name }]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
  
                {newItem.type === 'weapon' && (
                  <div>
                    <label className="block text-[#00ffe1] mb-1">Tipo de Dano</label>
                    <select
                      value={newItem.damageType}
                      onChange={(e) => setNewItem(prev => ({ ...prev, damageType: e.target.value as DamageType }))}
                      className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                    >
                      <option value="physical">Físico</option>
                      <option value="magical">Mágico</option>
                    </select>
                  </div>
                )}
              </div>
  
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#00ffe1] mb-1">Durabilidade</label>
                  <input
                    type="number"
                    value={newItem.durability}
                    onChange={(e) => setNewItem(prev => ({ ...prev, durability: Math.max(0, parseInt(e.target.value) || 0) }))}
                    min="0"
                    max={newItem.maxDurability}
                    className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-[#00ffe1] mb-1">Durabilidade Máxima</label>
                  <input
                    type="number"
                    value={newItem.maxDurability}
                    onChange={(e) => setNewItem(prev => ({ ...prev, maxDurability: Math.max(0, parseInt(e.target.value) || 0) }))}
                    min="0"
                    className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                  />
                </div>
              </div>
            </div>
  
            {/* Attribute Bonuses Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-[#00ffe1]">Bônus de Atributos</h3>
                <button
                  onClick={handleAddBonus}
                  className="flex items-center gap-2 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-1 hover:bg-[#3a3a3a]"
                >
                  <Plus size={16} />
                  <span>Adicionar</span>
                </button>
              </div>
  
              <div className="space-y-2">
                {(newItem.bonuses || []).map((bonus, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={bonus.attribute}
                      onChange={(e) => handleBonusChange(index, 'attribute', e.target.value)}
                      className="bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                    >
                      {ATTRIBUTES.map(attr => (
                        <option key={attr} value={attr}>{attr.toUpperCase()}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={bonus.value}
                      onChange={(e) => handleBonusChange(index, 'value', parseInt(e.target.value) || 0)}
                      className="w-24 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                    />
                    <button
                      onClick={() => handleRemoveBonus(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Status Bonuses Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#00ffe1]">Bônus de Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {STATS.map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-[#00ffe1] text-sm">{label}:</label>
                    <input
                      type="number"
                      value={newItem.statBonuses?.[key] || ''}
                      onChange={(e) => handleStatBonusChange(key, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
                    />
                  </div>
                ))}
              </div>
            </div>
  
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={editingEquipment ? handleUpdateEquipment : handleAddEquipment}
                disabled={!newItem.name?.trim()}
                className="flex items-center space-x-2 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                <span>{editingEquipment ? 'Atualizar' : 'Adicionar'} Equipamento</span>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}