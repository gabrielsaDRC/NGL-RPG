import React, { useState } from 'react';
import { Sword, Wind, Crosshair, Trash2 } from 'lucide-react';
import { AttributeBonus, Character } from '../types/character';

interface DiceRoll {
  id: string;
  type: 'attack' | 'dodge' | 'initiative' | 'attribute';
  rolls: number[];
  total: number;
  attackType?: 'physical' | 'magical';
  attackValue?: number;
  isCritical: boolean;
  timestamp: number;
}

interface DiceRollerProps {
  onRoll?: (diceType: number, rolls: number[], total: number, context?: string, attributeValue?: number, isCritical?: boolean) => void;
  character: Character;
  stats?: {
    attack: number;
    magicAttack: number;
  };
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ 
  onRoll,
  character,
  stats
}) => {
  const [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [rolling, setRolling] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<keyof AttributeBonus>('str');

  const rollDice = (type: 'attack' | 'dodge' | 'initiative' | 'attribute') => {
    setRolling(true);
    
    // Roll 2d10
    const roll1 = Math.floor(Math.random() * 10) + 1;
    const roll2 = Math.floor(Math.random() * 10) + 1;
    const rolls = [roll1, roll2];
    const total = roll1 + roll2;
    const isCritical = roll1 === 10 && roll2 === 10;

    let attackType: 'physical' | 'magical' | undefined;
    let attackValue: number | undefined;

    // Calculate the attribute value based on the roll type
    if (type === 'attack') {
      attackType = character.combatPreferences.attackAttribute;
      attackValue = attackType === 'physical' 
        ? (stats?.attack || 0) 
        : (stats?.magicAttack || 0);
    } else if (type === 'dodge' || type === 'initiative') {
      // For dodge and initiative, use the character's agility
      attackValue = character.attributes.agi;
    } else if (type === 'attribute') {
      // For attribute tests, use the selected attribute's value
      attackValue = character.attributes[selectedAttribute];
    }

    const newRoll: DiceRoll = {
      id: crypto.randomUUID(),
      type,
      rolls,
      total,
      attackType,
      attackValue,
      isCritical,
      timestamp: Date.now(),
    };

    setRolls(prev => [newRoll, ...prev].slice(0, 5));
    
    if (onRoll) {
      const context = type === 'attribute' 
        ? `Teste de ${selectedAttribute.toUpperCase()}`
        : type === 'attack'
        ? `${character.combatPreferences.attackAttribute === 'physical' ? 'Ataque Físico' : 'Ataque Mágico'}`
        : `${getRollTypeName(type)}`;
      onRoll(10, rolls, total, context, attackValue, isCritical);
    }
    
    setTimeout(() => setRolling(false), 500);
  };

  const clearRolls = () => {
    setRolls([]);
  };

  const getRollIcon = (type: 'attack' | 'dodge' | 'initiative' | 'attribute') => {
    switch (type) {
      case 'attack':
        return <Sword size={20} className="text-[#00ffe1]" />;
      case 'dodge':
      case 'initiative':
      case 'attribute':
        return <Wind size={20} className="text-[#00ffe1]" />;
    }
  };

  const getRollTypeName = (type: 'attack' | 'dodge' | 'initiative' | 'attribute') => {
    switch (type) {
      case 'attack':
        return character.combatPreferences.attackAttribute === 'physical' ? 'Ataque Físico' : 'Ataque Mágico';
      case 'dodge':
        return 'Esquiva';
      case 'initiative':
        return 'Iniciativa';
      case 'attribute':
        return 'Teste de Atributo';
    }
  };

  return (
    <div className="bg-[rgba(20,0,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
          Rolagem de Dados
        </h2>
        {rolls.length > 0 && (
          <button
            onClick={clearRolls}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={20} />
            <span>Limpar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => rollDice('attack')}
          disabled={rolling}
          className={`flex items-center justify-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 ${
            rolling ? 'animate-pulse' : 'hover:bg-[#2a2a2a]'
          }`}
        >
          <Sword size={24} />
          <span className="text-lg font-bold">
            {character.combatPreferences.attackAttribute === 'physical' ? 'Ataque Físico' : 'Ataque Mágico'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => rollDice('dodge')}
            disabled={rolling}
            className={`flex items-center justify-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 ${
              rolling ? 'animate-pulse' : 'hover:bg-[#2a2a2a]'
            }`}
          >
            <Wind size={24} />
            <span className="text-lg font-bold">Esquiva (AGI)</span>
          </button>

          <button
            onClick={() => rollDice('initiative')}
            disabled={rolling}
            className={`flex items-center justify-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 ${
              rolling ? 'animate-pulse' : 'hover:bg-[#2a2a2a]'
            }`}
          >
            <Crosshair size={24} />
            <span className="text-lg font-bold">Iniciativa (AGI)</span>
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <select
            value={selectedAttribute}
            onChange={(e) => setSelectedAttribute(e.target.value as keyof AttributeBonus)}
            className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
          >
            {Object.keys(character.attributes).map((attr) => (
              <option key={attr} value={attr}>
                {attr.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            onClick={() => rollDice('attribute')}
            disabled={rolling}
            className={`flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 ${
              rolling ? 'animate-pulse' : 'hover:bg-[#2a2a2a]'
            }`}
          >
            <Wind size={24} />
            <span className="text-lg font-bold">Teste de {selectedAttribute.toUpperCase()}</span>
          </button>
        </div>

        <div className="space-y-2">
          {rolls.map(roll => (
            <div
              key={roll.id}
              className={`bg-[#1a1a1a] rounded-lg p-4 border ${
                roll.isCritical
                  ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                  : 'border-[#00ffe1]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getRollIcon(roll.type)}
                  <span className="text-[#00ffe1] font-medium">
                    {getRollTypeName(roll.type)}
                  </span>
                </div>
                {roll.isCritical && (
                  <span className="text-yellow-500 font-bold animate-pulse">
                    CRÍTICO!
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[#00ffe1]">
                  2d10: [{roll.rolls.join('] [')}] = {roll.total}
                </div>
                {roll.attackValue !== undefined && (
                  <div className="text-[#00ffe1]">
                    {roll.type === 'attack' 
                      ? `${roll.attackType === 'physical' ? 'Ataque Físico' : 'Ataque Mágico'}`
                      : roll.type === 'dodge'
                      ? 'Agilidade'
                      : roll.type === 'initiative'
                      ? 'Agilidade'
                      : selectedAttribute.toUpperCase()}: {roll.attackValue}
                  </div>
                )}
                <div className="text-[#00ff88] font-bold text-lg">
                  Total Final: {roll.total + (roll.attackValue || 0)}
                  {roll.isCritical && ` (${(roll.total + (roll.attackValue || 0)) * 2} com crítico)`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};