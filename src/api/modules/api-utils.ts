import { bot } from '../../bot';
import { AuthClient } from '../server';
import { User } from 'discord.js';
import config from '../../../config.json';

export async function getUser(key: any) {
  if (!key) return null;

  let authUser: AuthUser = await AuthClient.getUser(key);

  authUser['displayAvatarURL'] = authUser.avatarUrl(64);
  authUser = JSON.parse(JSON
    .stringify(authUser)
    .replace(/"_(.*?)"/g, '"$1"'));

  return authUser;
}

export async function validateBotOwner(key: any) {
  if (!key)
    throw new TypeError('No key provided.');
  const { id } = await getUser(key);
      
  if (id !== config.bot.ownerId)
    throw TypeError('Unauthorized.');
}

export async function validateGuildManager(key: any, guildId: string) {
  if (!key)
    throw new TypeError('No key provided.');
  const guilds = await getManagableGuilds(key);
      
  if (!guilds.has(guildId))
    throw TypeError('Guild not manageable.');
}

export async function getManagableGuilds(key: any) {
  const manageableGuilds = [];
  let userGuilds = await AuthClient.getGuilds(key);    
  for (const id of userGuilds.keys()) {        
    const authGuild = userGuilds.get(id);        
    const hasManager = authGuild._permissions
      .some(p => p === 'MANAGE_GUILD');

    if (hasManager)
      manageableGuilds.push(id);
  }    
  return bot.guilds.cache
    .filter(g => manageableGuilds.some(id => id === g.id));
}

export function leaderboardMember(user: User, xpInfo: any) {
    return {
        id: user.id,
        username: user.username,
        tag: '#' + user.discriminator,
        displayAvatarURL: user.displayAvatarURL({ dynamic: true }),
        ...xpInfo
    };
}

export function sendError(res: any, code: number, error: Error) {
  return res.status(code).json({ code, message: error?.message })
}

export interface AuthUser {
  username: string;
  locale: string;
  isMFAEnabled: boolean;
  discriminator: number;
  id: string;
  avatarHash: string;
  userFlags: string[];
  premiumType: string;
  bot: boolean;
  createdTimestamp: number;
  createdAt: string;

  avatarUrl: (size: number) => string;
}