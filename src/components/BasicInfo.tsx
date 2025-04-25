import React from 'react';
import { Character } from '../types/character';
import { Power } from 'lucide-react';

interface BasicInfoProps {
  character: Character;
  onChange: (field: keyof Character, value: string | number) => void;
  readOnly?: boolean;
}

export const BasicInfo: React.FC<BasicInfoProps> = ({ character, onChange, readOnly = false }) => {
  const activeTitle = character.titles.find(title => character.activeTitles.includes(title.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#00ffe1] mb-2 drop-shadow-[0_0_5px_#00ffe1]">Nome:</label>
          <input
            type="text"
            value={character.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ff88] transition-all"
            placeholder="Digite o nome do personagem"
            readOnly={readOnly}
          />
        </div>

        <div>
          <label className="block text-[#00ffe1] mb-2 drop-shadow-[0_0_5px_#00ffe1]">Classe:</label>
          <input
            type="text"
            value={character.class}
            onChange={(e) => onChange('class', e.target.value)}
            className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ff88] transition-all"
            placeholder="Ex: Mago, Guerreiro"
            readOnly={readOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[#00ffe1] mb-2 drop-shadow-[0_0_5px_#00ffe1]">Idade:</label>
          <input
            type="number"
            value={character.age}
            onChange={(e) => onChange('age', parseInt(e.target.value) || 18)}
            className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ff88] transition-all"
            readOnly={readOnly}
          />
        </div>

        <div>
          <label className="block text-[#00ffe1] mb-2 drop-shadow-[0_0_5px_#00ffe1]">Nível:</label>
          <input
            type="number"
            value={character.level}
            onChange={(e) => onChange('level', parseInt(e.target.value) || 1)}
            min="1"
            max="200"
            className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ff88] transition-all"
            readOnly={readOnly}
          />
        </div>
      </div>

      {activeTitle && (
        <div className="w-full">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88] rounded-lg shadow-[0_0_10px_#00ff88]">
            <Power size={16} className="text-[#00ff88]" />
            <span className="font-medium">{activeTitle.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};