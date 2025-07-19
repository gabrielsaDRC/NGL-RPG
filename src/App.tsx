import React, { useState, useEffect } from 'react';
import { Save, Upload, Camera, Share2, Bell } from 'lucide-react';
import { Character, ICharacterStats, ResourceType, Equipment } from './types/character';
import { calculateTotalPoints, calculateBonus, calculateSpeed, calculatePhysicalDamage, calculateMagicDamage, calculateStatBonuses } from './utils/character';
import { exportCharacter } from './utils/file';
import { exportAsPNG } from './utils/export';
import { WelcomeScreen } from './components/WelcomeScreen';
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
import { NotificationSystem } from './components/NotificationSystem';
import { Modal } from './components/Modal';
import { WebhookSettings } from './types/webhook';
import { sendNotification } from './utils/notifications';
import { sendWebhookMessage, createDiceRollMessage, createAbilityMessage, createFatigueMessage } from './utils/webhook';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTarget, setNotificationTarget] = useState('');
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    const hasAccepted = false;
    if (hasAccepted) {
      setShowWelcome(false);
    }
  }, []);

  const handleAccept = (role: 'player' | 'master') => {
    setIsMaster(role === 'master');
    setShowWelcome(false);
  };

  const handleSendNotification = async () => {
    const sessionId = localStorage.getItem('rpg-session-id');
    if (!sessionId || !notificationTitle.trim() || !notificationMessage.trim()) return;

    await sendNotification(
      sessionId,
      notificationTitle,
      notificationMessage,
      'info',
      notificationTarget || undefined
    );

    setNotificationTitle('');
    setNotificationMessage('');
    setNotificationTarget('');
    setShowNotificationModal(false);
  };

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
    currency: {
      bronze: 0,
      silver: 0,
      gold: 0
    },
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

  if (showWelcome) {
    return <WelcomeScreen onAccept={handleAccept} />;
  }

  // Simplified master view
  if (isMaster) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000c1a] to-[#001830] p-2 sm:p-4 md:p-6">
        <NotificationSystem character={character} />
        <WebhookSettingsPanel
          settings={webhookSettings}
          onSettingsChange={setWebhookSettings}
        />

        <div className="max-w-6xl mx-auto bg-[rgba(0,20,40,0.95)] p-4 sm:p-6 md:p-8 rounded-xl border-2 border-[#00ffe1] shadow-[0_0_20px_#00ffe1]">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#00ffe1] mb-6 md:mb-8 tracking-wider drop-shadow-[0_0_10px_#00ffe1]">
            MESTRE
          </h1>

          <div className="space-y-8">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do Mestre"
                className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_15px_#00ff88] transition-all"
              />
            </div>

            <ChatSystem character={character} onCharacterUpdate={setCharacter} />

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowNotificationModal(true)}
                className="flex items-center space-x-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 sm:px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
              >
                <Bell size={18} />
                <span>Notificar</span>
              </button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          title="SISTEMA"
        >
          <div className="relative space-y-8">
            <div className="text-center space-y-2">
              <p className="text-xl text-[#00ffe1]/70">
                Notificação do Sistema
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/30 to-transparent" />

            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                  placeholder="Título da Notificação"
                />
              </div>

              <div>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                  placeholder="Mensagem da Notificação"
                  rows={4}
                />
              </div>

              <div>
                <select
                  value={notificationTarget}
                  onChange={(e) => setNotificationTarget(e.target.value)}
                  className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
                >
                  <option value="">Todos os jogadores</option>
                  {/* Connected users will be populated here */}
                </select>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSendNotification}
                  disabled={!notificationTitle.trim() || !notificationMessage.trim()}
                  className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                  </div>

                  <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
                    <Bell className="w-5 h-5" />
                    <span>ENVIAR</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Full player view
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000c1a] to-[#001830] p-2 sm:p-4 md:p-6">
      <NotificationSystem character={character} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FatigueSystem
              fatigue={character.fatigue}
              onFatigueChange={handleFatigueChange}
            />
            <CombatPreferences
              attackAttribute={character.combatPreferences.attackAttribute}
              onPreferenceChange={handleCombatPreferenceChange}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            currency={character.currency}
            onInventoryChange={(inventory) => setCharacter(prev => ({ ...prev, inventory }))}
            onCurrencyChange={(currency) => setCharacter(prev => ({ ...prev, currency }))}
          />
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12">
          <ChatSystem character={character} onCharacterUpdate={setCharacter} />
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 hidden">
          <MapSystem characters={[]}/>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
              onClick={() => exportCharacter(character, webhookSettings)}
              className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
              <Save className="w-5 h-5" />
              <span>Exportar JSON</span>
            </div>
          </button>
          <button
              onClick={exportAsPNG}
              className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
              <Camera className="w-5 h-5" />
              <span>Exportar PNG</span>
            </div>
          </button>
          <label
              className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
              <Upload className="w-5 h-5" />
              <span>Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={importCharacter}
                className="hidden"
              />
            </div>
          </label>
        </div>
      </div>

      <Modal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title="SISTEMA"
      >
        <div className="relative space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xl text-[#00ffe1]/70">
              Notificação do Sistema
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#00ffe1]/30 to-transparent" />

          <div className="space-y-6">
            <div>
              <input
                type="text"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                placeholder="Título da Notificação"
              />
            </div>

            <div>
              <textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all placeholder-[#00ffe1]/30"
                placeholder="Mensagem da Notificação"
                rows={4}
              />
            </div>

            <div>
              <select
                value={notificationTarget}
                onChange={(e) => setNotificationTarget(e.target.value)}
                className="w-full bg-[#001830] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-4 focus:border-[#00ff88] focus:shadow-[0_0_20px_#00ffe1] transition-all"
              >
                <option value="">Todos os jogadores</option>
                {/* Connected users will be populated here */}
              </select>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleSendNotification}
                disabled={!notificationTitle.trim() || !notificationMessage.trim()}
                className="group relative px-8 py-4 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
                  <Bell className="w-5 h-5" />
                  <span>ENVIAR</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;