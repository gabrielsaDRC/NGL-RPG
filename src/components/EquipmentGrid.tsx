import React, { useState } from 'react';
import { Equipment, EquipmentCategory } from '../types/character';
import { Modal } from './Modal';

interface EquipmentGridProps {
  equipment: Equipment[];
  onEquipToSlot: (slot: string, equipment: Equipment | null) => void;
  readOnly?: boolean;
}

export const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  equipment,
  onEquipToSlot,
  readOnly = false
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showEquipModal, setShowEquipModal] = useState(false);

  const slots = [
    { id: 'helmet', name: 'Capacete', category: 'helmet' as EquipmentCategory, position: 'head', image: 'helmet.png' },
    { id: 'necklace', name: 'Colar', category: 'necklace' as EquipmentCategory, position: 'neck', image: 'necklace.png' },
    { id: 'earringLeft', name: 'Brinco E', category: 'earring' as EquipmentCategory, position: 'ear-left', image: 'earring.png' },
    { id: 'earringRight', name: 'Brinco D', category: 'earring' as EquipmentCategory, position: 'ear-right', image: 'earring.png' },
    { id: 'cape', name: 'Capa', category: 'cape' as EquipmentCategory, position: 'back', image: 'cape.png' },
    { id: 'armor', name: 'Armadura', category: 'armor' as EquipmentCategory, position: 'chest', image: 'armor.png' },
    { id: 'mainHand', name: 'M. Principal', category: 'weapon' as EquipmentCategory, position: 'hand-right', image: 'weapon.png' },
    { id: 'offHand', name: 'M. Secundária', category: 'shield' as EquipmentCategory, position: 'hand-left', image: 'shield.png' },
    { id: 'gloves', name: 'Luvas', category: 'gloves' as EquipmentCategory, position: 'hands', image: 'gloves.png' },
    { id: 'bracelet', name: 'Bracelete', category: 'bracelet' as EquipmentCategory, position: 'wrist', image: 'bracelet.png' },
    { id: 'ringLeft', name: 'Anel E', category: 'ring' as EquipmentCategory, position: 'ring-left', image: 'ring.png' },
    { id: 'ringRight', name: 'Anel D', category: 'ring' as EquipmentCategory, position: 'ring-right', image: 'ring.png' },
    { id: 'pants', name: 'Calça', category: 'pants' as EquipmentCategory, position: 'legs', image: 'pants.png' },
    { id: 'boots', name: 'Botas', category: 'boots' as EquipmentCategory, position: 'feet', image: 'boots.png' }
  ];

  const getEquippedItem = (slotId: string) => {
    return equipment.find(item => item.slot === slotId);
  };

  const getCompatibleItems = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return [];
    return equipment.filter(item => 
      !item.slot && slot.category === item.category
    );
  };

  const handleSlotClick = (slotId: string) => {
    if (readOnly) return;

    const currentItem = getEquippedItem(slotId);
    if (currentItem) {
      onEquipToSlot(slotId, null);
    } else {
      setSelectedSlot(slotId);
      setShowEquipModal(true);
    }
  };

  const formatBonuses = (item: Equipment) => {
    const bonuses = [];

    if (item.bonuses.length > 0) {
      bonuses.push(
        item.bonuses.map(bonus => {
          const sign = bonus.value >= 0 ? '+' : '';
          return `${bonus.attribute.toUpperCase()} ${sign}${bonus.value}`;
        }).join(', ')
      );
    }

    if (item.statBonuses) {
      const statBonuses = Object.entries(item.statBonuses)
        .filter(([_, value]) => value !== undefined && value !== 0)
        .map(([stat, value]) => {
          const sign = value >= 0 ? '+' : '';
          switch (stat) {
            case 'hp': return `Vida ${sign}${value}`;
            case 'mp': return `Mana ${sign}${value}`;
            case 'physicalDamage': return `Dano Físico ${sign}${value}`;
            case 'magicDamage': return `Dano Mágico ${sign}${value}`;
            case 'attack': return `Ataque ${sign}${value}`;
            case 'magicAttack': return `Ataque Mágico ${sign}${value}`;
            case 'speed': return `Velocidade ${sign}${value}`;
            case 'defense': return `Defesa ${sign}${value}`;
            default: return '';
          }
        })
        .filter(Boolean);

      if (statBonuses.length > 0) {
        bonuses.push(statBonuses.join(', '));
      }
    }

    return bonuses.join(' | ');
  };

  const getRarityColor = (rarity: Equipment['rarity']) => {
    switch (rarity) {
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      case 'artifact': return 'text-red-400';
      default: return 'text-[#00ffe1]';
    }
  };

  const getSlotStyle = (slotId: string) => {
    const item = getEquippedItem(slotId);
    if (!item) return 'opacity-75 hover:opacity-100';
    
    switch (item.rarity) {
      case 'uncommon': return 'text-green-400 [border-color:theme(colors.green.400)_!important] bg-green-900/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
      case 'rare': return 'text-blue-400 [border-color:theme(colors.blue.400)_!important] bg-blue-900/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      case 'epic': return 'text-purple-400 [border-color:theme(colors.purple.400)_!important] bg-purple-900/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'legendary': return 'text-yellow-400 [border-color:theme(colors.yellow.400)_!important] bg-yellow-900/20 shadow-[0_0_10px_rgba(234,179,8,0.3)]';
      case 'artifact': return 'text-red-400 [border-color:theme(colors.red.400)_!important] bg-red-900/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      default: return 'text-[#7d7d7d] [border-color:#7d7d7d_!important] bg-[#7d7d7d]/5 shadow-[0_0_10px_rgba(0,255,225,0.2)]';
    }
  };

  const getSlotPosition = (position: string) => {
    switch (position) {
      case 'head': return 'col-start-2 row-start-1';
      case 'neck': return 'col-start-2 row-start-2';
      case 'ear-left': return 'col-start-1 row-start-1';
      case 'ear-right': return 'col-start-3 row-start-1';
      case 'back': return 'col-start-3 row-start-2';
      case 'chest': return 'col-start-2 row-start-3';
      case 'hand-right': return 'col-start-1 row-start-3';
      case 'hand-left': return 'col-start-3 row-start-3';
      case 'hands': return 'col-start-1 row-start-4';
      case 'wrist': return 'col-start-3 row-start-4';
      case 'ring-left': return 'col-start-1 row-start-5';
      case 'ring-right': return 'col-start-3 row-start-5';
      case 'legs': return 'col-start-2 row-start-4';
      case 'feet': return 'col-start-2 row-start-5';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold text-[#00ffe1] text-center drop-shadow-[0_0_10px_#00ffe1]">
        Equipamento
      </h2>

      <div className="relative w-full max-w-[320px] mx-auto aspect-[3/5] bg-[rgba(0,20,40,0.3)] rounded-xl">
        {/* Character Background Image */}
        <div 
          className="absolute inset-0 opacity-60 bg-center bg-contain bg-no-repeat"
          style={{
            backgroundImage: `url('./images/silhueta_rpg.png')`
          }}
        />

        {/* Magical Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-[#00ffe1]/10 to-transparent opacity-50 rounded-xl" />
          <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-[#00ffe1]/5 to-transparent opacity-30 rounded-xl" />
          
          {/* Sparkles */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#00ffe1] rounded-full animate-ping"
              style={{
                top: `${20 + (i * 15)}%`,
                left: `${20 + (i * 15)}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i}s`
              }}
            />
          ))}
        </div>

        {/* Equipment Grid */}
        <div className="relative grid grid-cols-3 grid-rows-5 gap-2 p-4 h-full">
          {slots.map(slot => {
            const equippedItem = getEquippedItem(slot.id);
            
            return (
              <div
                key={slot.id}
                className={`
                  relative
                  ${getSlotPosition(slot.position)}
                  transform transition-transform duration-300
                  hover:scale-105 hover:z-10
                  group
                `}
              >
                <div
                  className={`
                    w-full h-full min-h-[40px]
                    flex flex-col items-center justify-center gap-1
                    rounded-lg p-2
                    transition-all duration-300
                    border border-white/20
                    ${equippedItem ? getSlotStyle(slot.id) : 'text-white hover:text-[#00ffe1] hover:border-[#00ffe1]/50'}
                    ${!readOnly ? 'cursor-pointer hover:shadow-[0_0_10px_rgba(0,255,225,0.3)]' : ''}
                  `}
                  onClick={() => handleSlotClick(slot.id)}
                >
                  <div 
                    className={`transform transition-all duration-300 group-hover:scale-110 w-8 h-8 bg-contain bg-center bg-no-repeat
                        ${equippedItem ? 'filter brightness-125 drop-shadow-[0_0_8px_rgba(0,255,225,0.7)] invert' : 'filter brightness-0 drop-shadow-[0_0_8px_rgba(0,255,225,0.7)] '}`}
                    style={{
                      backgroundImage: `url('./images/equipment/${slot.image}')`
                    }}
                  />
                  <span className="text-[10px] text-center font-medium truncate w-full opacity-75 group-hover:opacity-100">
                    {slot.name}
                  </span>
                </div>

                {/* Tooltip */}
                {(equippedItem || getCompatibleItems(slot.id).length > 0) && (
                  <div 
                    className="absolute w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]"
                    style={{
                      left: '50%',
                      transform: 'translate(-50%, -100%)',
                      top: '-8px'
                    }}
                  >
                    <div className="relative bg-[#1a1a1a] border border-[#00ffe1] rounded-lg p-2 shadow-lg text-xs">
                      {/* Add a decorative arrow */}
                      <div 
                        className="absolute left-1/2 bottom-0 w-2 h-2 bg-[#1a1a1a] border-r border-b border-[#00ffe1] transform translate-y-1/2 rotate-45 -translate-x-1/2"
                      />
                      
                      {equippedItem ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${getRarityColor(equippedItem.rarity)}`}>
                              {equippedItem.name}
                            </span>
                            <span className="text-[#00ffe1] opacity-75">
                              {equippedItem.durability}/{equippedItem.maxDurability}
                            </span>
                          </div>
                          {formatBonuses(equippedItem) && (
                            <div className="mt-1 text-[#00ffe1] opacity-75">
                              {formatBonuses(equippedItem)}
                            </div>
                          )}
                          <div className="mt-1 text-red-400 text-[10px]">
                            Clique para desequipar
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-[#00ffe1]">
                            {slot.name}
                          </div>
                          <div className="mt-1 text-[#00ffe1] opacity-75">
                            {getCompatibleItems(slot.id).length} item(s) disponível(is)
                          </div>
                          <div className="mt-1 text-[#00ff88] text-[10px]">
                            Clique para equipar
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Selection Modal */}
      <Modal
        isOpen={showEquipModal}
        onClose={() => setShowEquipModal(false)}
        title="Selecionar Equipamento"
      >
        {selectedSlot && (
          <div className="space-y-2">
            {getCompatibleItems(selectedSlot).map(item => (
              <div
                key={item.id}
                className={`
                  bg-[#1a1a1a] p-3 rounded-lg border
                  transition-all duration-300
                  hover:border-[#00ff88] hover:shadow-[0_0_10px_#00ff88]
                  cursor-pointer
                  ${getRarityColor(item.rarity).replace('text-', 'border-')}
                `}
                onClick={() => {
                  onEquipToSlot(selectedSlot, item);
                  setShowEquipModal(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${getRarityColor(item.rarity)}`}>
                    {item.name}
                  </span>
                  <span className="text-[#00ffe1] opacity-75">
                    {item.durability}/{item.maxDurability}
                  </span>
                </div>
                {formatBonuses(item) && (
                  <div className="mt-1 text-sm text-[#00ffe1] opacity-75">
                    {formatBonuses(item)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}