import { Character } from '../types/character';

export const exportCharacter = (character: Character) => {
  const dataStr = JSON.stringify(character);
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