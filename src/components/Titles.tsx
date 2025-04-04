import React, { useState } from 'react';
import { Plus, X, Edit2, AlertTriangle, Power } from 'lucide-react';
import { Title, AttributeBonus } from '../types/character';
import { Modal } from './Modal';

interface TitlesProps {
  titles: Title[];
  activeTitles: string[];
  onTitlesChange: (titles: Title[]) => void;
  onToggleTitle: (id: string) => void;
  readOnly?: boolean;
}

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
  const [newTitle, setNewTitle] = useState<Partial<Title>>({
    name: '',
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
    { key: 'speed', label: 'Velocidade' }
  ];

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
      bonuses: [],
      statBonuses: {}
    });
    setEditingTitle(null);
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
    setIsModalOpen(true);
  };

  const handleUpdateTitle = () => {
    if (!editingTitle || !newTitle.name?.trim()) return;

    const updatedTitle: Title = {
      id: editingTitle,
      name: newTitle.name.trim(),
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

  const renderTitleForm = () => (
    <div className="grid grid-cols-1 gap-4">
      <input
        type="text"
        value={newTitle.name}
        onChange={(e) => setNewTitle(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Nome do título"
        className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
      />

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

        {(newTitle.bonuses || []).map((bonus, index) => (
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
              <X size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-[#00ffe1] font-medium">Bônus de Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-[#00ffe1] text-sm">{label}:</label>
              <input
                type="number"
                value={newTitle.statBonuses?.[key as keyof Title['statBonuses']] || ''}
                onChange={(e) => handleStatBonusChange(key as keyof Title['statBonuses'], parseInt(e.target.value))}
                placeholder="0"
                className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        <button
          onClick={editingTitle ? handleUpdateTitle : handleAddTitle}
          disabled={!newTitle.name?.trim()}
          className="flex items-center space-x-2 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          <span>{editingTitle ? 'Atualizar' : 'Adicionar'} Título</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[rgba(20,0,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
          Títulos
        </h2>
        {!readOnly && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            <Plus size={20} />
            <span>Adicionar Título</span>
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {titles.length === 0 ? (
          <div className="text-[#00ffe1] opacity-50 text-center py-4">
            Nenhum título conquistado
          </div>
        ) : (
          titles.map((title) => (
            <div 
              key={title.id} 
              className={`bg-[#1a1a1a] p-3 rounded-lg border transition-all duration-300 ${
                editingTitle === title.id 
                  ? 'border-[#00ff88] shadow-[0_0_15px_#00ff88]'
                  : activeTitles.includes(title.id)
                  ? 'border-[#00ff88] shadow-[0_0_10px_#00ff88]'
                  : 'border-[#00ffe1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onToggleTitle(title.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                      activeTitles.includes(title.id)
                        ? 'bg-[#00ff88] text-[#1a1a1a] shadow-[0_0_10px_#00ff88]'
                        : 'bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] hover:border-[#00ff88] hover:text-[#00ff88]'
                    }`}
                  >
                    <Power size={16} />
                    <span className="font-medium">
                      {activeTitles.includes(title.id) ? 'Ativo' : 'Inativo'}
                    </span>
                  </button>
                  <div>
                    <h3 className="text-[#00ffe1] font-medium">{title.name}</h3>
                    <p className="text-[#00ffe1] opacity-75 text-sm">
                      {formatBonuses(title)}
                    </p>
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTitle(title)}
                      className={`${
                        editingTitle === title.id 
                          ? 'text-[#00ff88]' 
                          : 'text-[#00ffe1] hover:text-[#00ff88]'
                      }`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleRemoveTitle(title.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {deletingTitle === title.id && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                    <AlertTriangle size={16} />
                    <span>Tem certeza que deseja excluir este título?</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmDeleteTitle(title.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={cancelDeleteTitle}
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTitle ? 'Editar Título' : 'Adicionar Título'}
      >
        {renderTitleForm()}
      </Modal>
    </div>
  );
};