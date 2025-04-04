import React, { useState } from 'react';
import { Plus, Minus, X, Edit2, Sword, Shield, Crown, AlertTriangle } from 'lucide-react';
import { Equipment, AttributeBonus, EquipmentType, EquipmentRarity, DamageType } from '../types/character';
import { Modal } from './Modal';

interface EquipmentProps {
  equipment: Equipment[];
  onEquipmentChange: (equipment: Equipment[]) => void;
  readOnly?: boolean;
}

const RARITY_LEVELS: Record<EquipmentRarity, { name: string; value: number }> = {
  mundane: { name: 'Mundana', value: 1 },
  uncommon: { name: 'Incomum', value: 2 },
  rare: { name: 'Rara', value: 3 },
  epic: { name: 'Épica', value: 4 },
  legendary: { name: 'Lendária', value: 5 },
  artifact: { name: 'Artefato', value: 6 }
};

export const EquipmentSection: React.FC<EquipmentProps> = ({ equipment, onEquipmentChange, readOnly = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<Equipment>>({
    name: '',
    type: 'weapon',
    rarity: 'mundane',
    durability: 100,
    maxDurability: 100,
    damageType: 'physical',
    bonuses: [],
    statBonuses: {}
  });

  const attributes: (keyof AttributeBonus)[] = ['str', 'vit', 'agi', 'int', 'sense'];
  const stats = [
    { key: 'hp', label: 'Vida' },
    { key: 'mp', label: 'Mana' },
    { key: 'physicalDamage', label: 'Dano Físico' },
    { key: 'magicDamage', label: 'Dano Mágico' },
    { key: 'attack', label: 'Ataque' },
    { key: 'defense', label: 'Defesa' },
    { key: 'speed', label: 'Velocidade' },
    { key: 'dodge', label: 'Esquiva' }
  ];

  const handleRarityChange = (rarity: EquipmentRarity) => {
    const baseBonus = RARITY_LEVELS[rarity].value * 10;
    setNewItem(prev => ({
      ...prev,
      rarity,
      statBonuses: {
        ...prev.statBonuses,
        ...(prev.type === 'weapon' && { attack: baseBonus }),
        ...(prev.type === 'armor' && { defense: baseBonus })
      }
    }));
  };

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
    if (!newItem.name?.trim()) return;

    const newEquipment: Equipment = {
      id: crypto.randomUUID(),
      name: newItem.name.trim(),
      type: newItem.type as EquipmentType,
      rarity: newItem.rarity as EquipmentRarity,
      durability: newItem.durability || 100,
      maxDurability: newItem.maxDurability || 100,
      damageType: newItem.type === 'weapon' ? newItem.damageType as DamageType : undefined,
      bonuses: newItem.bonuses || [],
      statBonuses: Object.keys(newItem.statBonuses || {}).length > 0 ? newItem.statBonuses : undefined,
      setId: newItem.setId
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
      rarity: newItem.rarity as EquipmentRarity,
      durability: newItem.durability || 100,
      maxDurability: newItem.maxDurability || 100,
      damageType: newItem.type === 'weapon' ? newItem.damageType as DamageType : undefined,
      bonuses: newItem.bonuses || [],
      statBonuses: Object.keys(newItem.statBonuses || {}).length > 0 ? newItem.statBonuses : undefined,
      setId: newItem.setId
    };

    onEquipmentChange(equipment.map(item => 
      item.id === editingEquipment ? updatedEquipment : item
    ));
    handleCloseModal();
  };

  const getEquipmentIcon = (type: EquipmentType) => {
    switch (type) {
      case 'weapon':
        return <Sword size={20} className="text-[#00ffe1]" />;
      case 'armor':
        return <Shield size={20} className="text-[#00ffe1]" />;
      case 'accessory':
        return <Crown size={20} className="text-[#00ffe1]" />;
    }
  };

  const getRarityColor = (rarity: EquipmentRarity) => {
    switch (rarity) {
      case 'mundane': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      case 'artifact': return 'text-red-400';
    }
  };

  const getDurabilityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage <= 25) return 'text-red-500';
    if (percentage <= 50) return 'text-orange-500';
    if (percentage <= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatBonuses = (item: Equipment) => {
    const bonusStrings = [];

    const baseBonus = RARITY_LEVELS[item.rarity].value * 10;
    if (item.type === 'weapon') {
      bonusStrings.push(`Ataque Base: +${baseBonus}`);
    } else if (item.type === 'armor') {
      bonusStrings.push(`Defesa Base: +${baseBonus}`);
    }

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
        .filter(([key]) => key !== (item.type === 'weapon' ? 'attack' : 'defense'))
        .map(([stat, value]) => {
          const statLabel = stats.find(s => s.key === stat)?.label || stat;
          const sign = value >= 0 ? '+' : '';
          return `${statLabel} ${sign}${value}`;
        });
      if (statBonusStrings.length > 0) {
        bonusStrings.push(statBonusStrings.join(', '));
      }
    }

    return bonusStrings.join(' | ');
  };

  const renderEquipmentList = (type: EquipmentType, title: string) => {
    const items = equipment.filter(item => item.type === type);
    
    return (
      <div className="bg-[rgba(20,0,40,0.3)] p-4 rounded-lg border border-[#00ffe1]/50">
        <div className="flex items-center gap-2 mb-4">
          {getEquipmentIcon(type)}
          <h3 className="text-xl font-bold text-[#00ffe1]">{title}</h3>
        </div>
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-[#00ffe1] opacity-50 text-center py-2">
              Nenhum(a) {title.toLowerCase()} equipado(a)
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className={`bg-[#1a1a1a] p-3 rounded-lg border transition-all duration-300 ${
                  editingEquipment === item.id 
                    ? 'border-[#00ff88] shadow-[0_0_15px_#00ff88]' 
                    : 'border-[#00ffe1]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[#00ffe1] font-medium">{item.name}</h3>
                        <span className={`text-sm ${getRarityColor(item.rarity)}`}>
                          ({RARITY_LEVELS[item.rarity].name})
                        </span>
                        {item.type === 'weapon' && (
                          <span className="text-sm text-[#00ffe1] opacity-75">
                            [{item.damageType === 'physical' ? 'Físico' : 'Mágico'}]
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={getDurabilityColor(item.durability, item.maxDurability)}>
                          Durabilidade: {item.durability}/{item.maxDurability}
                        </span>
                        <span className="text-[#00ffe1] opacity-75">{formatBonuses(item)}</span>
                      </div>
                    </div>
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
            ))
          )}
        </div>
      </div>
    );
  };

  const renderEquipmentForm = () => (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#00ffe1] mb-1">Tipo</label>
          <select
            value={newItem.type}
            onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as EquipmentType }))}
            className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
          >
            <option value="weapon">Arma</option>
            <option value="armor">Armadura</option>
            <option value="accessory">Acessório</option>
          </select>
        </div>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#00ffe1] mb-1">Raridade</label>
          <select
            value={newItem.rarity}
            onChange={(e) => handleRarityChange(e.target.value as EquipmentRarity)}
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

      <div className="grid grid-cols-2 gap-4">
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

        {(newItem.bonuses || []).map((bonus, index) => (
          <div key={index} className="flex items-center space-x-4">
            <select
              value={bonus.attribute}
              onChange={(e) => handleBonusChange(index, 'attribute', e.target.value)}
              className="bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            >
              {attributes.map(attr => (
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
          {stats
            .filter(({ key }) => {
              if (newItem.type === 'weapon' && key === 'attack') return false;
              if (newItem.type === 'armor' && key === 'defense') return false;
              return true;
            })
            .map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-[#00ffe1] text-sm">{label}:</label>
                <input
                  type="number"
                  value={newItem.statBonuses?.[key as keyof Equipment['statBonuses']] || ''}
                  onChange={(e) => handleStatBonusChange(key as keyof Equipment['statBonuses'], parseInt(e.target.value))}
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
  );

  return (
    <div className="bg-[rgba(20,0,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex items-center justify-between mb-6">
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
        {renderEquipmentForm()}
      </Modal>
    </div>
  );
};

export default EquipmentSection;