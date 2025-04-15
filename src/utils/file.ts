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

export const getViewOnlyUrl = (character: Character) => {
  const baseUrl = window.location.origin + window.location.pathname;
  
  // Create a copy of the character without the photo
  const characterWithoutPhoto = {
    ...character,
    photo: '' // Remove the photo data
  };
  
  const data = encodeURIComponent(JSON.stringify(characterWithoutPhoto));
  return `${baseUrl}?data=${data}`;
};