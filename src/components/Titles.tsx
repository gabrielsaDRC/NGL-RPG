import React, { useState } from 'react';
import { Plus, X, Edit2, AlertTriangle, Power, Crown, Star, Sparkles, Zap, Trophy, Award, Swords } from 'lucide-react';
import { Title, AttributeBonus, TitleCategory } from '../types/character';
import { Modal } from './Modal';

interface TitlesProps {
  titles: Title[];
  activeTitles: string[];
  onTitlesChange: (titles: Title[]) => void;
  onToggleTitle: (id: string) => void;
  readOnly?: boolean;
}

const ATTRIBUTES = ['str', 'vit', 'agi', 'int', 'sense'] as const;

const STATS = [
  { key: 'hp', label: 'Vida', icon: '❤️' },
  { key: 'mp', label: 'Mana', icon: '💙' },
  { key: 'physicalDamage', label: 'Dano Físico', icon: '⚔️' },
  { key: 'magicDamage', label: 'Dano Mágico', icon: '🔮' },
  { key: 'attack', label: 'Ataque', icon: '💪' },
  { key: 'defense', label: 'Defesa', icon: '🛡️' },
  { key: 'speed', label: 'Velocidade', icon: '💨' }
] as const;

const TITLE_CATEGORIES = {
  heroico: {
    name: 'Heroico',
    icon: <Trophy className="w-5 h-5 text-yellow-400" />,
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-400/50',
    textColor: 'text-yellow-400',
    glowColor: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
    description: 'Títulos de grandes feitos heroicos'
  },
  nobre: {
    name: 'Nobre',
    icon: <Crown className="w-5 h-5 text-purple-400" />,
    color: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-400/50',
    textColor: 'text-purple-400',
    glowColor: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    description: 'Títulos de prestígio e nobreza'
  },
  combate: {
    name: 'Combate',
    icon: <Swords className="w-5 h-5 text-red-400" />,
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-400/50',
    textColor: 'text-red-400',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    description: 'Títulos de batalha e guerra'
  },
  mistico: {
    name: 'Místico',
    icon: <Sparkles className="w-5 h-5 text-blue-400" />,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-400/50',
    textColor: 'text-blue-400',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    description: 'Títulos mágicos e místicos'
  }
};

