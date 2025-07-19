import React, { useState } from 'react';
import { Plus, X, Edit2, AlertTriangle, Sword, Shield, Crown, Sparkles, Zap, Star } from 'lucide-react';
import { Equipment, AttributeBonus, EquipmentType, EquipmentRarity, DamageType, EquipmentCategory } from '../types/character';
import { Modal } from './Modal';

interface EquipmentProps {
  equipment: Equipment[];
  onEquipmentChange: (equipment: Equipment[]) => void;
  readOnly?: boolean;
}

const RARITY_LEVELS: Record<EquipmentRarity, { name: string; value: number; color: string; bgColor: string; borderColor: string; icon: JSX.Element }> = {
  mundane: { 
    name: 'Mundana', 
    value: 1, 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-900/20',
    borderColor: 'border-gray-400/50',
    icon: <div className="w-4 h-4 bg-gray-400 rounded-full" />
  },
  uncommon: { 
    name: 'Incomum', 
    value: 2, 
    color: 'text-green-400', 
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-400/50',
    icon: <Sparkles className="w-4 h-4 text-green-400" />
  },
  rare: { 
    name: 'Rara', 
    value: 3, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-400/50',
    icon: <Zap className="w-4 h-4 text-blue-400" />
  },
  epic: { 
    name: 'Épica', 
    value: 4, 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-400/50',
    icon: <Star className="w-4 h-4 text-purple-400" />
  },
  legendary: { 
    name: 'Lendária', 
    value: 5, 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-400/50',
    icon: <Crown className="w-4 h-4 text-yellow-400" />
  },
  artifact: { 
    name: 'Artefato', 
    value: 6, 
    color: 'text-red-400', 
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-400/50',
    icon: <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-orange-400 rounded-full animate-pulse" />
  }
};

const EQUIPMENT_CATEGORIES: Record<EquipmentCategory, { name: string; type: EquipmentType; icon: JSX.Element }> = {
  ring: { name: 'Anel', type: 'accessory', icon: <div className="w-6 h-6 border-2 border-[#00ffe1] rounded-full" /> },
  earring: { name: 'Brinco', type: 'accessory', icon: <div className="w-6 h-6 border-2 border-[#00ffe1] rounded-full relative"><div className="absolute top-0 left-1/2 w-1 h-2 bg-[#00ffe1] transform -translate-x-1/2 -translate-y-1" /></div> },
  necklace: { name: 'Colar', type: 'accessory', icon: <div className="w-6 h-6 border border-[#00ffe1] rounded-full relative"><div className="absolute -top-1 left-1/2 w-3 h-1 bg-[#00ffe1] transform -translate-x-1/2" /></div> },
  helmet: { name: 'Capacete', type: 'armor', icon: <Shield size={24} className="text-[#00ffe1]" /> },
  armor: { name: 'Armadura', type: 'armor', icon: <Shield size={24} className="text-[#00ffe1]" /> },
  pants: { name: 'Calça', type: 'armor', icon: <Shield size={24} className="text-[#00ffe1]" /> },
  boots: { name: 'Botas', type: 'armor', icon: <Shield size={24} className="text-[#00ffe1]" /> },
  cape: { name: 'Capa', type: 'armor', icon: <Shield size={24} className="text-[#00ffe1]" /> },
  gloves: { name: 'Luvas', type: 'armor', icon: <Shield size={24} className="text-[#00ffe1]" /> },
  bracelet: { name: 'Bracelete', type: 'accessory', icon: <div className="w-6 h-4 border-2 border-[#00ffe1] rounded-full" /> },
  weapon: { name: 'Arma', type: 'weapon', icon: <Sword size={24} className="text-[#00ffe1]" /> },
  shield: { name: 'Escudo', type: 'weapon', icon: <Shield size={24} className="text-[#00ffe1]" /> }
};

