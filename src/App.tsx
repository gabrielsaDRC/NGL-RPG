import React, { useState, useEffect } from 'react';
import { Save, Upload, Camera, Share2 } from 'lucide-react';
import { Character, ICharacterStats, ResourceType, Equipment } from './types/character';
import { calculateTotalPoints, calculateBonus, calculateSpeed, calculatePhysicalDamage, calculateMagicDamage, calculateStatBonuses } from './utils/character';
import { exportCharacter, getViewOnlyUrl } from './utils/file';
import { exportAsPNG } from './utils/export';
import { CharacterPhoto } from './components/CharacterPhoto';
import { CharacterAttributes } from './components/CharacterAttributes';
import { CharacterStats } from './components/CharacterStats';
import { BasicInfo } from './components/BasicInfo';
import { EquipmentSection } from './components/Equipment';
import { EquipmentGrid } from './components/EquipmentGrid';
import { AbilitiesSection } from './components/AbilitiesSection';
import { TitlesSection } from './components/Titles';
import { Inventory } from './components/Inventory';
import { FatigueSystem } from './components/FatigueSystem';
import { DiceRoller } from './components/DiceRoller';
import { CombatPreferences } from './components/CombatPreferences';
import { CombatSystem } from './components/CombatSystem';
import { WebhookSettingsPanel } from './components/WebhookSettings';
import { ChatSystem } from './components/ChatSystem';
import { MapSystem } from './components/MapSystem';
import { WebhookSettings } from './types/webhook';

import { sendWebhookMessage, createDiceRollMessage, createAbilityMessage, createFatigueMessage } from './utils/webhook';

function App() {
  const initialAttributes = {
    str: 5,
    vit: 5,
    agi: 5,
    int: 5,
    sense: 5
  };

  const initialHp = 100 + (initialAttributes.vit * 12);
  const initialMp = 50 + (initialAttributes.int * 15);

  const [character, setCharacter] = useState<Character>({
    name: '',
    class: '',
    age: 18,
    level: 1,
    photo: '',
    attributes: initialAttributes,
    equipment: [],
    abilities: [],
    inventory: [],
    titles: [],
    activeTitles: [],
    activeAbilities: [],
    fatigue: 0,
    currentHp: initialHp,
    currentMp: initialMp,
    combatPreferences: {
      attackAttribute: 'physical'
    }
  });

  const [remainingPoints, setRemainingPoints] = useState(50);
  const [webhookSettings, setWebhookSettings] = useState<WebhookSettings>({
    urls: [],
    selectedUrl: null
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCharacter(prev => ({ ...prev, photo: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleBasicInfoChange = (field: keyof Character, value: string | number) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const handleAttributeChange = (attr: keyof typeof character.attributes, value: number) => {
    const currentValue = character.attributes[attr];
    const pointDifference = value - currentValue;
    
    if (remainingPoints - pointDifference < 0 && value > currentValue) {
      return;
    }

    const newValue = Math.max(5, value);
    setCharacter(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: newValue
      }
    }));
  };

  const handleFatigueChange = async (value: number, action?: string) => {
    const change = value - character.fatigue;
    setCharacter(prev => ({
      ...prev,
      fatigue: value
    }));

    if (action && webhookSettings.selectedUrl) {
      try {
        const message = createFatigueMessage(character, action, change, value);
        await sendWebhookMessage(webhookSettings.selectedUrl, message);
      } catch (error) {
        console.error('Erro ao enviar mensagem de fadiga:', error);
      }
    }
  };

  const handleHpChange = (value: number) => {
    setCharacter(prev => ({
      ...prev,
      currentHp: value
    }));
  };

  const handleMpChange = (value: number) => {
    setCharacter(prev => ({
      ...prev,
      currentMp: value
    }));
  };

  const handleResourceChange = async (type: ResourceType, value: number, abilityName?: string): Promise<boolean> => {
    if (type === 'mp') {
      if (character.currentMp < value) {
        alert('Mana insuficiente!');
        return false;
      }
      setCharacter(prev => ({
        ...prev,
        currentMp: Math.max(0, prev.currentMp - value)
      }));
    } else if (type === 'fatigue') {
      const newFatigue = Math.min(120, character.fatigue + value);
      setCharacter(prev => ({
        ...prev,
        fatigue: newFatigue
      }));
    } else if (type === 'both') {
      if (character.currentMp < value) {
        alert('Mana insuficiente!');
        return false;
      }
      const newFatigue = Math.min(120, character.fatigue + value);
      setCharacter(prev => ({
        ...prev,
        currentMp: Math.max(0, prev.currentMp - value),
        fatigue: newFatigue
      }));
    }
    return true;
  };

  const handleToggleAbility = (abilityId: string) => {
    const ability = character.abilities.find(a => a.id === abilityId);
    if (!ability) return;

    setCharacter(prev => ({
      ...prev,
      activeAbilities: prev.activeAbilities.includes(abilityId)
        ? prev.activeAbilities.filter(id => id !== abilityId)
        : [...prev.activeAbilities, abilityId]
    }));

    if (webhookSettings.selectedUrl) {
      try {
        const message = createAbilityMessage(
          character,
          ability.name,
          ability.type,
          ability.cost,
          undefined,
          character.activeAbilities.includes(abilityId)
        );
        sendWebhookMessage(webhookSettings.selectedUrl, message);
      } catch (error) {
        console.error('Erro ao enviar mensagem de ativação/desativação:', error);
      }
    }
  };

  const handleAbilityRoll = async (
    abilityName: string,
    diceType: number,
    rolls: number[],
    total: number,
    cost: { type: ResourceType; value: number }
  ) => {
    if (!webhookSettings.selectedUrl) return;

    try {
      const ability = character.abilities.find(a => a.name === abilityName);
      if (!ability) return;

      const message = createAbilityMessage(
        character,
        abilityName,
        ability.type,
        ability.cost,
        { diceType, rolls, total }
      );
      await sendWebhookMessage(webhookSettings.selectedUrl, message);
    } catch (error) {
      console.error('Erro ao enviar mensagem de rolagem:', error);
    }
  };

  const handleDiceRoll = async (
    diceType: number,
    rolls: number[],
    total: number,
    context?: string,
    attributeValue?: number,
    isCritical?: boolean
  ) => {
    if (!webhookSettings.selectedUrl) return;

    try {
      const message = await createDiceRollMessage(character, diceType, rolls, total, context, attributeValue, isCritical);
      await sendWebhookMessage(webhookSettings.selectedUrl, message);
    } catch (error) {
      console.error('Erro ao enviar mensagem de rolagem:', error);
    }
  };

  const handleCombatPreferenceChange = (type: 'attack', attribute: 'physical' | 'magical') => {
    setCharacter(prev => ({
      ...prev,
      combatPreferences: {
        ...prev.combatPreferences,
        attackAttribute: attribute
      }
    }));
  };

  const handleEquipToSlot = (slot: string, equipment: Equipment | null) => {
    setCharacter(prev => ({
      ...prev,
      equipment: prev.equipment.map(item => 
        item.slot === slot ? { ...item, slot: undefined } : item
      ).map(item => 
        item.id === equipment?.id ? { ...item, slot } : item
      )
    }));
  };

  const importCharacter = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          if ('character' in importedData && 'webhookSettings' in importedData) {
            setCharacter(importedData.character);
            setWebhookSettings(importedData.webhookSettings);
          } else {
            setCharacter(importedData);
          }
        } catch (error) {
          alert('Arquivo de personagem inválido');
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const bonus = calculateBonus(character);
  const statBonuses = calculateStatBonuses([
    ...character.equipment,
    ...character.titles.filter(title => character.activeTitles.includes(title.id)),
    ...character.abilities.filter(ability => 
      ability.type === 'passive_skill' || 
      character.activeAbilities.includes(ability.id)
    )
  ]);
  
  const maxHp = 100 + ((character.attributes.vit + bonus.vit) * 12) + (statBonuses.hp || 0);
  const maxMp = 50 + ((character.attributes.int + bonus.int) * 15) + (statBonuses.mp || 0);

  const stats: ICharacterStats = {
    hp: maxHp,
    mp: maxMp,
    currentHp: character.currentHp,
    currentMp: character.currentMp,
    physicalDamage: calculatePhysicalDamage(character.attributes.str + bonus.str) + (statBonuses.physicalDamage || 0),
    magicDamage: (calculateMagicDamage(character.attributes.int + bonus.int) + (statBonuses.magicDamage || 0)).toFixed(1),
    fatigue: character.fatigue,
    attack: character.attributes.str + bonus.str + (statBonuses.attack || 0),
    magicAttack: character.attributes.int + bonus.int + (statBonuses.magicAttack || 0),
    speed: calculateSpeed(character.attributes.agi + bonus.agi) + (statBonuses.speed || 0),
    defense: character.attributes.vit + bonus.vit + (statBonuses.defense || 0)
  };

  useEffect(() => {
    const basePoints = 50;
    const levelPoints = calculateTotalPoints(character.level);
    const totalPoints = basePoints + levelPoints;
    const usedPoints = Object.values(character.attributes).reduce((acc, val) => acc + (val - 5), 0);
    setRemainingPoints(totalPoints - usedPoints);
  }, [character.level, character.attributes]);

  const handleToggleTitle = (id: string) => {
    setCharacter(prev => ({
      ...prev,
      activeTitles: prev.activeTitles.includes(id) ? [] : [id]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000c1a] to-[#001830] p-2 sm:p-4 md:p-6">
      <WebhookSettingsPanel
        settings={webhookSettings}
        onSettingsChange={setWebhookSettings}
      />

      <div id="character-sheet" className="max-w-6xl mx-auto bg-[rgba(0,20,40,0.95)] p-4 sm:p-6 md:p-8 rounded-xl border-2 border-[#00ffe1] shadow-[0_0_20px_#00ffe1]">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#00ffe1] mb-6 md:mb-8 tracking-wider drop-shadow-[0_0_10px_#00ffe1]">
          FICHA DE PERSONAGEM
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
            <BasicInfo character={character} onChange={handleBasicInfoChange} />
            <CharacterPhoto
              photo={character.photo}
              onPhotoChange={handlePhotoChange}
              onRemovePhoto={() => setCharacter(prev => ({ ...prev, photo: '' }))}
            />
          </div>
          <EquipmentGrid
            equipment={character.equipment}
            onEquipToSlot={handleEquipToSlot}
          />
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-[#00ffe1] mb-4 sm:mb-6 tracking-wide drop-shadow-[0_0_10px_#00ffe1]">
            Atributos e Status
          </h2>
          <p className="text-center mb-4 sm:mb-6 text-lg sm:text-xl font-semibold tracking-wide text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            Pontos restantes:{' '}
            <span className={remainingPoints > 0 ? 'text-[#00ff88]' : 'text-white'}>
              {remainingPoints}
            </span>
          </p>

          <div className="space-y-8">
            <CharacterAttributes
              attributes={character.attributes}
              bonus={bonus}
              onAttributeChange={handleAttributeChange}
              remainingPoints={remainingPoints}
              fatigue={character.fatigue}
            />
            <CharacterStats
              stats={stats}
              onFatigueChange={handleFatigueChange}
              onHpChange={handleHpChange}
              onMpChange={handleMpChange}
            />
          </div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <FatigueSystem
              fatigue={character.fatigue}
              onFatigueChange={handleFatigueChange}
            />
            <CombatPreferences
              attackAttribute={character.combatPreferences.attackAttribute}
              onPreferenceChange={handleCombatPreferenceChange}
            />
            <CombatSystem
              character={character}
              stats={stats}
              onResourceChange={handleResourceChange}
              onToggleAbility={handleToggleAbility}
              onAbilityRoll={handleAbilityRoll}
            />
            <DiceRoller
              character={character}
              stats={stats}
              onRoll={handleDiceRoll}
            />
          </div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
            <EquipmentSection
              equipment={character.equipment}
              onEquipmentChange={(equipment) => setCharacter(prev => ({ ...prev, equipment }))}
            />
            <AbilitiesSection
              abilities={character.abilities}
              onAbilitiesChange={(abilities) => setCharacter(prev => ({ ...prev, abilities }))}
              onResourceChange={handleResourceChange}
              activeAbilities={character.activeAbilities}
              onToggleAbility={handleToggleAbility}
              onAbilityRoll={handleAbilityRoll}
              stats={stats}
            />
          </div>
        </div>

        <div className="mt-12">
          <TitlesSection
            titles={character.titles}
            activeTitles={character.activeTitles}
            onTitlesChange={(titles) => setCharacter(prev => ({ ...prev, titles }))}
            onToggleTitle={handleToggleTitle}
          />
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12">
          <Inventory
            inventory={character.inventory}
            onInventoryChange={(inventory) => setCharacter(prev => ({ ...prev, inventory }))}
          />
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12">
          <ChatSystem character={character} />
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 hidden">
          <MapSystem characters={[]}/>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
            onClick={() => exportCharacter(character, webhookSettings)}
            className="flex items-center space-x-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 sm:px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            <Save size={18} />
            <span>Exportar JSON</span>
          </button>
          <button
            onClick={exportAsPNG}
            className="flex items-center space-x-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 sm:px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            <Camera size={18} />
            <span>Exportar PNG</span>
          </button>
          <label className="flex items-center space-x-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 sm:px-4 py-2 hover:bg-[#2a2a2a] transition-colors cursor-pointer">
            <Upload size={18} />
            <span>Importar</span>
            <input
              type="file"
              accept=".json"
              onChange={importCharacter}
              className="hidden"
            />
          </label>
          <button
            onClick={() => {
              const url = getViewOnlyUrl(character);
              navigator.clipboard.writeText(url);
              alert('Link copiado para a área de transferência!');
            }}
            className="flex items-center space-x-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 sm:px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            <Share2 size={18} />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;