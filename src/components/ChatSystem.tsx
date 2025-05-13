import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Copy, DoorOpen, Dice6, ChevronDown, ChevronUp, UserCircle2, Heart, Sparkles, Battery } from 'lucide-react';
import { supabase, createSession, joinSession } from '../utils/supabase';
import { Character, PresenceState } from '../types/character';
import { Modal } from './Modal';
import { CharacterAttributes } from './CharacterAttributes';
import { calculateTotalPoints, calculateBonus, calculateSpeed, calculatePhysicalDamage, calculateMagicDamage, calculateStatBonuses } from '../utils/character';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_type: 'player' | 'master' | 'system' | 'roll';
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
}

interface ChatSystemProps {
  character: Character;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ character }) => {
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
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    };

    textarea.addEventListener('input', adjustHeight);
    return () => textarea.removeEventListener('input', adjustHeight);
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
        chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
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

  const parseMarkdownToJSX = (text: string) => {
    // Escapa HTML perigoso
    const escapeHtml = (unsafe: string) =>
      unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Etapas:
    // 1. Escapar HTML
    // 2. Substituir \n por <br>
    // 3. Converter **negrito**
    // 4. Converter *itálico*

    const escapedText = escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');

    return <span dangerouslySetInnerHTML={{ __html: escapedText }} />;
  };


  const renderMessage = (message: Message) => {
    if (message.sender_type === 'system') {
      return (
        <div className="flex justify-center">
          <div className="bg-[#1a1a1a]/50 text-[#00ffe1]/75 text-sm px-4 py-2 rounded-lg border border-[#00ffe1]/20">
            {message.content}
          </div>
        </div>
      );
    }

    if (message.sender_type === 'roll') {
      const rollData = message.roll_data!;
      const criticalClass = rollData.isCritical ? 'text-yellow-400' : '';
      
      return (
        <div
        className={`flex items-start gap-4 ${
          message.sender_name === character.name ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`max-w-[80%] ${
            message.sender_name === character.name
              ? 'bg-[#00ffe1]/10 text-[#00ffe1] border-[#00ffe1]/20'
              : 'bg-[#1a1a1a] text-[#00ffe1] border-[#00ffe1]/20'
          } p-4 rounded-lg space-y-2 border shadow-lg break-words`}
        >
            <div className="flex items-center gap-2">
              <Dice6 size={16} className={criticalClass} />
              <span className="font-medium">{message.sender_name}</span>
              {rollData.context && (
                <span className="text-[#00ffe1]/75">• {rollData.context}</span>
              )}
            </div>
            
            <div className="space-y-1">
              <div className={`font-mono ${criticalClass}`}>
                2d10: [{rollData.rolls.join('] [')}] = {rollData.total}
              </div>
              
              {rollData.attributeValue && (
                <div className="text-[#00ffe1]/75">
                  Atributo: {rollData.attributeValue}
                </div>
              )}
              
              <div className={`font-bold ${criticalClass}`}>
                Total Final: {rollData.total + (rollData.attributeValue || 0)}
                {rollData.isCritical && ` (${(rollData.total + (rollData.attributeValue || 0)) * 2} com crítico)`}
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
          className={`max-w-[80%] ${
            message.sender_name === character.name
              ? 'bg-[#00ffe1]/10 text-[#00ffe1] border-[#00ffe1]/20'
              : 'bg-[#1a1a1a] text-[#00ffe1] border-[#00ffe1]/20'
          } p-4 rounded-lg space-y-2 border shadow-lg break-words`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{message.sender_name}</span>
              {message.sender_type === 'master' && (
                <span className="text-xs bg-[#00ffe1]/20 text-[#00ffe1] px-2 py-0.5 rounded">
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
      </div>
    );
  };

  if (!sessionId) {
    return (
      <div className="bg-[rgba(0,20,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
            Chat da Sessão
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={handleCreateSession}
              className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
            >
              Criar Nova Sessão
            </button>
            
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
            >
              Entrar em uma Sessão
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
    <div className="bg-[rgba(0,20,40,0.5)] p-6 rounded-xl border border-[#00ffe1] shadow-[0_0_10px_#00ffe1]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#00ffe1] hover:text-[#00ff88] transition-colors"
          >
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
            Chat da Sessão
          </h2>
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

      <div className={`space-y-4 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
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
    </div>
  );
};