const ATTRIBUTES: (keyof AttributeBonus)[] = ['str', 'vit', 'agi', 'int', 'sense'];

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

  const isValidEquipment = () => {
    if (!newItem.name?.trim()) return false;

    if (!newItem.durability || !newItem.maxDurability) return false;
    if (newItem.durability < 0 || newItem.maxDurability < 0) return false;
    if (newItem.durability > newItem.maxDurability) return false;

    return true;
  };

  const handleAddEquipment = () => {
    if (isValidEquipment()) {
      const newEquipment: Equipment = {
        id: crypto.randomUUID(),
        name: newItem.name!.trim(),
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
    }
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
    if (!editingEquipment || !isValidEquipment()) return;

    const updatedEquipment: Equipment = {
      id: editingEquipment,
      name: newItem.name!.trim(),
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.length === 0 ? (
            <div className="text-[#00ffe1] opacity-50 text-center py-2 md:col-span-2">
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
                  ${item.slot ? 'border-[#00ff88] shadow-[0_0_10px_#00ff88]' : RARITY_LEVELS[item.rarity].borderColor}
                `}
              >
                {/* Magical Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${RARITY_LEVELS[item.rarity].bgColor} ${RARITY_LEVELS[item.rarity].borderColor} border flex-shrink-0`}>
                        {RARITY_LEVELS[item.rarity].icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className={`font-medium text-sm ${RARITY_LEVELS[item.rarity].color}`}>
                            {item.name}
                          </h3>
                          <span className="text-xs text-[#00ffe1] opacity-75">
                            ({EQUIPMENT_CATEGORIES[item.category].name})
                          </span>
                        </div>
                        {item.type === 'weapon' && item.damageType && (
                          <span className={`text-xs ${item.damageType === 'physical' ? 'text-orange-400' : 'text-blue-400'}`}>
                            [{item.damageType === 'physical' ? 'Físico' : 'Mágico'}]
                          </span>
                        )}
                        {item.slot && (
                          <span className="text-[#00ff88] text-xs">
                            (Equipado)
                          </span>
                        )}
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex gap-1">
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

                  <div className="mt-1 flex items-center gap-2">
                    <div className="text-xs">
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
                    <p className="mt-1 text-xs text-[#00ffe1] opacity-75 truncate" title={formatBonuses(item)}>
                      {formatBonuses(item)}
                    </p>
                  )}

                  {deletingEquipment === item.id && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertTriangle size={14} />
                        <span className="text-xs">Excluir este equipamento?</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmDeleteEquipment(item.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={cancelDeleteEquipment}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
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
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border border-[#00ffe1]/50 bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5">
            <Shield className="w-6 h-6 text-[#00ffe1]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
              Equipamentos
            </h2>
            <p className="text-[#00ffe1]/70 text-sm">Armas, armaduras e acessórios</p>
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

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6">
          {renderEquipmentList('weapon', 'Armas')}
          {renderEquipmentList('armor', 'Armaduras')}
          {renderEquipmentList('accessory', 'Acessórios')}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingEquipment ? 'Editar Equipamento' : 'Forjar Novo Equipamento'}
        >
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-2 mb-8">
              <div className="flex items-center justify-center gap-2">
                {newItem.type === 'weapon' && <Sword className="w-8 h-8 text-[#00ffe1]" />}
                {newItem.type === 'armor' && <Shield className="w-8 h-8 text-[#00ffe1]" />}
                {newItem.type === 'accessory' && <Crown className="w-8 h-8 text-[#00ffe1]" />}
                <h3 className="text-2xl font-bold text-[#00ffe1]">
                  {editingEquipment ? 'Modificar Equipamento' : 'Forjar Equipamento'}
                </h3>
              </div>
              <p className="text-[#00ffe1]/70">
                {editingEquipment ? 'Modifique as propriedades do equipamento' : 'Crie um novo equipamento mágico'}
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/30 to-transparent mb-8" />

            {/* Equipment Type Selection */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-[#00ffe1] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Tipo de Equipamento
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      setNewItem(prev => ({ 
                        ...prev, 
                        type: 'weapon', 
                        category: 'weapon',
                        damageType: prev.damageType || 'physical'
                      }));
                    }}
                    className={`
                      group relative p-6 rounded-xl border-2 transition-all duration-300
                      ${newItem.type === 'weapon'
                        ? 'bg-[#00ffe1]/10 border-[#00ffe1] shadow-[0_0_20px_#00ffe1]'
                        : 'bg-[#001830] border-[#00ffe1]/30 hover:border-[#00ffe1] hover:bg-[#002040]'
                      }
                    `}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/10 to-[#00ffe1]/0 animate-[shine_2s_ease-in-out_infinite]" />
                    </div>
                    <div className="relative flex flex-col items-center gap-3">
                      <Sword className="w-8 h-8 text-[#00ffe1]" />
                      <span className="font-bold text-[#00ffe1]">ARMA</span>
                      <span className="text-sm text-[#00ffe1]/70 text-center">Espadas, machados, varinhas</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setNewItem(prev => ({ 
                        ...prev, 
                        type: 'armor', 
                        category: 'armor',
                        damageType: undefined
                      }));
                    }}
                    className={`
                      group relative p-6 rounded-xl border-2 transition-all duration-300
                      ${newItem.type === 'armor'
                        ? 'bg-[#00ffe1]/10 border-[#00ffe1] shadow-[0_0_20px_#00ffe1]'
                        : 'bg-[#001830] border-[#00ffe1]/30 hover:border-[#00ffe1] hover:bg-[#002040]'
                      }
                    `}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/10 to-[#00ffe1]/0 animate-[shine_2s_ease-in-out_infinite]" />
                    </div>
                    <div className="relative flex flex-col items-center gap-3">
                      <Shield className="w-8 h-8 text-[#00ffe1]" />
                      <span className="font-bold text-[#00ffe1]">ARMADURA</span>
                      <span className="text-sm text-[#00ffe1]/70 text-center">Capacetes, peitorais, botas</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setNewItem(prev => ({ 
                        ...prev, 
                        type: 'accessory', 
                        category: 'ring',
                        damageType: undefined
                      }));
                    }}
                    className={`
                      group relative p-6 rounded-xl border-2 transition-all duration-300
                      ${newItem.type === 'accessory'
                        ? 'bg-[#00ffe1]/10 border-[#00ffe1] shadow-[0_0_20px_#00ffe1]'
                        : 'bg-[#001830] border-[#00ffe1]/30 hover:border-[#00ffe1] hover:bg-[#002040]'
                      }
                    `}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/10 to-[#00ffe1]/0 animate-[shine_2s_ease-in-out_infinite]" />
                    </div>
                    <div className="relative flex flex-col items-center gap-3">
                      <Crown className="w-8 h-8 text-[#00ffe1]" />
                      <span className="font-bold text-[#00ffe1]">ACESSÓRIO</span>
                      <span className="text-sm text-[#00ffe1]/70 text-center">Anéis, colares, brincos</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#00ffe1] mb-2 font-medium">Nome do Equipamento</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Espada Flamejante"
                      className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[#00ffe1] mb-2 font-medium">Categoria</label>
                    <div className="relative">
                      <select
                        value={newItem.category}
                        onChange={(e) => {
                          const newCategory = e.target.value as EquipmentCategory;
                          setNewItem(prev => ({ 
                            ...prev, 
                            category: newCategory,
                            // Reset damage type if switching to non-weapon
                            ...(EQUIPMENT_CATEGORIES[newCategory].type !== 'weapon' && { damageType: undefined })
                          }));
                        }}
                        className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all appearance-none"
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
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[#00ffe1] mb-2 font-medium">Raridade</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(RARITY_LEVELS).map(([key, rarity]) => (
                        <button
                          key={key}
                          onClick={() => setNewItem(prev => ({ ...prev, rarity: key as EquipmentRarity }))}
                          className={`
                            flex items-center gap-2 p-3 rounded-lg border transition-all
                            ${newItem.rarity === key
                              ? `${rarity.bgColor} ${rarity.borderColor} shadow-lg`
                              : 'bg-[#001830] border-[#00ffe1]/30 hover:border-[#00ffe1]/50'
                            }
                          `}
                        >
                          {rarity.icon}
                          <span className={newItem.rarity === key ? rarity.color : 'text-[#00ffe1]'}>
                            {rarity.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {newItem.type === 'weapon' && (
                    <div>
                      <label className="block text-[#00ffe1] mb-2 font-medium">Tipo de Dano</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setNewItem(prev => ({ 
                            ...prev, 
                            damageType: 'physical' 
                          }))}
                          className={`
                            flex items-center justify-center gap-2 p-3 rounded-lg border transition-all
                            ${newItem.damageType === 'physical'
                              ? 'bg-orange-900/20 border-orange-400 text-orange-400'
                              : 'bg-[#001830] border-[#00ffe1]/30 text-[#00ffe1] hover:border-[#00ffe1]/50'
                            }
                          `}
                        >
                          <Sword className="w-4 h-4" />
                          Físico
                        </button>
                        <button
                          onClick={() => setNewItem(prev => ({ 
                            ...prev, 
                            damageType: 'magical' 
                          }))}
                          className={`
                            flex items-center justify-center gap-2 p-3 rounded-lg border transition-all
                            ${newItem.damageType === 'magical'
                              ? 'bg-blue-900/20 border-blue-400 text-blue-400'
                              : 'bg-[#001830] border-[#00ffe1]/30 text-[#00ffe1] hover:border-[#00ffe1]/50'
                            }
                          `}
                        >
                          <Sparkles className="w-4 h-4" />
                          Mágico
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Durability */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#00ffe1] mb-2 font-medium">Durabilidade Atual</label>
                  <input
                    type="number"
                    value={newItem.durability}
                    onChange={(e) => setNewItem(prev => ({ ...prev, durability: Math.max(0, parseInt(e.target.value) || 0) }))}
                    min="0"
                    max={newItem.maxDurability}
                    className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#00ffe1] mb-2 font-medium">Durabilidade Máxima</label>
                  <input
                    type="number"
                    value={newItem.maxDurability}
                    onChange={(e) => setNewItem(prev => ({ ...prev, maxDurability: Math.max(0, parseInt(e.target.value) || 0) }))}
                    min="0"
                    className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
                  />
                </div>
              </div>

              {/* Attribute Bonuses */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-[#00ffe1] flex items-center gap-2">
                    <Zap className="w-5 h-5" />
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
                  {(newItem.bonuses || []).map((bonus, index) => (
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

              {/* Status Bonuses */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-[#00ffe1] flex items-center gap-2">
                  <Star className="w-5 h-5" />
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
                        value={newItem.statBonuses?.[key] || ''}
                        onChange={(e) => handleStatBonusChange(key, parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={editingEquipment ? handleUpdateEquipment : handleAddEquipment}
                  disabled={!isValidEquipment()}
                  className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                  </div>

                  <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
                    {editingEquipment ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>{editingEquipment ? 'ATUALIZAR' : 'FORJAR'} EQUIPAMENTO</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}