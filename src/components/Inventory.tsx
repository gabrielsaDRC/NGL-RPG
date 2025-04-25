import React, { useState, useMemo } from 'react';
import { Plus, Minus, X, Edit2, AlertTriangle, Coins, Package, Search } from 'lucide-react';
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

  const [showCurrencyInput, setShowCurrencyInput] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [currencyInputValue, setCurrencyInputValue] = useState('');

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 1,
    description: '',
    category: 'misc',
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

  const categories: { value: ItemCategory; label: string; icon: JSX.Element }[] = [
    { value: 'consumable', label: 'Consumíveis', icon: <Package size={16} /> },
    { value: 'material', label: 'Materiais', icon: <Package size={16} /> },
    { value: 'quest', label: 'Missão', icon: <Package size={16} /> },
    { value: 'misc', label: 'Diversos', icon: <Package size={16} /> }
  ];

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
                category: newItem.category as ItemCategory,
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
            category: newItem.category as ItemCategory,
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
      category: 'misc',
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

  const renderInventoryForm = () => (
    <div className="grid grid-cols-1 gap-4">
      <input
        type="text"
        value={newItem.name}
        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Nome do item"
        className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#00ffe1] mb-1">Categoria</label>
          <select
            value={newItem.category}
            onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as ItemCategory }))}
            className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[#00ffe1] mb-1">Quantidade</label>
          <input
            type="number"
            value={newItem.quantity}
            onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
            min="1"
            className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#00ffe1] mb-1">Peso (kg)</label>
          <input
            type="number"
            value={newItem.weight}
            onChange={(e) => setNewItem(prev => ({ ...prev, weight: Math.max(0, parseFloat(e.target.value) || 0) }))}
            min="0"
            step="0.1"
            className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-[#00ffe1] mb-1">Empilhável</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newItem.isStackable}
                onChange={(e) => setNewItem(prev => ({ ...prev, isStackable: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-[#00ffe1]">Sim</span>
            </label>
            {newItem.isStackable && (
              <input
                type="number"
                value={newItem.maxStack}
                onChange={(e) => setNewItem(prev => ({ ...prev, maxStack: Math.max(1, parseInt(e.target.value) || 1) }))}
                min="1"
                placeholder="Máximo"
                className="w-20 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[#00ffe1] mb-1">Valor</label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <input
              type="number"
              value={newItem.value?.gold}
              onChange={(e) => setNewItem(prev => ({
                ...prev,
                value: {
                  ...prev.value!,
                  gold: Math.max(0, parseInt(e.target.value) || 0)
                }
              }))}
              min="0"
              placeholder="Ouro"
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            />
            <span className="text-[#00ffe1] text-sm">Ouro</span>
          </div>
          <div>
            <input
              type="number"
              value={newItem.value?.silver}
              onChange={(e) => setNewItem(prev => ({
                ...prev,
                value: {
                  ...prev.value!,
                  silver: Math.max(0, parseInt(e.target.value) || 0)
                }
              }))}
              min="0"
              placeholder="Prata"
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            />
            <span className="text-[#00ffe1] text-sm">Prata</span>
          </div>
          <div>
            <input
              type="number"
              value={newItem.value?.bronze}
              onChange={(e) => setNewItem(prev => ({
                ...prev,
                value: {
                  ...prev.value!,
                  bronze: Math.max(0, parseInt(e.target.value) || 0)
                }
              }))}
              min="0"
              placeholder="Bronze"
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            />
            <span className="text-[#00ffe1] text-sm">Bronze</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[#00ffe1] mb-1">Descrição (opcional)</label>
        <textarea
          value={newItem.description}
          onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição do item"
          className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        <button
          onClick={editingItem ? handleUpdateItem : handleAddItem}
          disabled={!newItem.name?.trim() || !newItem.quantity || newItem.quantity <= 0}
          className="flex items-center space-x-2 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          <span>{editingItem ? 'Atualizar' : 'Adicionar'} Item</span>
        </button>
      </div>
    </div>
  );

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
          {[
            { type: 'gold', label: 'Ouro', color: 'text-yellow-500' },
            { type: 'silver', label: 'Prata', color: 'text-gray-400' },
            { type: 'bronze', label: 'Bronze', color: 'text-orange-600' }
          ].map(({ type, label, color }) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`font-medium ${color}`}>{label}</span>
                <span className={color}>{currency[type as keyof typeof currency]}</span>
              </div>
              {showCurrencyInput === type ? (
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={currencyInputValue}
                    onChange={(e) => setCurrencyInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCurrencyInputSubmit(type as keyof typeof currency);
                      } else if (e.key === 'Escape') {
                        setShowCurrencyInput(null);
                        setCurrencyInputValue('');
                      }
                    }}
                    className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded px-2 py-1"
                    autoFocus
                  />
                  <button
                    onClick={() => handleCurrencyInputSubmit(type as keyof typeof currency)}
                    className="bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded px-2 py-1 hover:bg-[#3a3a3a]"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleCurrencyChange(type as keyof typeof currency, -1)}
                    className="flex-1 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded px-2 py-1 hover:bg-[#3a3a3a]"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => setShowCurrencyInput(type as keyof typeof currency)}
                    className="flex-1 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded px-2 py-1 hover:bg-[#3a3a3a]"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => handleCurrencyChange(type as keyof typeof currency, 1)}
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
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
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
          <span>Total de itens: {inventory.length}</span>
          <span>Peso total: {totalWeight.toFixed(1)} kg</span>
        </div>
      </div>

      <div className="space-y-2">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-[#00ffe1] opacity-50 text-center py-4">
            {searchTerm ? 'Nenhum item encontrado' : 'Inventário vazio'}
          </div>
        ) : (
          filteredAndSortedItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-[#1a1a1a] p-3 rounded-lg border border-[#00ffe1] hover:border-[#00ff88] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="text-[#00ffe1] hover:text-[#00ff88] p-1"
                      disabled={readOnly}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-[#00ffe1] w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="text-[#00ffe1] hover:text-[#00ff88] p-1"
                      disabled={readOnly}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[#00ffe1] font-medium">{item.name}</h3>
                      <span className="text-[#00ffe1] opacity-75 text-sm">
                        ({categories.find(cat => cat.value === item.category)?.label})
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[#00ffe1] opacity-75 text-sm italic">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-[#00ffe1] opacity-75">
                      <span>Peso: {item.weight} kg</span>
                      <span>Valor: {formatValue(item.value)}</span>
                    </div>
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-[#00ffe1] hover:text-[#00ff88]"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {deletingItem === item.id && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
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
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Editar Item' : 'Adicionar Item'}
      >
        {renderInventoryForm()}
      </Modal>
    </div>
  );
};

export default Inventory;