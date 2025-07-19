import React from 'react';
import { Sword, Heart, Wind, Brain, Crosshair } from 'lucide-react';
import { AttributeBonus } from '../types/character';
import { FatigueGauge } from '../components/FatigueGauge';
import { AttributePentagon } from './AttributePentagon';

interface CharacterAttributesProps {
  attributes: {
    str: number;
    vit: number;
    agi: number;
    int: number;
    sense: number;
  };
  bonus: AttributeBonus;
  onAttributeChange: (attr: keyof typeof attributes, value: number) => void;
  remainingPoints: number;
  readOnly?: boolean;
  showFatigue?: boolean;
  fatigue?: number; // Add this line
}

export const CharacterAttributes: React.FC<CharacterAttributesProps> = ({
  attributes,
  bonus,
  onAttributeChange,
  remainingPoints,
  readOnly = false,
  showFatigue = true,
  fatigue = 0 // Add this with a default value
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${showFatigue ? '3' : '2'} gap-6`}>
      <div className="flex items-center justify-center">
        <div className="w-[300px]">
          <AttributePentagon attributes={attributes} bonus={bonus} />
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[400px] space-y-4">
          {Object.entries(attributes).map(([attr, value]) => (
            <div key={attr} className="flex items-center gap-4">
              <label className="flex items-center w-24 text-[#00ffe1] drop-shadow-[0_0_5px_#00ffe1]">
                {attr === 'str' && <Sword size={20} className="mr-2 drop-shadow-[0_0_5px_#00ffe1]" />}
                {attr === 'vit' && <Heart size={20} className="mr-2 drop-shadow-[0_0_5px_#00ffe1]" />}
                {attr === 'agi' && <Wind size={20} className="mr-2 drop-shadow-[0_0_5px_#00ffe1]" />}
                {attr === 'int' && <Brain size={20} className="mr-2 drop-shadow-[0_0_5px_#00ffe1]" />}
                {attr === 'sense' && <Crosshair size={20} className="mr-2 drop-shadow-[0_0_5px_#00ffe1]" />}
                {attr.toUpperCase()}
              </label>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => onAttributeChange(attr as keyof typeof attributes, parseInt(e.target.value) || 5)}
                  min="5"
                  disabled={readOnly}
                  className="w-20 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-2 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ff88] transition-all disabled:opacity-50"
                />

                <span className={`px-3 py-1 rounded ${bonus[attr as keyof typeof bonus] >= 0 ? 'bg-[#004400] text-[#00ff88]' : 'bg-[#440000] text-[#ff4444]'}`}>
                  {bonus[attr as keyof typeof bonus] >= 0 ? '+' : ''}{bonus[attr as keyof typeof bonus]}
                </span>

                <span className="w-16 px-3 py-1 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg text-center">
                  = {value + bonus[attr as keyof typeof bonus]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showFatigue && (
        <div className="flex items-center justify-center">
          <div className="w-[270px]">
            <FatigueGauge value={fatigue} />
          </div>
        </div>
      )}
    </div>
  );
};