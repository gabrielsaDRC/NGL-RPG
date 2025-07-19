import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Copy, DoorOpen, Dice6, ChevronDown, ChevronUp, UserCircle2, Heart, Sparkles, Battery, Crown, Star, Zap, Target, Sword, Shield } from 'lucide-react';
import { supabase, createSession, joinSession } from '../utils/supabase';
import { Character, PresenceState } from '../types/character';
import { Modal } from './Modal';
import { CharacterAttributes } from './CharacterAttributes';
import { calculateTotalPoints, calculateBonus, calculateSpeed, calculatePhysicalDamage, calculateMagicDamage, calculateStatBonuses } from '../utils/character';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_type: 'player' | 'master' | 'system' | 'roll' | 'combat';
  session_id: string;
  created_at: string;
  roll_data?: {
    type: string;
    rolls: number[];
    total: number;
    context?: string;
    attributeValue?: number;
    isCritical?: boolean;
  };
  combat_data?: {
    attacker: string;
    target: string;
    action: string;
    attackRoll: {
      dice: number[];
      total: number;
      attribute: number;
      finalTotal: number;
    };
    targetDefense: number;
    damage?: number;
    isCritical?: boolean;
    isCriticalFailure?: boolean;
    result: string;
  };
}

interface ChatSystemProps {
  character: Character;
  onCharacterUpdate?: (character: Character) => void;
}

const MESSAGE_TYPES = {
  player: {
    bgColor: 'bg-[#00ffe1]/10',
    borderColor: 'border-[#00ffe1]/20',
    textColor: 'text-[#00ffe1]'
  },
  master: {
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-400'
  },
  system: {
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    textColor: 'text-yellow-400'
  },
  roll: {
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    textColor: 'text-green-400'
  },
  combat: {
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    textColor: 'text-red-400'
  }
};

