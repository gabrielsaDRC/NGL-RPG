import React, { useState, useMemo } from 'react';
import { Plus, Minus, X, Edit2, AlertTriangle, Coins, Package, Search, Sparkles, Star, Crown, Zap, Gem, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { InventoryItem, ItemCategory } from '../types/character';
import { Modal } from './Modal';

interface InventoryProps {
  inventory: InventoryItem[];
  currency: {
    bronze: number;
    silver: number;
    gold: number;
  };
  onInventoryChange: (inventory: InventoryItem[]) => void;
  onCurrencyChange: (currency: { bronze: number; silver: number; gold: number }) => void;
  readOnly?: boolean;
}

const ITEM_CATEGORIES = {
  consumable: {
    name: 'Consumíveis',
    icon: <Package className="w-6 h-6 text-green-400" />,
    description: 'Poções, comidas e itens de uso único',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-400/50',
    textColor: 'text-green-400',
    bgColor: 'bg-green-900/20',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]',
    examples: ['Poção de Vida', 'Elixir de Mana', 'Comida']
  },
  material: {
    name: 'Materiais',
    icon: <Gem className="w-6 h-6 text-blue-400" />,
    description: 'Recursos para crafting e criação',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-400/50',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    examples: ['Ferro', 'Cristal Mágico', 'Couro']
  },
  quest: {
    name: 'Missão',
    icon: <Star className="w-6 h-6 text-yellow-400" />,
    description: 'Itens importantes para missões',
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-400/50',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    glowColor: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
    examples: ['Chave Antiga', 'Pergaminho', 'Artefato']
  },
  misc: {
    name: 'Diversos',
    icon: <Shield className="w-6 h-6 text-purple-400" />,
    description: 'Itens variados e colecionáveis',
    color: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-400/50',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    glowColor: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    examples: ['Livro', 'Joia', 'Ferramenta']
  }
};

const CURRENCY_TYPES = {
  bronze: {
    name: 'Bronze',
    icon: '🥉',
    color: 'text-orange-600',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-600/50'
  },
  silver: {
    name: 'Prata',
    icon: '🥈',
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/20',
    borderColor: 'border-gray-400/50'
  },
  gold: {
    name: 'Ouro',
    icon: '🥇',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-500/50'
  }
};

const ITEMS_PER_PAGE = 10;

