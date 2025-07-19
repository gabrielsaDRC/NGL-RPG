// Add new type for character ID
export interface Character {
  id: string;
  name: string;
  class: string;
  age: number;
  level: number;
  photo: string;
  attributes: {
    str: number;
    vit: number;
    agi: number;
    int: number;
    sense: number;
  };
  equipment: Equipment[];
  abilities: Ability[];
  inventory: InventoryItem[];
  currency: {
    bronze: number;
    silver: number;
    gold: number;
  };
  titles: Title[];
  activeTitles: string[];
  activeAbilities: string[];
  fatigue: number;
  currentHp: number;
  currentMp: number;
  combatPreferences: {
    attackAttribute: 'physical' | 'magical';
  };
}

// Add new type for presence data
export interface PresenceState {
  user: string;
  character?: {
    name: string;
    class: string;
    level: number;
    attributes: {
      str: number;
      vit: number;
      agi: number;
      int: number;
      sense: number;
    };
    currentHp: number;
    maxHp: number;
    currentMp: number;
    maxMp: number;
    fatigue: number;
    physicalDamage: number;
    magicDamage: string;
    attack: number;
    magicAttack: number;
    speed: number;
    defense: number;
  };
  online_at: string;
}

export interface AttributeBonus {
  str: number;
  vit: number;
  agi: number;
  int: number;
  sense: number;
}

export type TitleCategory = 'heroico' | 'nobre' | 'combate' | 'mistico';

export interface Title {
  id: string;
  name: string;
  category?: TitleCategory;
  bonuses: { attribute: keyof AttributeBonus; value: number }[];
  statBonuses?: {
    hp?: number;
    mp?: number;
    physicalDamage?: number;
    magicDamage?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  };
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  category: EquipmentCategory;
  rarity: EquipmentRarity;
  durability: number;
  maxDurability: number;
  damageType?: DamageType;
  bonuses: { attribute: keyof AttributeBonus; value: number }[];
  statBonuses?: {
    hp?: number;
    mp?: number;
    physicalDamage?: number;
    magicDamage?: number;
    attack?: number;
    magicAttack?: number;
    speed?: number;
    defense?: number;
  };
  slot?: string;
}

export type EquipmentType = 'weapon' | 'armor' | 'accessory';
export type EquipmentCategory = 'ring' | 'earring' | 'necklace' | 'helmet' | 'armor' | 'pants' | 'boots' | 'cape' | 'gloves' | 'bracelet' | 'weapon' | 'shield';
export type EquipmentRarity = 'mundane' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact';
export type DamageType = 'physical' | 'magical';

export interface Ability {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  cost: {
    type: ResourceType;
    mpCost?: number;
    fatigueCost?: number;
  };
  bonuses: { attribute: keyof AttributeBonus; value: number }[];
  attack?: {
    value: number;
    damageType: 'physical' | 'magical';
  };
  modifier?: {
    stat: StatType;
    value: number;
  };
  statBonuses?: {
    hp?: number;
    mp?: number;
    physicalDamage?: number;
    magicDamage?: number;
    attack?: number;
    magicAttack?: number;
    speed?: number;
    defense?: number;
  };
}

export type AbilityType = 'attribute_buff' | 'attack_skill' | 'passive_skill';
export type ResourceType = 'mp' | 'fatigue' | 'both' | 'none';
export type StatType = 'physicalDamage' | 'magicDamage';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  category: ItemCategory;
  weight: number;
  value: {
    bronze: number;
    silver: number;
    gold: number;
  };
  isStackable: boolean;
  maxStack?: number;
  effects?: string[];
}

export type ItemCategory = 'consumable' | 'material' | 'quest' | 'misc';

export interface ICharacterStats {
  hp: number;
  mp: number;
  currentHp: number;
  currentMp: number;
  physicalDamage: number;
  magicDamage: string;
  fatigue: number;
  attack: number;
  magicAttack: number;
  speed: number;
  defense: number;
}