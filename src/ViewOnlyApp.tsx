import React from 'react';
import { Character, ICharacterStats } from './types/character';
import { calculateBonus } from './utils/character';
import { CharacterPhoto } from './components/CharacterPhoto';
import { CharacterAttributes } from './components/CharacterAttributes';
import { CharacterStats } from './components/CharacterStats';
import { BasicInfo } from './components/BasicInfo';
import { EquipmentSection } from './components/Equipment';
import { AbilitiesSection } from './components/Abilities';
import { TitlesSection } from './components/Titles';
import { Inventory } from './components/Inventory';
import { FatigueSystem } from './components/FatigueSystem';

const ViewOnlyApp: React.FC = () => {
  // Get character data from URL parameter
  const params = new URLSearchParams(window.location.search);
  const characterData = params.get('data');
  
  let character: Character;
  try {
    character = characterData ? JSON.parse(decodeURIComponent(characterData)) : null;
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0018] to-[#130022] p-6 flex items-center justify-center">
        <div className="text-[#00ffe1] text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar personagem</h1>
          <p>Dados inválidos ou corrompidos.</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0018] to-[#130022] p-6 flex items-center justify-center">
        <div className="text-[#00ffe1] text-center">
          <h1 className="text-2xl font-bold mb-4">Nenhum personagem encontrado</h1>
          <p>O link não contém dados de personagem.</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const bonus = calculateBonus(character);
  const maxHp = 100 + ((character.attributes.vit + bonus.vit) * 12);
  const maxMp = 50 + ((character.attributes.int + bonus.int) * 15);
  const physicalDamage = (character.attributes.str + bonus.str) * 2;
  const magicDamage = ((character.attributes.int + bonus.int) * 2.5).toFixed(1);

  const stats: ICharacterStats = {
    hp: maxHp,
    mp: maxMp,
    currentHp: character.currentHp,
    currentMp: character.currentMp,
    physicalDamage,
    magicDamage,
    fatigue: character.fatigue
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0018] to-[#130022] p-6">
      <div className="max-w-6xl mx-auto bg-[rgba(20,0,40,0.95)] p-8 rounded-xl border-2 border-[#00ffe1] shadow-[0_0_20px_#00ffe1]">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-[#00ffe1] tracking-wider drop-shadow-[0_0_10px_#00ffe1]">
            FICHA DE PERSONAGEM
          </h1>
          <span className="text-[#00ffe1] opacity-75">(Modo Visualização)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BasicInfo
            character={character}
            onChange={() => {}}
            readOnly
          />
          <CharacterPhoto
            photo={character.photo}
            onPhotoChange={() => {}}
            onRemovePhoto={() => {}}
            readOnly
          />
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center text-[#00ffe1] mb-6 tracking-wide drop-shadow-[0_0_10px_#00ffe1]">
            Atributos e Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CharacterAttributes
              attributes={character.attributes}
              bonus={bonus}
              onAttributeChange={() => {}}
              remainingPoints={0}
              readOnly
            />
            <CharacterStats
              stats={stats}
              onFatigueChange={() => {}}
              onHpChange={() => {}}
              onMpChange={() => {}}
              readOnly
            />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <FatigueSystem
            fatigue={character.fatigue}
            onFatigueChange={() => {}}
            readOnly
          />
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center text-[#00ffe1] mb-6 tracking-wide drop-shadow-[0_0_10px_#00ffe1]">
            Equipamentos e Habilidades
          </h2>
          <div className="grid grid-cols-1 gap-8">
            <EquipmentSection
              equipment={character.equipment}
              onEquipmentChange={() => {}}
              readOnly
            />
            <AbilitiesSection
              abilities={character.abilities}
              onAbilitiesChange={() => {}}
              onResourceChange={async () => false}
              activeAbilities={[]}
              onToggleAbility={() => {}}
              onAbilityRoll={() => {}}
              readOnly
            />
          </div>
        </div>

        <div className="mt-12">
          <TitlesSection
            titles={character.titles}
            onTitlesChange={() => {}}
            readOnly
          />
        </div>

        <div className="mt-12">
          <Inventory
            inventory={character.inventory}
            onInventoryChange={() => {}}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyApp;