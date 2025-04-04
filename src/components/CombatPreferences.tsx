import React from 'react';
import { Sword } from 'lucide-react';

interface CombatPreferencesProps {
  attackAttribute: 'physical' | 'magical';
  onPreferenceChange: (type: 'attack', attribute: 'physical' | 'magical') => void;
}

export const CombatPreferences: React.FC<CombatPreferencesProps> = ({
  attackAttribute,
  onPreferenceChange
}) => {
  return (
    <div className="bg-[rgba(20,0,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <h2 className="text-2xl font-bold text-[#00ffe1] mb-6 drop-shadow-[0_0_10px_#00ffe1]">
        Preferências de Combate
      </h2>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[#00ffe1] mb-2">
          <Sword size={20} />
          <span>Tipo de Ataque</span>
        </label>
        <select
          value={attackAttribute}
          onChange={(e) => onPreferenceChange('attack', e.target.value as 'physical' | 'magical')}
          className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2"
        >
          <option value="physical">Ataque Físico</option>
          <option value="magical">Ataque Mágico</option>
        </select>
      </div>
    </div>
  );
};