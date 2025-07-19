import React, { useState } from 'react';
import { Equipment, EquipmentCategory } from '../types/character';
import { Modal } from './Modal';
import { Sparkles, Star, Crown, Zap, Shield, Sword } from 'lucide-react';

interface EquipmentGridProps {
  equipment: Equipment[];
  onEquipToSlot: (slot: string, equipment: Equipment | null) => void;
  readOnly?: boolean;
}

const RARITY_STYLES = {
  mundane: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/20',
    borderColor: 'border-gray-400/50',
    glowColor: 'shadow-[0_0_15px_rgba(156,163,175,0.3)]',
    icon: <div className="w-4 h-4 bg-gray-400 rounded-full" />
  },
  uncommon: {
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-400/50',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]',
    icon: <Sparkles className="w-4 h-4 text-green-400" />
  },
  rare: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-400/50',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    icon: <Zap className="w-4 h-4 text-blue-400" />
  },
  epic: {
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-400/50',
    glowColor: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    icon: <Star className="w-4 h-4 text-purple-400" />
  },
  legendary: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-400/50',
    glowColor: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
    icon: <Crown className="w-4 h-4 text-yellow-400" />
  },
  artifact: {
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-400/50',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    icon: <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-orange-400 rounded-full animate-pulse" />
  }
};

