import React from 'react';
import { Character } from '../types/character';
import { Power, Crown, Trophy, Sparkles, Swords } from 'lucide-react';

interface BasicInfoProps {
  character: Character;
  onChange: (field: keyof Character, value: string | number) => void;
  readOnly?: boolean;
}

const TITLE_CATEGORY_ICONS = {
  heroico: <Trophy size={16} className="text-yellow-400" />,
  nobre: <Crown size={16} className="text-purple-400" />,
  combate: <Swords size={16} className="text-red-400" />,
  mistico: <Sparkles size={16} className="text-blue-400" />
};

const TITLE_CATEGORY_COLORS = {
  heroico: 'border-yellow-400/50 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]',
  nobre: 'border-purple-400/50 bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
  combate: 'border-red-400/50 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
  mistico: 'border-blue-400/50 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
};

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
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-300
            ${activeTitle.category 
              ? TITLE_CATEGORY_COLORS[activeTitle.category]
              : 'border-[#00ffe1]/50 bg-[#1a1a1a] text-[#00ffe1] shadow-[0_0_10px_#00ffe1]'
            }
          `}>
            <div className="flex items-center gap-2">
              {activeTitle.category 
                ? TITLE_CATEGORY_ICONS[activeTitle.category]
                : <Power size={16} className="text-[#00ffe1]" />
              }
              <span className="font-bold text-lg">{activeTitle.name}</span>
            </div>
            {activeTitle.category && (
              <span className={`
                text-xs px-2 py-1 rounded-full border
                ${activeTitle.category === 'heroico' ? 'border-yellow-400/50 bg-yellow-500/20' :
                  activeTitle.category === 'nobre' ? 'border-purple-400/50 bg-purple-500/20' :
                  activeTitle.category === 'combate' ? 'border-red-400/50 bg-red-500/20' :
                  'border-blue-400/50 bg-blue-500/20'
                }
              `}>
                {activeTitle.category === 'heroico' ? 'Heroico' :
                 activeTitle.category === 'nobre' ? 'Nobre' :
                 activeTitle.category === 'combate' ? 'Combate' :
                 'Místico'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};