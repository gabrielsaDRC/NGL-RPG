import { Character } from '../types/character';
import { WebhookSettings } from '../types/webhook';

interface SaveData {
  character: Character;
  webhookSettings: WebhookSettings;
}

export const exportCharacter = (character: Character, webhookSettings: WebhookSettings) => {
  const saveData: SaveData = {
    character,
    webhookSettings
  };
  
  const dataStr = JSON.stringify(saveData);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = `${character.name || 'character'}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};