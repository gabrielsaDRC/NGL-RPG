import { WebhookMessage } from '../types/webhook';
import { Character, Ability } from '../types/character';
import { supabase } from './supabase';

const getCharacterInfo = (character: Character): { description: string } => {
  const info = {
    description: [
      `🎭 **${character.name || 'Aventureiro Desconhecido'}**`,
      character.class ? `📜 **Classe:** ${character.class}` : '',
      `⭐ **Nível:** ${character.level}`,
    ].filter(Boolean).join('\n')
  };
  return info;
};

export const sendWebhookMessage = async (url: string, message: WebhookMessage) => {
  if (!url) {
    console.error('URL do webhook não fornecida');
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'RPG - Sistema',
        avatar_url: 'https://i.imgur.com/AfFp7pu.png',
        embeds: message.embeds?.map(embed => ({
          ...embed,
          color: embed.color || 0x00ffe1,
          timestamp: embed.timestamp || new Date().toISOString(),
          footer: {
            text: '🎭 Sistema de RPG',
            ...(embed.footer?.icon_url && { icon_url: embed.footer.icon_url })
          }
        }))
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API Error:', errorText);
      throw new Error(`Erro ao enviar mensagem: ${response.status}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Erro ao enviar mensagem para o webhook:', error);
    throw error;
  }
};

const getAttributeDisplayName = (attr: string): string => {
  switch (attr.toLowerCase()) {
    case 'str': return 'Força';
    case 'vit': return 'Vitalidade';
    case 'agi': return 'Agilidade';
    case 'int': return 'Inteligência';
    case 'sense': return 'Sentidos';
    default: return attr;
  }
};

export const createDiceRollMessage = async (
  character: Character,
  diceType: number,
  rolls: number[],
  total: number,
  context?: string,
  attributeValue?: number,
  isCritical?: boolean
): Promise<WebhookMessage> => {
  const characterInfo = getCharacterInfo(character);
  const diceTotal = rolls.reduce((a, b) => a + b, 0);
  const finalTotal = diceTotal + (attributeValue || 0);
  
  // Extract attribute name from context if it exists
  const attributeMatch = context?.match(/Teste de (\w+)/);
  const attributeName = attributeMatch ? getAttributeDisplayName(attributeMatch[1]) : undefined;

  // Create a descriptive message for the content
  const rollDescription = [
    `${character.name} rolou dados:`,
    `2d${diceType}: [${rolls.join('] [')}] = ${diceTotal}`,
    attributeValue ? `${attributeName || 'Atributo'}: ${attributeValue}` : '',
    `Total Final: ${finalTotal}${isCritical ? ` (${finalTotal * 2} com crítico)` : ''}`
  ].filter(Boolean).join('\n');

  // Send roll to chat if in a session
  const sessionId = localStorage.getItem('rpg-session-id');
  if (sessionId) {
    await supabase.from('messages').insert({
      content: rollDescription,
      sender_name: character.name,
      sender_type: 'roll',
      session_id: sessionId,
      roll_data: {
        type: 'dice',
        rolls,
        total: diceTotal,
        context,
        attributeValue,
        isCritical
      }
    });
  }
  
  return {
    embeds: [
      {
        color: 0x00ffe1,
        description: [
          characterInfo.description,
          '',
          context || '**Rolagem de Dados**',
          isCritical ? '**CRÍTICO!**' : '',
          `2d${diceType}: [${rolls.join('] [')}] = ${diceTotal}`,
          attributeValue ? `${attributeName || 'Atributo'}: ${attributeValue}` : '',
          `Total Final: ${finalTotal}${isCritical ? ` (${finalTotal * 2} com crítico)` : ''}`
        ].filter(Boolean).join('\n'),
        footer: {
          text: '🎭 Sistema de RPG'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };
};

const formatAbilityDetails = (ability: Ability): string[] => {
  const details: string[] = [];

  if (ability.description) {
    details.push(`**▸ Descrição:** ${ability.description}`);
  }

  if (ability.type === 'buff' && ability.bonuses.length > 0) {
    const bonusText = ability.bonuses
      .map(bonus => `**${getAttributeDisplayName(bonus.attribute)}** +${bonus.value}`)
      .join(', ');
    details.push(`**▸ Bônus:** ${bonusText}`);
  }

  if (ability.type === 'modifier' && ability.modifier) {
    const statDisplay = ability.modifier.stat === 'physicalDamage' ? 'Dano Físico' : 'Dano Mágico';
    details.push(`**▸ Modificador:** ${statDisplay} +${ability.modifier.value}`);
  }

  if (ability.type === 'attack' && ability.attack) {
    details.push(
      `**▸ Dano Base:** ${ability.attack.value}x ${ability.attack.damageType === 'physical' ? 'Dano Físico' : 'Dano Mágico'}`
    );
  }

  return details;
};

export const createAbilityMessage = (
  character: Character,
  abilityName: string,
  abilityType: string,
  cost: { type: string; value: number },
  rolls?: { diceType: number; rolls: number[]; total: number },
  isDeactivation?: boolean
): WebhookMessage => {
  const characterInfo = getCharacterInfo(character);
  const ability = character.abilities.find(a => a.name === abilityName);
  
  // Send to chat if in a session
  const sessionId = localStorage.getItem('rpg-session-id');
  if (sessionId) {
    const content = `
<div class="space-y-4">
  <div class="text-center">
    <h2 class="text-xl font-bold">${isDeactivation ? 'DESATIVAÇÃO DE HABILIDADE' : 'ATIVAÇÃO DE HABILIDADE'}</h2>
  </div>

  <div class="space-y-2">
    <p><strong>${abilityName}</strong></p>
    ${ability?.description ? `<p class="text-sm italic">${ability.description}</p>` : ''}
    
    ${ability?.attack ? `
    <div>
      <p><strong>Dano Base:</strong> ${ability.attack.value}x ${ability.attack.damageType === 'physical' ? 'Dano Físico' : 'Dano Mágico'}</p>
      ${rolls ? `<p><strong>Dano Total:</strong> ${rolls.total}</p>` : ''}
    </div>
    ` : ''}

    ${!isDeactivation ? `
    <div>
      <p><strong>Custo:</strong> ${cost.value} ${cost.type === 'mp' ? 'MP' : 'Fadiga'}</p>
    </div>
    ` : ''}
  </div>
</div>`;

    supabase.from('messages').insert({
      content,
      sender_name: character.name,
      sender_type: 'player',
      session_id: sessionId
    });
  }

  return {
    embeds: [
      {
        color: isDeactivation ? 0xff0000 : 0x00ff88,
        description: [
          characterInfo.description,
          '',
          '═══════════════════════════════════════════════',
          isDeactivation 
            ? '          **DESATIVAÇÃO DE HABILIDADE**'
            : '            **ATIVAÇÃO DE HABILIDADE**',
          '═══════════════════════════════════════════════',
          '',
          `**▸ Nome:** ${abilityName}`,
          `**▸ Tipo:** ${abilityType}`,
          '',
          ...(ability ? formatAbilityDetails(ability) : []),
          '',
          !isDeactivation ? `**▸ Custo:** ${cost.value} ${cost.type === 'mp' ? 'MP' : 'Fadiga'}` : '',
          '',
          '═══════════════════════════════════════════════'
        ].filter(Boolean).join('\n'),
        footer: {
          text: '🎭 Sistema de RPG'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };
};

export const createFatigueMessage = (
  character: Character,
  action: string,
  change: number,
  newValue: number
): WebhookMessage => {
  const characterInfo = getCharacterInfo(character);
  
  // Send to chat if in a session
  const sessionId = localStorage.getItem('rpg-session-id');
  if (sessionId) {
    const content = `
<div class="space-y-4">
  <div class="text-center">
    <h2 class="text-xl font-bold">SISTEMA DE FADIGA</h2>
  </div>

  <div class="space-y-2">
    <p><strong>Ação:</strong> ${action}</p>
    <p><strong>Alteração:</strong> ${change > 0 ? `+${change}` : change}</p>
    <p><strong>Fadiga Atual:</strong> ${newValue}</p>
  </div>
</div>`;

    supabase.from('messages').insert({
      content,
      sender_name: character.name,
      sender_type: 'player',
      session_id: sessionId
    });
  }

  return {
    embeds: [
      {
        color: 0xff9900,
        description: [
          characterInfo.description,
          '',
          '═══════════════════════════════════════════════',
          '             **SISTEMA DE FADIGA**',
          '═══════════════════════════════════════════════',
          '',
          `**▸ Ação:** ${action}`,
          '',
          `**▸ Alteração:** ${change > 0 ? `+${change}` : change}`,
          `**▸ Fadiga Atual:** ${newValue}`,
          '',
          '═══════════════════════════════════════════════'
        ].join('\n'),
        footer: {
          text: '🎭 Sistema de RPG'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };
};