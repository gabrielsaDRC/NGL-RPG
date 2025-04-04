import { WebhookMessage } from '../types/webhook';
import { Character, Ability } from '../types/character';

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

export const createDiceRollMessage = (
  character: Character,
  diceType: number,
  rolls: number[],
  total: number,
  context?: string,
  attributeValue?: number,
  isCritical?: boolean
): WebhookMessage => {
  const characterInfo = getCharacterInfo(character);
  const diceTotal = rolls.reduce((a, b) => a + b, 0);
  const finalTotal = diceTotal + (attributeValue || 0);
  
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
          attributeValue ? `Atributo (${context?.split(' ')[1]}): ${attributeValue}` : '',
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
      .map(bonus => `**${bonus.attribute.toUpperCase()}** +${bonus.value}`)
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
  
  const description = [
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
  ];

  if (ability) {
    description.push('', ...formatAbilityDetails(ability));
  }

  if (!isDeactivation) {
    description.push(
      '',
      `**▸ Custo:** ${cost.value} ${cost.type === 'mp' ? '✨ Mana' : '💪 Fadiga'}`
    );
    
    if (cost.type === 'mp') {
      const manaAfterCost = character.currentMp - cost.value;
      description.push(`**▸ Mana Restante:** ${manaAfterCost} ✨`);
    } else if (cost.type === 'fatigue') {
      description.push(`**▸ Fadiga Atual:** ${character.fatigue} 💪`);
    }

    if (ability?.attack && rolls) {
      description.push(
        '',
        '───────────────── **Dano** ─────────────────',
        `**▸ Dano Total:** ${rolls.total}`
      );
    }
  }

  description.push(
    '',
    '═══════════════════════════════════════════════'
  );

  return {
    embeds: [
      {
        color: isDeactivation ? 0xff0000 : 0x00ff88,
        description: description.join('\n'),
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