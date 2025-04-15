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