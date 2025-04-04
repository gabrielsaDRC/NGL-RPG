import { Character, AttributeBonus, Equipment, Title, EquipmentType, EquipmentRarity } from '../types/character';

export const calculateTotalPoints = (level: number): number => {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += (i % 10 === 0) ? 6 : 3;
  }
  return total;
};

export const calculateBonus = (character: Character): AttributeBonus => {
  const bonus: AttributeBonus = {
    str: 0,
    vit: 0,
    agi: 0,
    int: 0,
    sense: 0
  };

  // Calculate equipment bonuses
  character.equipment.forEach(item => {
    item.bonuses.forEach(itemBonus => {
      bonus[itemBonus.attribute] += itemBonus.value;
    });
  });

  // Calculate active title bonuses
  character.titles
    .filter(title => character.activeTitles.includes(title.id))
    .forEach(title => {
      title.bonuses.forEach(titleBonus => {
        bonus[titleBonus.attribute] += titleBonus.value;
      });
    });

  return bonus;
};

const RARITY_LEVELS: Record<EquipmentRarity, { value: number }> = {
  mundane: { value: 1 },
  uncommon: { value: 2 },
  rare: { value: 3 },
  epic: { value: 4 },
  legendary: { value: 5 },
  artifact: { value: 6 }
};

export const calculateStatBonuses = (items: (Equipment | Title)[]) => {
  const bonuses = {
    hp: 0,
    mp: 0,
    physicalDamage: 0,
    magicDamage: 0,
    attack: 0,
    magicAttack: 0,
    speed: 0
  };

  items.forEach(item => {
    // Add base bonuses for equipment based on type and rarity
    if ('type' in item) { // Check if it's an Equipment item
      const baseBonus = RARITY_LEVELS[item.rarity].value * 10;
      
      if (item.type === 'weapon') {
        if (item.damageType === 'physical') {
          bonuses.attack += baseBonus;
        } else {
          bonuses.magicAttack += baseBonus;
        }
      }
    }

    // Add explicit stat bonuses
    if (item.statBonuses) {
      Object.entries(item.statBonuses).forEach(([stat, value]) => {
        if (value) {
          bonuses[stat as keyof typeof bonuses] += value;
        }
      });
    }
  });

  return bonuses;
};

export const calculateSpeed = (agi: number): number => {
  return agi + Math.floor(agi * 0.5);
};

export const calculatePhysicalDamage = (str: number): number => {
  return str * 2;
};

export const calculateMagicDamage = (int: number): number => {
  return int * 2.5;
};

export const calculatePhysicalAttack = (str: number): number => {
  return str;
};

export const calculateMagicAttack = (int: number): number => {
  return int;
};