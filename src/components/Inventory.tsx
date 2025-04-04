import React, { useState } from 'react';
import { Plus, Minus, X, Edit2, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../types/character';
import { Modal } from './Modal';

interface InventoryProps {
  inventory: InventoryItem[];
  onInventoryChange: (inventory: InventoryItem[]) => void;
  readOnly?: boolean;
}

export const Inventory: React.FC<InventoryProps> = ({ inventory, onInventoryChange, readOnly = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 1,
    description: ''
  });

  const handleAddItem = () => {
    if (newItem.name?.trim() && newItem.quantity && newItem.quantity > 0) {
      const existingItem = inventory.find(item => item.name.toLowerCase() === newItem.name?.toLowerCase());
      
      if (existingItem) {
        onInventoryChange(
          inventory.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
              : item
          )
        );
      } else {
        onInventoryChange([
          ...inventory,
          {
            id: crypto.randomUUID(),
            name: newItem.name.trim(),
            quantity: newItem.quantity,
            description: newItem.description?.trim()
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
      description: ''
    });
    setEditingItem(null);
  };

  const handleUpdateQuantity = (id: string, change: number) => {
    onInventoryChange(
      inventory.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
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
    if (editingItem === id) {
      resetForm();
    }
    setDeletingItem(null);
  };

  const cancelDeleteItem = () => {
    setDeletingItem(null);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item.id);
    setNewItem(item);
    setIsModalOpen(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !newItem.name?.trim() || !newItem.quantity || newItem.quantity <= 0) return;

    onInventoryChange(inventory.map(item =>
      item.id === editingItem
        ? {
            ...item,
            name: newItem.name!.trim(),
            quantity: newItem.quantity!,
            description: newItem.description?.trim()
          }
        : item
    ));
    handleCloseModal();
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
    <div className="bg-[rgba(20,0,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
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

      <div className="space-y-2">
        {inventory.length === 0 ? (
          <div className="text-[#00ffe1] opacity-50 text-center py-4">
            Inventário vazio
          </div>
        ) : (
          inventory.map((item) => (
            <div 
              key={item.id} 
              className={`bg-[#1a1a1a] p-3 rounded-lg border transition-all duration-300 ${
                editingItem === item.id 
                  ? 'border-[#00ff88] shadow-[0_0_15px_#00ff88]' 
                  : 'border-[#00ffe1]'
              }`}
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-[#00ffe1] font-medium">{item.name}</h3>
                    {item.description && (
                      <>
                        <span className="text-[#00ffe1] opacity-50">:</span>
                        <span className="text-[#00ffe1] text-sm italic">"{item.description}"</span>
                      </>
                    )}
                  </div>
                </div>
                {!readOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className={`${
                        editingItem === item.id 
                          ? 'text-[#00ff88]' 
                          : 'text-[#00ffe1] hover:text-[#00ff88]'
                      }`}
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