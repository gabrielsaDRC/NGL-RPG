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