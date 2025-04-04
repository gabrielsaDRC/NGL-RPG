import html2canvas from 'html2canvas';
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

export const exportAsPNG = async () => {
  const element = document.getElementById('character-sheet');
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = 'character-sheet.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting as PNG:', error);
  }
};