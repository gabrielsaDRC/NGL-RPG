import React from 'react';
import { Plus, Minus, X, Sword, Shield, Percent, Power } from 'lucide-react';
import { Ability, AttributeBonus, AbilityType, ResourceType, StatType } from '../types/character';

interface AbilityFormProps {
  isExpanded: boolean;
  editingAbility: string | null;
  newAbilityName: string;
  newAbilityDescription: string;
  newAbilityType: AbilityType;
  newAbilityBonuses: { attribute: keyof AttributeBonus; value: number }[];
  newAbilityAttack: {
    value: number;
    damageType: 'physical' | 'magical';
  };
  newAbilityModifier: {
    stat: StatType;
    value: number;
  };
  newAbilityCost: {
    type: ResourceType;
    mpCost: number;
    fatigueCost: number;
  };
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onTypeChange: (type: AbilityType) => void;
  onBonusChange: (index: number, field: 'attribute' | 'value', value: string | number) => void;
  onAddBonus: () => void;
  onRemoveBonus: (index: number) => void;
  onAttackChange: (field: 'value' | 'damageType', value: number | 'physical' | 'magical') => void;
  onModifierChange: (field: 'stat' | 'value', value: StatType | number) => void;
  onCostChange: (field: 'type' | 'mpCost' | 'fatigueCost', value: ResourceType | number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isValid: boolean;
}

export const AbilityForm: React.FC<AbilityFormProps> = ({
  isExpanded,
  editingAbility,
  newAbilityName,
  newAbilityDescription,
  newAbilityType,
  newAbilityBonuses,
  newAbilityAttack,
  newAbilityModifier,
  newAbilityCost,
  onNameChange,
  onDescriptionChange,
  onTypeChange,
  onBonusChange,
  onAddBonus,
  onRemoveBonus,
  onAttackChange,
  onModifierChange,
  onCostChange,
  onSubmit,
  onCancel,
  isValid
}) => {
  const attributes: (keyof AttributeBonus)[] = ['str', 'vit', 'agi', 'int', 'sense'];
  const statTypes: StatType[] = ['physicalDamage', 'magicDamage'];

  const getStatDisplayName = (stat: StatType) => {
    switch (stat) {
      case 'physicalDamage': return 'Dano Físico';
      case 'magicDamage': return 'Dano Mágico';
      default: return stat;
    }
  };

  if (!isExpanded) return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      <input
        type="text"
        value={newAbilityName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Nome da habilidade"
        className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
      />

      <textarea
        value={newAbilityDescription}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Descrição da habilidade"
        className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
        rows={2}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => onTypeChange('attribute_buff')}
          className={`flex items-center justify-center gap-2 p-2 rounded-lg border ${
            newAbilityType === 'attribute_buff'
              ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1]'
              : 'bg-[#2a2a2a] text-[#00ffe1] border-[#00ffe1]'
          }`}
        >
          <Shield size={20} />
          Buff de Atributo
        </button>
        <button
          onClick={() => onTypeChange('attack_skill')}
          className={`flex items-center justify-center gap-2 p-2 rounded-lg border ${
            newAbilityType === 'attack_skill'
              ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1]'
              : 'bg-[#2a2a2a] text-[#00ffe1] border-[#00ffe1]'
          }`}
        >
          <Sword size={20} />
          Habilidade de Ataque
        </button>
        <button
          onClick={() => onTypeChange('attack_buff')}
          className={`flex items-center justify-center gap-2 p-2 rounded-lg border ${
            newAbilityType === 'attack_buff'
              ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1]'
              : 'bg-[#2a2a2a] text-[#00ffe1] border-[#00ffe1]'
          }`}
        >
          <Percent size={20} />
          Buff de Ataque
        </button>
        <button
          onClick={() => onTypeChange('passive_skill')}
          className={`flex items-center justify-center gap-2 p-2 rounded-lg border ${
            newAbilityType === 'passive_skill'
              ? 'bg-[#00ffe1] text-[#1a1a1a] border-[#00ffe1]'
              : 'bg-[#2a2a2a] text-[#00ffe1] border-[#00ffe1]'
          }`}
        >
          <Power size={20} />
          Habilidade Passiva
        </button>
      </div>

      {newAbilityType !== 'passive_skill' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#00ffe1] mb-1">Tipo de Custo</label>
            <select
              value={newAbilityCost.type}
              onChange={(e) => onCostChange('type', e.target.value as ResourceType)}
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            >
              <option value="mp">Mana</option>
              <option value="fatigue">Fadiga</option>
              <option value="both">Ambos</option>
            </select>
          </div>

          {(newAbilityCost.type === 'mp' || newAbilityCost.type === 'both') && (
            <div>
              <label className="block text-[#00ffe1] mb-1">Custo de Mana</label>
              <input
                type="number"
                value={newAbilityCost.mpCost}
                onChange={(e) => onCostChange('mpCost', Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
              />
            </div>
          )}

          {(newAbilityCost.type === 'fatigue' || newAbilityCost.type === 'both') && (
            <div>
              <label className="block text-[#00ffe1] mb-1">Custo de Fadiga</label>
              <input
                type="number"
                value={newAbilityCost.fatigueCost}
                onChange={(e) => onCostChange('fatigueCost', Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
              />
            </div>
          )}
        </div>
      )}

      {newAbilityType === 'attack_skill' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#00ffe1] mb-1">Multiplicador de Dano</label>
            <input
              type="number"
              value={newAbilityAttack.value}
              onChange={(e) => onAttackChange('value', Math.max(0, parseFloat(e.target.value) || 0))}
              min="0"
              step="0.1"
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-[#00ffe1] mb-1">Tipo de Dano</label>
            <select
              value={newAbilityAttack.damageType}
              onChange={(e) => onAttackChange('damageType', e.target.value as 'physical' | 'magical')}
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            >
              <option value="physical">Dano Físico</option>
              <option value="magical">Dano Mágico</option>
            </select>
          </div>
        </div>
      )}

      {newAbilityType === 'attack_buff' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#00ffe1] mb-1">Atributo</label>
            <select
              value={newAbilityModifier.stat}
              onChange={(e) => onModifierChange('stat', e.target.value as StatType)}
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            >
              {statTypes.map(stat => (
                <option key={stat} value={stat}>{getStatDisplayName(stat)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#00ffe1] mb-1">Valor</label>
            <input
              type="number"
              value={newAbilityModifier.value}
              onChange={(e) => onModifierChange('value', parseInt(e.target.value) || 0)}
              className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
            />
          </div>
        </div>
      )}

      {(newAbilityType === 'attribute_buff' || newAbilityType === 'passive_skill') && (
        <>
          {newAbilityBonuses.map((bonus, index) => (
            <div key={index} className="flex items-center space-x-4">
              <select
                value={bonus.attribute}
                onChange={(e) => onBonusChange(index, 'attribute', e.target.value)}
                className="bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
              >
                {attributes.map(attr => (
                  <option key={attr} value={attr}>{attr.toUpperCase()}</option>
                ))}
              </select>
              <input
                type="number"
                value={bonus.value}
                onChange={(e) => onBonusChange(index, 'value', e.target.value)}
                className="w-20 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
              />
              <button
                onClick={() => onRemoveBonus(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Minus size={20} />
              </button>
            </div>
          ))}

          <button
            onClick={onAddBonus}
            className="flex items-center space-x-2 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#3a3a3a]"
          >
            <Plus size={20} />
            <span>Adicionar Bônus</span>
          </button>
        </>
      )}

      <div className="flex space-x-4">
        <button
          onClick={onSubmit}
          disabled={!isValid}
          className="flex items-center space-x-2 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          <span>{editingAbility ? 'Atualizar' : 'Adicionar'} Habilidade</span>
        </button>
        {editingAbility && (
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 bg-[#2a2a2a] text-red-500 border border-red-500 rounded-lg px-4 py-2 hover:bg-[#3a3a3a]"
          >
            <X size={20} />
            <span>Cancelar</span>
          </button>
        )}
      </div>
    </div>
  );
};