export const Inventory: React.FC<InventoryProps> = ({ 
  inventory, 
  currency, 
  onInventoryChange, 
  onCurrencyChange,
  readOnly = false 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'value'>('name');
  const [selectedItemCategory, setSelectedItemCategory] = useState<ItemCategory>('consumable');
  const [currentPage, setCurrentPage] = useState(1);

  const [showCurrencyInput, setShowCurrencyInput] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [currencyInputValue, setCurrencyInputValue] = useState('');

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 1,
    description: '',
    category: 'consumable',
    weight: 0,
    value: {
      bronze: 0,
      silver: 0,
      gold: 0
    },
    isStackable: true,
    maxStack: 99,
    effects: []
  });

  const filteredAndSortedItems = useMemo(() => {
    let items = [...inventory];

    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'value':
          const aValue = (a.value.gold * 10000) + (a.value.silver * 100) + a.value.bronze;
          const bValue = (b.value.gold * 10000) + (b.value.silver * 100) + b.value.bronze;
          return bValue - aValue;
        default:
          return 0;
      }
    });

    return items;
  }, [inventory, searchTerm, selectedCategory, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredAndSortedItems.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const totalWeight = useMemo(() => {
    return inventory.reduce((acc, item) => acc + (item.weight * item.quantity), 0);
  }, [inventory]);

  const handleCurrencyChange = (type: 'bronze' | 'silver' | 'gold', amount: number) => {
    let newCurrency = { ...currency };
    newCurrency[type] += amount;

    if (type === 'bronze' && newCurrency.bronze >= 100) {
      newCurrency.silver += Math.floor(newCurrency.bronze / 100);
      newCurrency.bronze = newCurrency.bronze % 100;
    }
    if (type === 'silver' && newCurrency.silver >= 100) {
      newCurrency.gold += Math.floor(newCurrency.silver / 100);
      newCurrency.silver = newCurrency.silver % 100;
    }

    if (newCurrency.bronze < 0) {
      if (newCurrency.silver > 0) {
        newCurrency.silver--;
        newCurrency.bronze += 100;
      } else if (newCurrency.gold > 0) {
        newCurrency.gold--;
        newCurrency.silver += 99;
        newCurrency.bronze += 100;
      } else {
        newCurrency.bronze = 0;
      }
    }

    if (newCurrency.silver < 0) {
      if (newCurrency.gold > 0) {
        newCurrency.gold--;
        newCurrency.silver += 100;
      } else {
        newCurrency.silver = 0;
      }
    }

    if (newCurrency.gold < 0) {
      newCurrency.gold = 0;
    }

    onCurrencyChange(newCurrency);
  };

  const handleCurrencyInputSubmit = (type: 'bronze' | 'silver' | 'gold') => {
    const value = parseInt(currencyInputValue);
    if (!isNaN(value)) {
      handleCurrencyChange(type, value);
    }
    setShowCurrencyInput(null);
    setCurrencyInputValue('');
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item.id);
    setNewItem(item);
    setSelectedItemCategory(item.category);
    setIsModalOpen(true);
  };

  const handleUpdateItem = () => {
    if (editingItem && newItem.name?.trim() && newItem.quantity && newItem.quantity > 0) {
      onInventoryChange(
        inventory.map(item =>
          item.id === editingItem
            ? {
                ...item,
                name: newItem.name!.trim(),
                quantity: newItem.quantity!,
                description: newItem.description?.trim(),
                category: selectedItemCategory,
                weight: newItem.weight || 0,
                value: newItem.value || { bronze: 0, silver: 0, gold: 0 },
                isStackable: newItem.isStackable ?? true,
                maxStack: newItem.maxStack,
                effects: newItem.effects || []
              }
            : item
        )
      );
      handleCloseModal();
    }
  };

  const handleAddItem = () => {
    if (newItem.name?.trim() && newItem.quantity && newItem.quantity > 0) {
      const existingItem = inventory.find(item => 
        item.name.toLowerCase() === newItem.name?.toLowerCase() &&
        item.isStackable
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + (newItem.quantity || 1);
        if (!existingItem.maxStack || newQuantity <= existingItem.maxStack) {
          onInventoryChange(
            inventory.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: newQuantity }
                : item
            )
          );
        } else {
          alert(`Este item só pode ser empilhado até ${existingItem.maxStack} unidades!`);
          return;
        }
      } else {
        onInventoryChange([
          ...inventory,
          {
            id: crypto.randomUUID(),
            name: newItem.name.trim(),
            quantity: newItem.quantity,
            description: newItem.description?.trim(),
            category: selectedItemCategory,
            weight: newItem.weight || 0,
            value: newItem.value || { bronze: 0, silver: 0, gold: 0 },
            isStackable: newItem.isStackable ?? true,
            maxStack: newItem.maxStack,
            effects: newItem.effects || []
          }
        ]);
      }
      
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
      quantity: 1,
      description: '',
      category: 'consumable',
      weight: 0,
      value: {
        bronze: 0,
        silver: 0,
        gold: 0
      },
      isStackable: true,
      maxStack: 99,
      effects: []
    });
    setSelectedItemCategory('consumable');
    setEditingItem(null);
  };

  const handleUpdateQuantity = (id: string, change: number) => {
    onInventoryChange(
      inventory.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (item.maxStack && newQuantity > item.maxStack) {
            alert(`Este item só pode ser empilhado até ${item.maxStack} unidades!`);
            return item;
          }
          return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter((item): item is InventoryItem => item !== null)
    );
  };

  const handleRemoveItem = (id: string) => {
    setDeletingItem(id);
  };

  const confirmDeleteItem = (id: string) => {
    onInventoryChange(inventory.filter(item => item.id !== id));
    setDeletingItem(null);
  };

  const cancelDeleteItem = () => {
    setDeletingItem(null);
  };

  const formatValue = (value: { bronze: number; silver: number; gold: number }) => {
    const parts = [];
    if (value.gold > 0) parts.push(`${value.gold} ouro`);
    if (value.silver > 0) parts.push(`${value.silver} prata`);
    if (value.bronze > 0) parts.push(`${value.bronze} bronze`);
    return parts.length > 0 ? parts.join(', ') : '0 bronze';
  };

  const getCategoryStyle = (category: ItemCategory) => {
    return ITEM_CATEGORIES[category];
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
          Inventário
        </h2>
        {!readOnly && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            <Plus size={20} />
            <span>Adicionar Item</span>
          </button>
        )}
      </div>

      {/* Currency Section */}
      <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#00ffe1]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#00ffe1] flex items-center gap-2">
            <Coins size={20} />
            Moedas
          </h3>
          <span className="text-[#00ffe1]">
            {formatValue(currency)}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(CURRENCY_TYPES).map(([key, currencyType]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`font-medium ${currencyType.color}`}>{currencyType.name}</span>
                <span className={currencyType.color}>{currency[key as keyof typeof currency]}</span>
              </div>
              {showCurrencyInput === key ? (
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={currencyInputValue}
                    onChange={(e) => setCurrencyInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCurrencyInputSubmit(key as keyof typeof currency);
                      } else if (e.key === 'Escape') {
                        setShowCurrencyInput(null);
                        setCurrencyInputValue('');
                      }
                    }}
                    className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded px-2 py-1"
                    autoFocus
                  />
                  <button
                    onClick={() => handleCurrencyInputSubmit(key as keyof typeof currency)}
                    className="bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded px-2 py-1 hover:bg-[#3a3a3a]"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleCurrencyChange(key as keyof typeof currency, -1)}
                    className="flex-1 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded px-2 py-1 hover:bg-[#3a3a3a]"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => setShowCurrencyInput(key as keyof typeof currency)}
                    className="flex-1 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded px-2 py-1 hover:bg-[#3a3a3a]"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => handleCurrencyChange(key as keyof typeof currency, 1)}
                    className="flex-1 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded px-2 py-1 hover:bg-[#3a3a3a]"
                  >
                    +1
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar itens..."
              className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg pl-10 pr-4 py-2"
            />
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ffe1] opacity-50" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ItemCategory | 'all')}
            className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-2"
          >
            <option value="all">Todas categorias</option>
            {Object.entries(ITEM_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'category' | 'value')}
            className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-2"
          >
            <option value="name">Nome</option>
            <option value="category">Categoria</option>
            <option value="value">Valor</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-[#00ffe1] text-sm">
          <span>Total de itens: {filteredAndSortedItems.length}</span>
          <span>Peso total: {totalWeight.toFixed(1)} kg</span>
        </div>
      </div>

      {/* Items Grid */}
      <div className="space-y-4">
        {currentItems.length === 0 ? (
          <div className="text-[#00ffe1] opacity-50 text-center py-8">
            {searchTerm ? 'Nenhum item encontrado' : 'Inventário vazio'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item) => {
              const categoryStyle = getCategoryStyle(item.category);
              
              return (
                <div 
                  key={item.id} 
                  className={`
                    relative overflow-hidden
                    bg-[#1a1a1a] p-4 rounded-lg border-2 transition-all duration-300
                    group hover:scale-[1.02]
                    ${categoryStyle.borderColor} ${categoryStyle.glowColor}
                  `}
                >
                  {/* Magical Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <div className="relative">
                    <div className="flex items-start gap-4">
                      {/* Category Icon */}
                      <div className={`p-3 rounded-lg border ${categoryStyle.borderColor} bg-gradient-to-br ${categoryStyle.color} flex-shrink-0`}>
                        {categoryStyle.icon}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-bold text-lg ${categoryStyle.textColor}`}>
                                {item.name}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded-full border ${categoryStyle.borderColor} ${categoryStyle.textColor} bg-gradient-to-r ${categoryStyle.color}`}>
                                {categoryStyle.name}
                              </span>
                            </div>
                            
                            {item.description && (
                              <p className="text-[#00ffe1]/75 text-sm mb-2 italic">
                                {item.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-[#00ffe1]/75 mb-3">
                              <span>Peso: {item.weight} kg</span>
                              <span>Valor: {formatValue(item.value)}</span>
                              {item.isStackable && item.maxStack && (
                                <span>Max: {item.maxStack}</span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, -1)}
                                  className="text-[#00ffe1] hover:text-[#00ff88] p-1 rounded border border-[#00ffe1]/30 hover:border-[#00ffe1]"
                                  disabled={readOnly}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className={`text-[#00ffe1] w-12 text-center font-bold text-lg ${categoryStyle.textColor}`}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, 1)}
                                  className="text-[#00ffe1] hover:text-[#00ff88] p-1 rounded border border-[#00ffe1]/30 hover:border-[#00ffe1]"
                                  disabled={readOnly}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {!readOnly && (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-[#00ffe1] hover:text-[#00ff88] p-1"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Delete Confirmation */}
                        {deletingItem === item.id && (
                          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-red-500 mb-2">
                              <AlertTriangle size={16} />
                              <span>Tem certeza que deseja excluir este item?</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => confirmDeleteItem(item.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={cancelDeleteItem}
                                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`
                    w-10 h-10 rounded-lg border transition-all
                    ${page === currentPage
                      ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1] shadow-[0_0_10px_#00ffe1]'
                      : 'bg-[#1a1a1a] text-[#00ffe1] border-[#00ffe1] hover:bg-[#2a2a2a]'
                    }
                  `}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Page Info */}
        {totalPages > 1 && (
          <div className="text-center text-[#00ffe1]/70 text-sm mt-4">
            Página {currentPage} de {totalPages} • Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAndSortedItems.length)} de {filteredAndSortedItems.length} itens
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar Item' : 'Descobrir Novo Item'}
      >
        <div className="relative space-y-8">
          {/* Magical Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-20">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-8 h-8 border border-[#00ffe1]/30"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animation: `float ${2 + Math.random() * 4}s infinite ease-in-out ${Math.random() * 3}s`
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Header Section */}
            <div className="text-center space-y-2 mb-8">
              <div className="flex items-center justify-center gap-2">
                <Package className="w-8 h-8 text-[#00ffe1]" />
                <h3 className="text-2xl font-bold text-[#00ffe1]">
                  {editingItem ? 'Modificar Item' : 'Descobrir Item'}
                </h3>
              </div>
              <p className="text-[#00ffe1]/70">
                {editingItem ? 'Modifique as propriedades do item' : 'Adicione um novo item ao seu inventário'}
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/30 to-transparent mb-8" />

            {/* Item Category Selection */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-[#00ffe1] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Categoria do Item
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(ITEM_CATEGORIES).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedItemCategory(key as ItemCategory);
                        setNewItem(prev => ({ ...prev, category: key as ItemCategory }));
                      }}
                      className={`
                        group relative p-4 rounded-xl border-2 transition-all duration-300
                        ${selectedItemCategory === key
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

                {/* Category Examples */}
                <div className="mt-4 p-4 bg-[#001830] rounded-lg border border-[#00ffe1]/30">
                  <div className="flex items-center gap-2 mb-2">
                    {ITEM_CATEGORIES[selectedItemCategory].icon}
                    <span className="font-medium text-[#00ffe1]">
                      Exemplos de {ITEM_CATEGORIES[selectedItemCategory].name}:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ITEM_CATEGORIES[selectedItemCategory].examples.map((example, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs border ${ITEM_CATEGORIES[selectedItemCategory].borderColor} ${ITEM_CATEGORIES[selectedItemCategory].textColor} bg-gradient-to-r ${ITEM_CATEGORIES[selectedItemCategory].color}`}
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#00ffe1] mb-2 font-medium">Nome do Item</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Poção de Vida Maior"
                    className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                  />
                </div>

                <div>
                  <label className="block text-[#00ffe1] mb-2 font-medium">Quantidade</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                    min="1"
                    className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#00ffe1] mb-2 font-medium">Descrição (opcional)</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva os efeitos e propriedades do item"
                  className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                  rows={3}
                />
              </div>

              {/* Physical Properties */}
              <div>
                <h4 className="text-lg font-medium text-[#00ffe1] mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Propriedades Físicas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#00ffe1] mb-2 font-medium">Peso (kg)</label>
                    <input
                      type="number"
                      value={newItem.weight}
                      onChange={(e) => setNewItem(prev => ({ ...prev, weight: Math.max(0, parseFloat(e.target.value) || 0) }))}
                      min="0"
                      step="0.1"
                      className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-[#00ffe1]">
                        <input
                          type="checkbox"
                          checked={newItem.isStackable}
                          onChange={(e) => setNewItem(prev => ({ ...prev, isStackable: e.target.checked }))}
                          className="w-4 h-4 text-[#00ffe1] bg-[#001830] border-[#00ffe1] rounded focus:ring-[#00ffe1]"
                        />
                        <span className="font-medium">Empilhável</span>
                      </label>
                    </div>
                    {newItem.isStackable && (
                      <div>
                        <label className="block text-[#00ffe1] mb-2 font-medium">Máximo por pilha</label>
                        <input
                          type="number"
                          value={newItem.maxStack}
                          onChange={(e) => setNewItem(prev => ({ ...prev, maxStack: Math.max(1, parseInt(e.target.value) || 1) }))}
                          min="1"
                          className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Value Configuration */}
              <div>
                <h4 className="text-lg font-medium text-[#00ffe1] mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Valor do Item
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(CURRENCY_TYPES).map(([key, currency]) => (
                    <div key={key} className="space-y-2">
                      <label className="flex items-center gap-2 text-[#00ffe1] font-medium">
                        <span className="text-lg">{currency.icon}</span>
                        {currency.name}
                      </label>
                      <div className={`relative rounded-lg border ${currency.borderColor} ${currency.bgColor}`}>
                        <input
                          type="number"
                          value={newItem.value?.[key as keyof typeof newItem.value]}
                          onChange={(e) => setNewItem(prev => ({
                            ...prev,
                            value: {
                              ...prev.value!,
                              [key]: Math.max(0, parseInt(e.target.value) || 0)
                            }
                          }))}
                          min="0"
                          className={`w-full bg-transparent ${currency.color} border-0 rounded-lg p-3 focus:ring-2 focus:ring-[#00ffe1] placeholder-opacity-50`}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Section */}
              {newItem.name && (
                <div>
                  <h4 className="text-lg font-medium text-[#00ffe1] mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Prévia do Item
                  </h4>
                  <div className={`p-4 rounded-lg border-2 ${ITEM_CATEGORIES[selectedItemCategory].borderColor} bg-gradient-to-r ${ITEM_CATEGORIES[selectedItemCategory].color}`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg border ${ITEM_CATEGORIES[selectedItemCategory].borderColor}`}>
                        {ITEM_CATEGORIES[selectedItemCategory].icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className={`font-bold text-lg ${ITEM_CATEGORIES[selectedItemCategory].textColor}`}>
                            {newItem.name}
                          </h5>
                          <span className={`text-sm px-2 py-1 rounded-full border ${ITEM_CATEGORIES[selectedItemCategory].borderColor} ${ITEM_CATEGORIES[selectedItemCategory].textColor}`}>
                            {ITEM_CATEGORIES[selectedItemCategory].name}
                          </span>
                          <span className="text-[#00ffe1] text-sm">
                            x{newItem.quantity}
                          </span>
                        </div>
                        {newItem.description && (
                          <p className="text-[#00ffe1] text-sm mb-2 italic">
                            {newItem.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-[#00ffe1]/75">
                          <span>Peso: {newItem.weight} kg</span>
                          <span>Valor: {formatValue(newItem.value || { bronze: 0, silver: 0, gold: 0 })}</span>
                          {newItem.isStackable && (
                            <span>Empilhável: {newItem.maxStack}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={editingItem ? handleUpdateItem : handleAddItem}
                  disabled={!newItem.name?.trim() || !newItem.quantity || newItem.quantity <= 0}
                  className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                  </div>

                  <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
                    {editingItem ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>{editingItem ? 'ATUALIZAR' : 'DESCOBRIR'} ITEM</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;