import { Character, AttributeBonus, Equipment, Title, EquipmentType, EquipmentRarity, Ability } from '../types/character';

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

  // Only calculate equipment bonuses for equipped items
  character.equipment
    .filter(item => item.slot) // Only include equipped items
    .forEach(item => {
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

  // Calculate active ability bonuses (including passive skills)
  character.abilities
    .filter(ability => 
      ability.type === 'passive_skill' || 
      character.activeAbilities.includes(ability.id)
    )
    .forEach(ability => {
      ability.bonuses.forEach(abilityBonus => {
        bonus[abilityBonus.attribute] += abilityBonus.value;
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

export const calculateStatBonuses = (items: (Equipment | Title | Ability)[]) => {
  const bonuses = {
    hp: 0,
    mp: 0,
    physicalDamage: 0,
    magicDamage: 0,
    attack: 0,
    magicAttack: 0,
    speed: 0,
    defense: 0
  };

  items.forEach(item => {
    // Only apply equipment bonuses if the item is equipped
    if ('type' in item && 'rarity' in item) { // Check if it's an Equipment item
      if (!item.slot) return; // Skip unequipped items
      
      const baseBonus = RARITY_LEVELS[item.rarity].value * 10;
      
      if (item.type === 'weapon') {
        bonuses.attack += baseBonus;
      } else if (item.type === 'armor') {
        bonuses.defense += baseBonus;
      }

      // Add explicit stat bonuses for equipped items
      if (item.statBonuses) {
        Object.entries(item.statBonuses).forEach(([stat, value]) => {
          if (value) {
            bonuses[stat as keyof typeof bonuses] += value;
          }
        });
      }
    } else {
      // For non-equipment items (titles and abilities), apply bonuses normally
      if ('statBonuses' in item && item.statBonuses) {
        Object.entries(item.statBonuses).forEach(([stat, value]) => {
          if (value) {
            bonuses[stat as keyof typeof bonuses] += value;
          }
        });
      }

      // Add ability modifiers
      if ('modifier' in item && item.modifier) {
        const { stat, value } = item.modifier;
        bonuses[stat] += value;
      }
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