export const TitlesSection: React.FC<TitlesProps> = ({
  titles,
  activeTitles,
  onTitlesChange,
  onToggleTitle,
  readOnly = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TitleCategory>('heroico');
  const [newTitle, setNewTitle] = useState<Partial<Title>>({
    name: '',
    category: 'heroico',
    bonuses: [],
    statBonuses: {}
  });

  const handleAddBonus = () => {
    setNewTitle(prev => ({
      ...prev,
      bonuses: [...(prev.bonuses || []), { attribute: 'str', value: 0 }]
    }));
  };

  const handleRemoveBonus = (index: number) => {
    setNewTitle(prev => ({
      ...prev,
      bonuses: (prev.bonuses || []).filter((_, i) => i !== index)
    }));
  };

  const handleBonusChange = (index: number, field: 'attribute' | 'value', value: string | number) => {
    setNewTitle(prev => ({
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

  const handleStatBonusChange = (stat: keyof Title['statBonuses'], value: number) => {
    setNewTitle(prev => ({
      ...prev,
      statBonuses: {
        ...prev.statBonuses,
        [stat]: value || undefined
      }
    }));
  };

  const handleAddTitle = () => {
    if (!newTitle.name?.trim()) return;

    const title: Title = {
      id: crypto.randomUUID(),
      name: newTitle.name.trim(),
      category: selectedCategory,
      bonuses: newTitle.bonuses || [],
      statBonuses: Object.keys(newTitle.statBonuses || {}).length > 0 ? newTitle.statBonuses : undefined
    };

    onTitlesChange([...titles, title]);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle({
      name: '',
      category: 'heroico',
      bonuses: [],
      statBonuses: {}
    });
    setEditingTitle(null);
    setSelectedCategory('heroico');
  };

  const handleRemoveTitle = (id: string) => {
    setDeletingTitle(id);
  };

  const confirmDeleteTitle = (id: string) => {
    onTitlesChange(titles.filter(title => title.id !== id));
    if (editingTitle === id) {
      resetForm();
    }
    setDeletingTitle(null);
  };

  const cancelDeleteTitle = () => {
    setDeletingTitle(null);
  };

  const handleEditTitle = (title: Title) => {
    setEditingTitle(title.id);
    setNewTitle(title);
    setSelectedCategory(title.category || 'heroico');
    setIsModalOpen(true);
  };

  const handleUpdateTitle = () => {
    if (!editingTitle || !newTitle.name?.trim()) return;

    const updatedTitle: Title = {
      id: editingTitle,
      name: newTitle.name.trim(),
      category: selectedCategory,
      bonuses: newTitle.bonuses || [],
      statBonuses: Object.keys(newTitle.statBonuses || {}).length > 0 ? newTitle.statBonuses : undefined
    };

    onTitlesChange(titles.map(title => 
      title.id === editingTitle ? updatedTitle : title
    ));
    handleCloseModal();
  };

  const formatBonuses = (title: Title) => {
    const bonusStrings = [];

    if (title.bonuses.length > 0) {
      bonusStrings.push(
        title.bonuses.map(bonus => {
          const sign = bonus.value >= 0 ? '+' : '';
          return `${bonus.attribute.toUpperCase()} ${sign}${bonus.value}`;
        }).join(', ')
      );
    }

    if (title.statBonuses) {
      const statBonusStrings = Object.entries(title.statBonuses)
        .filter(([_, value]) => value !== undefined && value !== 0)
        .map(([stat, value]) => {
          const statLabel = STATS.find(s => s.key === stat)?.label || stat;
          const sign = value >= 0 ? '+' : '';
          return `${statLabel} ${sign}${value}`;
        });
      if (statBonusStrings.length > 0) {
        bonusStrings.push(statBonusStrings.join(', '));
      }
    }

    return bonusStrings.join(' | ');
  };

  const getTitleCategoryStyle = (category?: TitleCategory) => {
    if (!category) return TITLE_CATEGORIES.heroico;
    return TITLE_CATEGORIES[category];
  };

  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border border-[#00ffe1]/50 bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5">
            <Crown className="w-6 h-6 text-[#00ffe1]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
              Títulos
            </h2>
            <p className="text-[#00ffe1]/70 text-sm">Conquistas e honrarias</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {titles.length === 0 ? (
          <div className="text-[#00ffe1] opacity-50 text-center py-4 border border-dashed border-[#00ffe1]/20 rounded-lg md:col-span-2">
            <div className="flex flex-col items-center gap-2">
              <Crown className="w-8 h-8" />
              <span>Nenhum título conquistado</span>
            </div>
          </div>
        ) : (
          titles.map((title) => {
            const categoryStyle = getTitleCategoryStyle(title.category);
            const isActive = activeTitles.includes(title.id);
            
            return (
              <div 
                key={title.id} 
                className={`
                  relative overflow-hidden
                  bg-[#1a1a1a] p-3 rounded-lg border-2 transition-all duration-300
                  group
                  ${editingTitle === title.id 
                    ? 'border-[#00ff88] shadow-[0_0_15px_#00ff88]'
                    : isActive
                    ? `${categoryStyle.borderColor} ${categoryStyle.glowColor}`
                    : 'border-[#00ffe1]/30 hover:border-[#00ffe1]/50'
                  }
                `}
              >
                {/* Magical Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <div className="relative">
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div className={`p-2 rounded-lg border ${categoryStyle.borderColor} bg-gradient-to-br ${categoryStyle.color} flex-shrink-0`}>
                      {categoryStyle.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h3 className={`font-bold text-sm ${isActive ? categoryStyle.textColor : 'text-[#00ffe1]'}`}>
                              {title.name}
                            </h3>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${categoryStyle.borderColor} ${categoryStyle.textColor} bg-gradient-to-r ${categoryStyle.color}`}>
                              {categoryStyle.name}
                            </span>
                          </div>
                          
                          {formatBonuses(title) && (
                            <p className="text-[#00ffe1]/75 text-xs truncate" title={formatBonuses(title)}>
                              {formatBonuses(title)}
                            </p>
                          )}
                          
                          <button
                            onClick={() => onToggleTitle(title.id)}
                            disabled={readOnly}
                            className={`
                              mt-1 px-2 py-1 rounded-full text-xs font-bold border transition-all duration-300
                              ${isActive
                                ? `${categoryStyle.bgColor} ${categoryStyle.borderColor} ${categoryStyle.textColor}`
                                : 'bg-[#1a1a1a] border-[#00ffe1]/50 text-[#00ffe1] hover:border-[#00ffe1]'
                              }
                              ${readOnly ? 'cursor-default' : 'cursor-pointer'}
                            `}
                          >
                            {isActive ? 'ATIVO' : 'Inativo'}
                          </button>
                        </div>
                        
                        {!readOnly && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleEditTitle(title)}
                              className={`p-1 rounded-full text-xs border transition-all ${
                                editingTitle === title.id 
                                  ? 'text-[#00ff88] border-[#00ff88]' 
                                  : 'text-[#00ffe1] border-[#00ffe1]/50 hover:border-[#00ffe1]'
                              }`}
                              title="Editar"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleRemoveTitle(title.id)}
                              className="p-1 rounded-full text-xs border border-red-400/30 text-red-400 hover:border-red-400 transition-all"
                              title="Excluir"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {deletingTitle === title.id && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-1 text-red-500 mb-1">
                            <AlertTriangle size={12} />
                            <span className="text-xs">Excluir este título?</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => confirmDeleteTitle(title.id)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Sim
                            </button>
                            <button
                              onClick={cancelDeleteTitle}
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTitle ? 'Editar Título' : 'Conquistar Novo Título'}
      >
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-2 mb-8">
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-8 h-8 text-[#00ffe1]" />
              <h3 className="text-2xl font-bold text-[#00ffe1]">
                {editingTitle ? 'Modificar Título' : 'Conquistar Título'}
              </h3>
            </div>
            <p className="text-[#00ffe1]/70">
              {editingTitle ? 'Modifique as propriedades do título' : 'Conquiste um novo título de prestígio'}
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/30 to-transparent mb-8" />

          {/* Title Category Selection */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-[#00ffe1] mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Categoria do Título
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(TITLE_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as TitleCategory)}
                    className={`
                      group relative p-4 rounded-xl border-2 transition-all duration-300
                      ${selectedCategory === key
                        ? `bg-gradient-to-br ${category.color} ${category.borderColor} shadow-[0_0_20px_rgba(0,255,225,0.3)]`
                        : 'bg-[#001830] border-[#00ffe1]/30 hover:border-[#00ffe1] hover:bg-[#002040]'
                      }
                    `}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/10 to-[#00ffe1]/0 animate-[shine_2s_ease-in-out_infinite]" />
                    </div>
                    <div className="relative flex flex-col items-center gap-2">
                      {category.icon}
                      <span className="font-bold text-[#00ffe1] text-sm">{category.name}</span>
                      <span className="text-xs text-[#00ffe1]/70 text-center">{category.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <label className="block text-[#00ffe1] mb-2 font-medium">Nome do Título</label>
              <input
                type="text"
                value={newTitle.name}
                onChange={(e) => setNewTitle(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Herói das Chamas"
                className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
              />
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
                {(newTitle.bonuses || []).map((bonus, index) => (
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
                <Sparkles className="w-5 h-5" />
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
                      value={newTitle.statBonuses?.[key] || ''}
                      onChange={(e) => handleStatBonusChange(key, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Section */}
            {newTitle.name && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-[#00ffe1] flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Prévia do Título
                </h4>
                <div className={`p-4 rounded-lg border-2 ${TITLE_CATEGORIES[selectedCategory].borderColor} bg-gradient-to-r ${TITLE_CATEGORIES[selectedCategory].color} ${TITLE_CATEGORIES[selectedCategory].glowColor}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg border ${TITLE_CATEGORIES[selectedCategory].borderColor}`}>
                      {TITLE_CATEGORIES[selectedCategory].icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className={`font-bold text-lg ${TITLE_CATEGORIES[selectedCategory].textColor}`}>
                          {newTitle.name}
                        </h5>
                        <span className={`text-sm px-2 py-1 rounded-full border ${TITLE_CATEGORIES[selectedCategory].borderColor} ${TITLE_CATEGORIES[selectedCategory].textColor}`}>
                          {TITLE_CATEGORIES[selectedCategory].name}
                        </span>
                      </div>
                      {formatBonuses(newTitle as Title) && (
                        <p className="text-[#00ffe1] text-sm mt-1">
                          {formatBonuses(newTitle as Title)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center pt-6">
              <button
                onClick={editingTitle ? handleUpdateTitle : handleAddTitle}
                disabled={!newTitle.name?.trim()}
                className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
                  {editingTitle ? <Edit2 className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
                  <span>{editingTitle ? 'ATUALIZAR' : 'CONQUISTAR'} TÍTULO</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};