export const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  equipment,
  onEquipToSlot,
  readOnly = false
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  const getRarityStyle = (rarity: Equipment['rarity']) => {
    return RARITY_STYLES[rarity] || RARITY_STYLES.mundane;
  };

  const getSlotStyle = (slotId: string) => {
    const item = getEquippedItem(slotId);
    if (!item) return 'opacity-75 hover:opacity-100';
    
    const rarityStyle = getRarityStyle(item.rarity);
    return `${rarityStyle.color} [border-color:${rarityStyle.borderColor.split('-')[1]}_!important] ${rarityStyle.bgColor} ${rarityStyle.glowColor}`;
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

  const handleEquipItem = (item: Equipment) => {
    if (selectedSlot) {
      onEquipToSlot(selectedSlot, item);
      setShowEquipModal(false);
      setSelectedSlot(null);
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
                            <span className={`font-medium ${getRarityStyle(equippedItem.rarity).color}`}>
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

      {/* Enhanced Equipment Selection Modal */}
      <Modal
        isOpen={showEquipModal}
        onClose={() => setShowEquipModal(false)}
        title="ARSENAL MÁGICO"
      >
        <div className="relative space-y-8">
          {/* Magical Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-12 h-12 border border-[#00ffe1]/30"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animation: `float ${3 + Math.random() * 4}s infinite ease-in-out ${Math.random() * 3}s`
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Header Section */}
            <div className="text-center space-y-4 mb-8">
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-[#00ffe1]/20 animate-pulse" />
                  <div className="relative p-3 rounded-full border-2 border-[#00ffe1] bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5 shadow-[0_0_20px_#00ffe1]">
                    <Shield className="w-8 h-8 text-[#00ffe1]" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#00ffe1] tracking-wider drop-shadow-[0_0_15px_#00ffe1]">
                  ARSENAL MÁGICO
                </h3>
              </div>
              <p className="text-[#00ffe1]/70 text-lg">
                Escolha um equipamento para {selectedSlot ? slots.find(s => s.id === selectedSlot)?.name : 'equipar'}
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/50 to-transparent mb-8" />

            {/* Equipment Grid */}
            {selectedSlot && (
              <div className="space-y-6">
                {getCompatibleItems(selectedSlot).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative inline-block">
                      <div className="absolute -inset-4 rounded-full bg-[#00ffe1]/10 animate-pulse" />
                      <div className="relative p-6 rounded-full border-2 border-[#00ffe1]/30 bg-[#001830]">
                        <Sword className="w-12 h-12 text-[#00ffe1]/50" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-[#00ffe1] mt-4 mb-2">
                      Arsenal Vazio
                    </h4>
                    <p className="text-[#00ffe1]/70">
                      Nenhum equipamento compatível encontrado
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getCompatibleItems(selectedSlot).map(item => {
                      const rarityStyle = getRarityStyle(item.rarity);
                      const isHovered = hoveredItem === item.id;
                      
                      return (
                        <div
                          key={item.id}
                          className={`
                            group relative overflow-hidden
                            bg-[#001830] p-6 rounded-xl border-2 transition-all duration-500 cursor-pointer
                            ${rarityStyle.borderColor} ${rarityStyle.glowColor}
                            hover:z-10
                            ${isHovered ? 'shadow-[0_0_30px_rgba(0,255,225,0.6)]' : ''}
                          `}
                          onClick={() => handleEquipItem(item)}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          {/* Magical Shine Effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          </div>

                          {/* Floating Particles */}
                          <div className="absolute inset-0 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className={`absolute w-1 h-1 rounded-full ${rarityStyle.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                style={{
                                  top: `${Math.random() * 100}%`,
                                  left: `${Math.random() * 100}%`,
                                  animation: `magical-sparkle ${2 + Math.random() * 3}s infinite ease-in-out ${Math.random() * 2}s`
                                }}
                              />
                            ))}
                          </div>

                          <div className="relative">
                            {/* Header with Rarity */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg border ${rarityStyle.borderColor} bg-gradient-to-br ${rarityStyle.bgColor} ${rarityStyle.glowColor}`}>
                                  {rarityStyle.icon}
                                </div>
                                <div>
                                  <h4 className={`text-lg font-bold ${rarityStyle.color} drop-shadow-lg`}>
                                    {item.name}
                                  </h4>
                                  <span className={`text-xs px-2 py-1 rounded-full border ${rarityStyle.borderColor} ${rarityStyle.color} bg-gradient-to-r ${rarityStyle.bgColor} font-bold tracking-wider`}>
                                    {item.rarity.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {/* Durability Indicator */}
                              <div className="text-right">
                                <div className="text-[#00ffe1] text-sm font-medium">
                                  {item.durability}/{item.maxDurability}
                                </div>
                                <div className="w-16 h-1 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#00ffe1]/30">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      (item.durability / item.maxDurability) > 0.5
                                        ? 'bg-[#00ff88]'
                                        : (item.durability / item.maxDurability) > 0.25
                                        ? 'bg-yellow-400'
                                        : 'bg-red-400'
                                    }`}
                                    style={{ width: `${(item.durability / item.maxDurability) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Bonuses Display */}
                            {formatBonuses(item) && (
                              <div className="mb-4 p-3 bg-[#002040] rounded-lg border border-[#00ffe1]/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-4 h-4 text-[#00ffe1]" />
                                  <span className="text-[#00ffe1] font-medium text-sm">Propriedades Mágicas</span>
                                </div>
                                <div className="text-[#00ffe1]/90 text-sm leading-relaxed">
                                  {formatBonuses(item)}
                                </div>
                              </div>
                            )}

                            {/* Equipment Type */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00ffe1] animate-pulse" />
                                <span className="text-[#00ffe1]/70 text-sm">
                                  {item.type === 'weapon' ? 'Arma' : item.type === 'armor' ? 'Armadura' : 'Acessório'}
                                </span>
                              </div>
                              
                              {/* Hover Indicator */}
                              <div className={`
                                flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300
                                ${isHovered 
                                  ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]' 
                                  : 'border-[#00ffe1]/30 text-[#00ffe1]/50'
                                }
                              `}>
                                <span className="text-xs font-bold tracking-wider">
                                  {isHovered ? 'EQUIPAR' : 'CLIQUE'}
                                </span>
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  isHovered ? 'bg-[#00ff88] animate-pulse' : 'bg-[#00ffe1]/30'
                                }`} />
                              </div>
                            </div>
                          </div>

                          {/* Selection Glow Effect */}
                          {isHovered && (
                            <div className="absolute inset-0 rounded-xl border-2 border-[#00ff88] pointer-events-none">
                              <div className="absolute inset-0 bg-[#00ff88]/5 rounded-xl animate-pulse" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}