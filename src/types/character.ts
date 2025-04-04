export interface Character {
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
  titles: Title[];
  activeTitles: string[];
  fatigue: number;
  currentHp: number;
  currentMp: number;
  combatPreferences: {
    attackAttribute: 'physical' | 'magical';
  };
}

export interface AttributeBonus {
  str: number;
  vit: number;
  agi: number;
  int: number;
  sense: number;
}

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
}

export interface Equipment {
  id: string;
  name: string;
  bonuses: {
    attribute: keyof AttributeBonus;
    value: number;
  }[];
  statBonuses?: {
    hp?: number;
    mp?: number;
    physicalDamage?: number;
    magicDamage?: number;
    attack?: number;
    magicAttack?: number;
    speed?: number;
  };
}

export interface Title {
  id: string;
  name: string;
  bonuses: {
    attribute: keyof AttributeBonus;
    value: number;
  }[];
  statBonuses?: {
    hp?: number;
    mp?: number;
    physicalDamage?: number;
    magicDamage?: number;
    attack?: number;
    magicAttack?: number;
    speed?: number;
  };
}

export type AbilityType = 'attribute_buff' | 'attack_skill' | 'attack_buff' | 'passive_skill';
export type ResourceType = 'mp' | 'fatigue' | 'both' | 'none';
export type StatType = 'physicalDamage' | 'magicDamage';
export type DamageType = 'physical' | 'magical';
export type EquipmentType = 'weapon' | 'armor' | 'accessory';
export type EquipmentRarity = 'mundane' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact';

export interface AbilityCost {
  type: ResourceType;
  mpCost?: number;
  fatigueCost?: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  cost: AbilityCost;
  bonuses: {
    attribute: keyof AttributeBonus;
    value: number;
  }[];
  attack?: {
    value: number;
    damageType: DamageType;
  };
  modifier?: {
    stat: StatType;
    value: number;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description?: string;
}