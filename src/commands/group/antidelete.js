const Settings = require('../../database/models/Settings');
const { reply, isGroupAdmin, isOwner } = require('../../lib/commandHelpers');

module.exports = {
  name: 'antidelete',
  aliases: [],
  category: 'group',
  description: 'Enable or disable anti-delete message recovery. Usage: antidelete on / off',
  async execute({ sock, remoteJid, sender, args, isGroup, msg }) {
    const scope = isGroup ? remoteJid : 'global';
    if (isGroup && !(await isGroupAdmin(sock, remoteJid, sender)) && !isOwner(sender)) {
      return reply(sock, remoteJid, 'Only group admins can use this command.', msg);
    }

    const mode = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) return reply(sock, remoteJid, 'Usage: antidelete on  or  antidelete off', msg);

    await Settings.findOneAndUpdate({ scope }, { $set: { antidelete: mode === 'on' } }, { upsert: true });
    await reply(sock, remoteJid, `Anti-delete protection turned ${mode}.`, msg);
  }
};