export const ChatSystem: React.FC<ChatSystemProps> = ({ character, onCharacterUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'player' | 'master'>('player');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinSessionId, setJoinSessionId] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showConnectedUsers, setShowConnectedUsers] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<PresenceState[]>([]);
  const [selectedUser, setSelectedUser] = useState<PresenceState | null>(null);
  const [showCombatModal, setShowCombatModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<PresenceState | null>(null);
  const [combatAction, setCombatAction] = useState<'attack' | 'ability'>('attack');
  const [selectedAbility, setSelectedAbility] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastPresenceRef = useRef<string>('');

  useEffect(() => {
    const existingSessionId = localStorage.getItem('rpg-session-id');
    if (existingSessionId) {
      console.log('Found existing session ID:', existingSessionId);
      setSessionId(existingSessionId);
      subscribeToSession(existingSessionId);
    }

    return () => {
      cleanupChannel();
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
      }
    };

    textarea.addEventListener('input', adjustHeight);
    return () => {
      if (textarea) {
        textarea.removeEventListener('input', adjustHeight);
      }
    };
  }, []);

  useEffect(() => {
    if (!channelRef.current || !sessionId) return;

    const statBonuses = calculateStatBonuses([
      ...character.equipment,
      ...character.titles.filter(title => character.activeTitles.includes(title.id)),
      ...character.abilities.filter(ability => 
        ability.type === 'passive_skill' || 
        character.activeAbilities.includes(ability.id)
      )
    ]);

    const bonus = calculateBonus(character);
    const maxHp = 100 + ((character.attributes.vit + bonus.vit) * 12) + (statBonuses.hp || 0);
    const maxMp = 50 + ((character.attributes.int + bonus.int) * 15) + (statBonuses.mp || 0);
    const physicalDamage = calculatePhysicalDamage(character.attributes.str + bonus.str) + (statBonuses.physicalDamage || 0);
    const magicDamage = (calculateMagicDamage(character.attributes.int + bonus.int) + (statBonuses.magicDamage || 0)).toFixed(1);
    const speed = calculateSpeed(character.attributes.agi + bonus.agi) + (statBonuses.speed || 0);

    const presenceData = {
      user: character.name,
      character: {
        name: character.name,
        class: character.class,
        level: character.level,
        attributes: character.attributes,
        currentHp: character.currentHp,
        maxHp,
        currentMp: character.currentMp,
        maxMp,
        fatigue: character.fatigue,
        physicalDamage,
        magicDamage,
        attack: character.attributes.str + bonus.str + (statBonuses.attack || 0),
        magicAttack: character.attributes.int + bonus.int + (statBonuses.magicAttack || 0),
        speed,
        defense: character.attributes.vit + bonus.vit + (statBonuses.defense || 0)
      },
      online_at: new Date().toISOString()
    };

    const presenceString = JSON.stringify(presenceData);
    if (presenceString !== lastPresenceRef.current) {
      lastPresenceRef.current = presenceString;
      channelRef.current.track(presenceData);
    }
  }, [character, sessionId]);

  const cleanupChannel = async () => {
    if (channelRef.current) {
      await channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  };

  const subscribeToSession = async (id: string) => {
    await cleanupChannel();

    const { data: existingMessages, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching messages:', fetchError);
      return;
    }

    if (existingMessages) {
      setMessages(existingMessages);
      scrollToBottom();
    }

    const channel = supabase.channel(`session_messages:${id}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.values(presenceState).flat() as PresenceState[];
        setConnectedUsers(users);
        setOnlineCount(users.length);
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${id}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          
          setMessages((prev) => {
            if (prev.some(msg => msg.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          
          // Apply damage if this is a combat message targeting this character
          if (newMessage.sender_type === 'combat' && 
              newMessage.combat_data && 
              onCharacterUpdate) {
            
            console.log('Combat message received:', newMessage.combat_data);
            console.log('Current character name:', character.name);
            console.log('Target name:', newMessage.combat_data.target);
            
            // Check if this character is the target (case-insensitive)
            const isTarget = newMessage.combat_data.target && 
                            character.name && 
                            newMessage.combat_data.target.toLowerCase().trim() === character.name.toLowerCase().trim();
            
            console.log('Is target?', isTarget);
            
            if (isTarget && newMessage.combat_data.damage && newMessage.combat_data.damage > 0) {
              console.log('Applying damage:', newMessage.combat_data.damage);
              console.log('Current HP:', character.currentHp);
              
              const newHp = Math.max(0, character.currentHp - newMessage.combat_data.damage);
              console.log('New HP will be:', newHp);
              
              const updatedCharacter = { 
                ...character, 
                currentHp: newHp 
              };
              
              console.log('Updating character with new HP:', updatedCharacter.currentHp);
              onCharacterUpdate(updatedCharacter);
            }
          }
          
          scrollToBottom();
        }
      );

    channelRef.current = channel;

    try {
      const statBonuses = calculateStatBonuses([
        ...character.equipment,
        ...character.titles.filter(title => character.activeTitles.includes(title.id)),
        ...character.abilities.filter(ability => 
          ability.type === 'passive_skill' || 
          character.activeAbilities.includes(ability.id)
        )
      ]);

      const bonus = calculateBonus(character);
      const maxHp = 100 + ((character.attributes.vit + bonus.vit) * 12) + (statBonuses.hp || 0);
      const maxMp = 50 + ((character.attributes.int + bonus.int) * 15) + (statBonuses.mp || 0);
      const physicalDamage = calculatePhysicalDamage(character.attributes.str + bonus.str) + (statBonuses.physicalDamage || 0);
      const magicDamage = (calculateMagicDamage(character.attributes.int + bonus.int) + (statBonuses.magicDamage || 0)).toFixed(1);
      const speed = calculateSpeed(character.attributes.agi + bonus.agi) + (statBonuses.speed || 0);

      const subscription = await channel.subscribe(async (status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          const presenceData = {
            user: character.name,
            character: {
              name: character.name,
              class: character.class,
              level: character.level,
              attributes: character.attributes,
              currentHp: character.currentHp,
              maxHp,
              currentMp: character.currentMp,
              maxMp,
              fatigue: character.fatigue,
              physicalDamage,
              magicDamage,
              attack: character.attributes.str + bonus.str + (statBonuses.attack || 0),
              magicAttack: character.attributes.int + bonus.int + (statBonuses.magicAttack || 0),
              speed,
              defense: character.attributes.vit + bonus.vit + (statBonuses.defense || 0)
            },
            online_at: new Date().toISOString()
          };
          
          lastPresenceRef.current = JSON.stringify(presenceData);
          await channel.track(presenceData);
        }
      });
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      throw error;
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const handleCreateSession = async () => {
    try {
      const session = await createSession();
      setSessionId(session.id);
      localStorage.setItem('rpg-session-id', session.id);
      await subscribeToSession(session.id);
      
      await supabase.from('messages').insert({
        content: 'Sessão criada! Compartilhe o ID para outros jogadores entrarem.',
        sender_name: 'Sistema',
        sender_type: 'system',
        session_id: session.id,
      });
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Erro ao criar sessão');
    }
  };

  const handleJoinSession = async () => {
    if (!joinSessionId.trim()) return;

    try {
      const session = await joinSession(joinSessionId);
      setSessionId(session.id);
      localStorage.setItem('rpg-session-id', session.id);
      await subscribeToSession(session.id);
      setShowJoinModal(false);
      
      await supabase.from('messages').insert({
        content: `${character.name} entrou na sessão!`,
        sender_name: 'Sistema',
        sender_type: 'system',
        session_id: session.id,
      });
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Erro ao entrar na sessão. Verifique o ID e tente novamente.');
    }
  };

  const handleLeaveSession = async () => {
    if (!sessionId) return;

    try {
      await supabase.from('messages').insert({
        content: `${character.name} saiu da sessão.`,
        sender_name: 'Sistema',
        sender_type: 'system',
        session_id: sessionId,
      });

      await cleanupChannel();
      localStorage.removeItem('rpg-session-id');
      setSessionId(null);
      setMessages([]);
      setConnectedUsers([]);
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    console.log('Sending message:', newMessage);
    try {
      const { data, error } = await supabase.from('messages').insert({
        content: newMessage.trim(),
        sender_name: character.name,
        sender_type: messageType,
        session_id: sessionId,
      }).select();

      console.log('Message sent response:', { data, error });

      if (error) throw error;
      setNewMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = '42px';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCombatAction = async () => {
    if (!selectedTarget || !sessionId) return;

    const bonus = calculateBonus(character);
    const statBonuses = calculateStatBonuses([
      ...character.equipment,
      ...character.titles.filter(title => character.activeTitles.includes(title.id)),
      ...character.abilities.filter(ability => 
        ability.type === 'passive_skill' || 
        character.activeAbilities.includes(ability.id)
      )
    ]);

    // Roll 2d10 for attack
    const roll1 = Math.floor(Math.random() * 10) + 1;
    const roll2 = Math.floor(Math.random() * 10) + 1;
    const rollTotal = roll1 + roll2;
    const isCritical = roll1 === 10 && roll2 === 10;
    const isCriticalFailure = roll1 === 1 && roll2 === 1;

    let attackValue = 0;
    let damage = 0;
    let actionName = '';

    if (combatAction === 'attack') {
      if (character.combatPreferences.attackAttribute === 'physical') {
        attackValue = character.attributes.str + bonus.str + (statBonuses.attack || 0);
        damage = calculatePhysicalDamage(character.attributes.str + bonus.str) + (statBonuses.physicalDamage || 0);
        actionName = 'Ataque Físico';
      } else {
        attackValue = character.attributes.int + bonus.int + (statBonuses.magicAttack || 0);
        damage = Math.floor(calculateMagicDamage(character.attributes.int + bonus.int) + (statBonuses.magicDamage || 0));
        actionName = 'Ataque Mágico';
      }
    } else if (combatAction === 'ability' && selectedAbility) {
      const ability = character.abilities.find(a => a.id === selectedAbility);
      if (ability && ability.attack) {
        if (ability.attack.damageType === 'physical') {
          attackValue = character.attributes.str + bonus.str + (statBonuses.attack || 0);
          damage = Math.floor((calculatePhysicalDamage(character.attributes.str + bonus.str) + (statBonuses.physicalDamage || 0)) * ability.attack.value);
        } else {
          attackValue = character.attributes.int + bonus.int + (statBonuses.magicAttack || 0);
          damage = Math.floor((calculateMagicDamage(character.attributes.int + bonus.int) + (statBonuses.magicDamage || 0)) * ability.attack.value);
        }
        actionName = ability.name;
      }
    }

    const attackTotal = rollTotal + attackValue;
    const targetDefense = 0 + (selectedTarget.character?.defense || 0);
    
    let result = '';
    let finalDamage = 0;

    if (isCriticalFailure) {
      result = 'FALHA CRÍTICA!';
    } else if (isCritical) {
      finalDamage = damage * 2;
      result = `CRÍTICO! ${finalDamage} de dano`;
    } else if (attackTotal >= targetDefense) {
      finalDamage = damage;
      result = `Acertou! ${finalDamage} de dano`;
    } else {
      result = 'Errou!';
    }

    console.log('Sending combat message with data:', {
      attacker: character.name,
      target: selectedTarget.character?.name || selectedTarget.user,
      damage: finalDamage
    });

    // Send combat message with detailed roll information
    await supabase.from('messages').insert({
      content: `${character.name} usou ${actionName} contra ${selectedTarget.character?.name || selectedTarget.user}!`,
      sender_name: character.name,
      sender_type: 'combat',
      session_id: sessionId,
      combat_data: {
        attacker: character.name,
        target: selectedTarget.character?.name || selectedTarget.user,
        action: actionName,
        attackRoll: {
          dice: [roll1, roll2],
          total: rollTotal,
          attribute: attackValue,
          finalTotal: attackTotal
        },
        targetDefense,
        damage: finalDamage,
        isCritical: isCritical,
        isCriticalFailure: isCriticalFailure,
        result
      }
    });

    setShowCombatModal(false);
    setSelectedTarget(null);
    setSelectedAbility('');
  };

  const parseMarkdownToJSX = (text: string) => {
    const escapeHtml = (unsafe: string) =>
      unsafe
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>');

    const escapedText = escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');

    return <span dangerouslySetInnerHTML={{ __html: escapedText }} />;
  };

  const renderMessage = (message: Message) => {
    const messageStyle = MESSAGE_TYPES[message.sender_type] || MESSAGE_TYPES.player;

    if (message.sender_type === 'system') {
      return (
        <div className="flex justify-center">
          <div className="bg-[#1a1a1a]/50 text-[#00ffe1]/75 text-sm px-4 py-2 rounded-lg border border-[#00ffe1]/20 flex items-center gap-2">
            <Star className="w-4 h-4" />
            {message.content}
          </div>
        </div>
      );
    }

    if (message.sender_type === 'combat') {
      // Check if combat_data exists and has the required properties
      if (!message.combat_data || !message.combat_data.attackRoll) {
        return (
          <div className="flex justify-center">
            <div className="bg-red-900/20 border-2 border-red-400/50 rounded-lg p-4 max-w-lg w-full shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg border border-red-400/50 bg-red-900/20">
                  <Sword className="w-5 h-5 text-red-400" />
                </div>
                <span className="font-bold text-red-400">COMBATE PvP</span>
              </div>
              <div className="text-[#00ffe1]">{message.content}</div>
            </div>
          </div>
        );
      }

      const combatData = message.combat_data;
      
      return (
        <div className="flex justify-center">
          <div className="bg-red-900/20 border-2 border-red-400/50 rounded-lg p-4 max-w-lg w-full shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg border border-red-400/50 bg-red-900/20">
                <Sword className="w-5 h-5 text-red-400" />
              </div>
              <span className="font-bold text-red-400">COMBATE PvP</span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#00ffe1]">Atacante:</span>
                <span className="text-red-400 font-bold">{combatData.attacker}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#00ffe1]">Alvo:</span>
                <span className="text-blue-400 font-bold">{combatData.target}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#00ffe1]">Ação:</span>
                <span className="text-yellow-400 font-bold">{combatData.action}</span>
              </div>
              
              {/* Detailed Roll Information */}
              <div className="mt-3 p-3 bg-[#1a1a1a] rounded border border-[#00ffe1]/30">
                <div className="text-[#00ffe1] font-bold mb-2">Rolagem de Ataque:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#00ffe1]/70">2d10:</span>
                    <span className="text-[#00ffe1] font-mono">
                      [{combatData.attackRoll.dice?.join('] [') || 'N/A'}] = {combatData.attackRoll.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#00ffe1]/70">Atributo:</span>
                    <span className="text-[#00ffe1]">+{combatData.attackRoll.attribute || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#00ffe1]/70">Total Ataque:</span>
                    <span className="text-green-400 font-bold">{combatData.attackRoll.finalTotal || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#00ffe1]/70">Defesa Alvo:</span>
                    <span className="text-blue-400 font-bold">{combatData.targetDefense || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2 bg-[#1a1a1a] rounded border border-[#00ffe1]/30">
                <div className={`font-bold text-center ${
                  combatData.isCritical ? 'text-yellow-400' :
                  combatData.isCriticalFailure ? 'text-red-500' :
                  combatData.result?.includes('Acertou') ? 'text-green-400' :
                  'text-gray-400'
                }`}>
                  {combatData.result || 'Resultado não disponível'}
                </div>
                {combatData.damage && combatData.damage > 0 && (
                  <div className="text-center text-red-400 text-xs mt-1">
                    {combatData.target} perdeu {combatData.damage} HP
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (message.sender_type === 'roll') {
      // Check if roll_data exists
      if (!message.roll_data) {
        return (
          <div className="flex items-start gap-4 justify-start">
            <div className="max-w-[80%] p-4 rounded-lg space-y-2 border-2 shadow-lg break-words transition-all duration-300 bg-[#1a1a1a] border-[#00ffe1]/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg border border-[#00ffe1]/30 bg-[#00ffe1]/10">
                  <Dice6 className="w-4 h-4 text-[#00ffe1]" />
                </div>
                <span className="font-medium text-[#00ffe1]">{message.sender_name}</span>
              </div>
              <div className="text-[#00ffe1]">{message.content}</div>
            </div>
          </div>
        );
      }

      const rollData = message.roll_data;
      const criticalClass = rollData.isCritical ? 'text-yellow-400 border-yellow-400/50 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : '';
      
      return (
        <div
          className={`flex items-start gap-4 ${
            message.sender_name === character.name ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`
              max-w-[80%] p-4 rounded-lg space-y-2 border-2 shadow-lg break-words transition-all duration-300
              ${rollData.isCritical 
                ? 'bg-yellow-900/20 border-yellow-400/50 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                : 'bg-[#1a1a1a] border-[#00ffe1]/20'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg border ${rollData.isCritical ? 'border-yellow-400/50 bg-yellow-900/20' : 'border-[#00ffe1]/30 bg-[#00ffe1]/10'}`}>
                <Dice6 className={`w-4 h-4 ${rollData.isCritical ? 'text-yellow-400' : 'text-[#00ffe1]'}`} />
              </div>
              <span className={`font-medium ${rollData.isCritical ? 'text-yellow-400' : 'text-[#00ffe1]'}`}>
                {message.sender_name}
              </span>
              {rollData.context && (
                <span className="text-[#00ffe1]/75">• {rollData.context}</span>
              )}
              {rollData.isCritical && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-400/50 rounded-full">
                  <Crown className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold">CRÍTICO</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className={`font-mono ${criticalClass}`}>
                2d10: [{rollData.rolls?.join('] [') || 'N/A'}] = {rollData.total || 0}
              </div>
              
              {rollData.attributeValue && (
                <div className="text-[#00ffe1]/75">
                  Atributo: {rollData.attributeValue}
                </div>
              )}
              
              <div className={`font-bold ${criticalClass}`}>
                Total Final: {(rollData.total || 0) + (rollData.attributeValue || 0)}
                {rollData.isCritical && ` (${((rollData.total || 0) + (rollData.attributeValue || 0)) * 2} com crítico)`}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex items-start gap-4 ${
          message.sender_name === character.name ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`
            max-w-[80%] p-4 rounded-lg space-y-2 border shadow-lg break-words transition-all duration-300
            ${message.sender_name === character.name
              ? `${messageStyle.bgColor} ${messageStyle.borderColor} ${messageStyle.textColor}`
              : 'bg-[#1a1a1a] text-[#00ffe1] border-[#00ffe1]/20'
            }
          `}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{message.sender_name}</span>
              {message.sender_type === 'master' && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-400/30">
                  Mestre
                </span>
              )}
            </div>
            <span className="text-xs opacity-75 whitespace-nowrap">
              {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">{parseMarkdownToJSX(message.content)}</p>
        </div>
      </div>
    );
  };

  const renderCharacterStats = (user: PresenceState) => {
    if (!user.character) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* HP Bar */}
          <div className="flex items-center space-x-4">
            <Heart size={20} className="text-[#00ffe1]" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#00ffe1]">HP</span>
                <span className={`font-medium ${
                  (user.character.currentHp / user.character.maxHp) > 0.5
                    ? 'text-[#00ff88]'
                    : (user.character.currentHp / user.character.maxHp) > 0.25
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {user.character.currentHp}/{user.character.maxHp}
                </span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2 border border-[#00ffe1]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    (user.character.currentHp / user.character.maxHp) > 0.5
                      ? 'bg-[#00ff88]'
                      : (user.character.currentHp / user.character.maxHp) > 0.25
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${(user.character.currentHp / user.character.maxHp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* MP Bar */}
          <div className="flex items-center space-x-4">
            <Sparkles size={20} className="text-[#00ffe1]" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#00ffe1]">MP</span>
                <span className="text-blue-400 font-medium">
                  {user.character.currentMp}/{user.character.maxMp}
                </span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2 border border-[#00ffe1]">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${(user.character.currentMp / user.character.maxMp) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fatigue */}
        <div className="flex items-center space-x-4">
          <Battery size={20} className="text-[#00ffe1]" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#00ffe1]">Fadiga</span>
              <span className={`font-medium ${
                user.character.fatigue >= 100
                  ? 'text-red-500'
                  : user.character.fatigue >= 75
                  ? 'text-orange-500'
                  : user.character.fatigue >= 50
                  ? 'text-yellow-500'
                  : 'text-[#00ff88]'
              }`}>
                {user.character.fatigue}/120
              </span>
            </div>
            <div className="w-full bg-[#1a1a1a] rounded-full h-2 border border-[#00ffe1]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  user.character.fatigue >= 100
                    ? 'bg-red-500'
                    : user.character.fatigue >= 75
                    ? 'bg-orange-500'
                    : user.character.fatigue >= 50
                    ? 'bg-yellow-500'
                    : 'bg-[#00ff88]'
                }`}
                style={{ width: `${(user.character.fatigue / 120) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Combat Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#00ffe1]/50">
            <div className="text-[#00ffe1] text-sm mb-1">Dano Físico</div>
            <div className="text-[#00ff88] font-bold">{user.character.physicalDamage}</div>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#00ffe1]/50">
            <div className="text-[#00ffe1] text-sm mb-1">Dano Mágico</div>
            <div className="text-[#00ff88] font-bold">{user.character.magicDamage}</div>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#00ffe1]/50">
            <div className="text-[#00ffe1] text-sm mb-1">Velocidade</div>
            <div className="text-[#00ff88] font-bold">{user.character.speed}</div>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#00ffe1]/50">
            <div className="text-[#00ffe1] text-sm mb-1">Defesa</div>
            <div className="text-[#00ff88] font-bold">{user.character.defense}</div>
          </div>
        </div>

        {/* Combat Actions */}
        {user.user !== character.name && (
          <div className="pt-4 border-t border-[#00ffe1]/30">
            <button
              onClick={() => {
                setSelectedTarget(user);
                setShowCombatModal(true);
              }}
              className="w-full group relative px-4 py-3 bg-[#001830] border border-red-400 rounded-lg overflow-hidden transition-all hover:bg-red-900/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/20 to-red-400/0 animate-[shine_1.5s_ease-in-out_infinite]" />
              </div>

              <div className="relative flex items-center justify-center gap-2 text-red-400 font-bold">
                <Target className="w-4 h-4" />
                <span>ATACAR</span>
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!sessionId) {
    return (
      <div className="bg-[rgba(0,20,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
        <div className="relative text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-lg border border-[#00ffe1]/50 bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5">
              <Users className="w-8 h-8 text-[#00ffe1]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
                Chat da Sessão
              </h2>
              <p className="text-[#00ffe1]/70 text-sm">Conecte-se com outros jogadores</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleCreateSession}
              className="group relative w-full p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-xl overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:scale-105"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
              </div>

              <div className="relative flex items-center justify-center gap-3">
                <div className="p-3 rounded-lg border border-green-400/50 bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <Star className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400 mb-1">
                    Criar Nova Sessão
                  </div>
                  <div className="text-[#00ffe1]/70 text-sm">
                    Inicie uma nova aventura
                  </div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setShowJoinModal(true)}
              className="group relative w-full p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-400/50 rounded-xl overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
              </div>

              <div className="relative flex items-center justify-center gap-3">
                <div className="p-3 rounded-lg border border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400 mb-1">
                    Entrar em uma Sessão
                  </div>
                  <div className="text-[#00ffe1]/70 text-sm">
                    Junte-se a uma aventura existente
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#00ffe1] max-w-md w-full shadow-[0_0_20px_#00ffe1]">
              <h3 className="text-xl font-bold text-[#00ffe1] mb-4">
                Entrar em uma Sessão
              </h3>
              
              <input
                type="text"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
                placeholder="ID da Sessão"
                className="w-full bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 mb-4"
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-[#00ffe1] hover:text-[#00ff88]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleJoinSession}
                  className="px-4 py-2 bg-[#2a2a2a] text-[#00ffe1] border border-[#00ffe1] rounded-lg hover:bg-[#3a3a3a]"
                >
                  Entrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[rgba(0,20,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1] chat-container">
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#00ffe1] hover:text-[#00ff88] transition-colors"
            >
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border border-[#00ffe1]/50 bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5">
                <Users className="w-6 h-6 text-[#00ffe1]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
                  Chat da Sessão
                </h2>
                <p className="text-[#00ffe1]/70 text-sm">Comunicação em tempo real</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowConnectedUsers(true)}
              className="flex items-center gap-2 text-[#00ffe1] hover:text-[#00ff88] transition-colors"
            >
              <Users size={16} />
              <span>{onlineCount} online</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sessionId);
                  alert('ID da sessão copiado!');
                }}
                className="flex items-center gap-2 bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3 py-1.5 hover:bg-[#2a2a2a] transition-colors"
              >
                <Copy size={16} />
                <span className="text-sm">Copiar ID</span>
              </button>

              <button
                onClick={handleLeaveSession}
                className="flex items-center gap-2 bg-[#1a1a1a] text-red-500 border border-red-500 rounded-lg px-3 py-1.5 hover:bg-[#2a2a2a] transition-colors"
              >
                <DoorOpen size={16} />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`space-y-4 transition-all duration-300 ${isExpanded ? 'opacity-100 chat-expanded' : 'opacity-0 h-0 overflow-hidden'}`}>
          <div 
            ref={chatContainerRef}
            className="h-[400px] overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#00ffe1] scrollbar-track-[#1a1a1a] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          >
            {messages.map(message => (
              <div key={message.id} className="animate-fade-in">
                {renderMessage(message)}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as 'player' | 'master')}
              className="bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-3"
            >
              <option value="player">Jogador</option>
              <option value="master">Mestre</option>
            </select>

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3 pr-12 resize-none h-[42px] leading-tight focus:shadow-[0_0_10px_#00ffe1] transition-shadow overflow-hidden"
                style={{ maxHeight: '150px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00ffe1] hover:text-[#00ff88] disabled:opacity-50 disabled:hover:text-[#00ffe1] transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Connected Users Modal */}
        <Modal
          isOpen={showConnectedUsers}
          onClose={() => {
            setShowConnectedUsers(false);
            setSelectedUser(null);
          }}
          title="Jogadores Conectados"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {connectedUsers.map((user) => (
              <div
                key={user.online_at}
                className={`
                  bg-[#1a1a1a] p-4 rounded-lg border border-[#00ffe1] 
                  hover:border-[#00ff88] hover:shadow-[0_0_10px_#00ff88] 
                  transition-all duration-300 cursor-pointer
                  ${selectedUser?.user === user.user ? 'border-[#00ff88] shadow-[0_0_10px_#00ff88]' : ''}
                `}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-3">
                  <UserCircle2 size={40} className="text-[#00ffe1]" />
                  <div>
                    <h3 className="text-[#00ffe1] font-medium">{user.character?.name || user.user}</h3>
                    {user.character && (
                      <p className="text-[#00ffe1]/75 text-sm">
                        {user.character.class} • Nível {user.character.level}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedUser?.character && (
            <div className="mt-6 space-y-6">
              <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#00ffe1]">
                <h3 className="text-xl font-bold text-[#00ffe1] mb-4">
                  Status de {selectedUser.character.name}
                </h3>
                {renderCharacterStats(selectedUser)}
              </div>

              <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#00ffe1]">
                <h3 className="text-xl font-bold text-[#00ffe1] mb-4">
                  Atributos de {selectedUser.character.name}
                </h3>
                <CharacterAttributes
                  attributes={selectedUser.character.attributes}
                  bonus={calculateBonus({ ...selectedUser.character, equipment: [], titles: [], activeTitles: [], abilities: [], activeAbilities: [] })}
                  onAttributeChange={() => {}}
                  remainingPoints={0}
                  readOnly
                  showFatigue={false}
                />
              </div>
            </div>
          )}
        </Modal>

        {/* Combat Modal */}
        <Modal
          isOpen={showCombatModal}
          onClose={() => {
            setShowCombatModal(false);
            setSelectedTarget(null);
            setSelectedAbility('');
          }}
          title="COMBATE PvP"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-lg border border-red-400/50 bg-red-900/20">
                  <Sword className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-red-400">
                  Atacar {selectedTarget?.character?.name}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCombatAction('attack')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  combatAction === 'attack'
                    ? 'bg-red-900/20 border-red-400 text-red-400'
                    : 'bg-[#1a1a1a] border-[#00ffe1]/30 text-[#00ffe1] hover:border-[#00ffe1]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Sword className="w-5 h-5" />
                  <span className="font-bold">Ataque Básico</span>
                </div>
              </button>

              <button
                onClick={() => setCombatAction('ability')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  combatAction === 'ability'
                    ? 'bg-blue-900/20 border-blue-400 text-blue-400'
                    : 'bg-[#1a1a1a] border-[#00ffe1]/30 text-[#00ffe1] hover:border-[#00ffe1]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold">Habilidade</span>
                </div>
              </button>
            </div>

            {combatAction === 'ability' && (
              <div>
                <label className="block text-[#00ffe1] mb-2 font-medium">Selecionar Habilidade de Ataque</label>
                <select
                  value={selectedAbility}
                  onChange={(e) => setSelectedAbility(e.target.value)}
                  className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg p-3"
                >
                  <option value="">Escolha uma habilidade</option>
                  {character.abilities
                    .filter(ability => ability.type === 'attack_skill' && ability.attack)
                    .map(ability => (
                      <option key={ability.id} value={ability.id}>
                        {ability.name} ({ability.attack?.damageType === 'physical' ? 'Físico' : 'Mágico'})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button
                onClick={handleCombatAction}
                disabled={combatAction === 'ability' && !selectedAbility}
                className="group relative px-8 py-4 bg-[#001830] border border-red-400 rounded-lg overflow-hidden transition-all hover:bg-red-900/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/20 to-red-400/0 animate-[shine_1.5s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex items-center gap-3 text-red-400 font-bold tracking-wider">
                  <Target className="w-5 h-5" />
                  <span>EXECUTAR ATAQUE</span>
                </div>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};