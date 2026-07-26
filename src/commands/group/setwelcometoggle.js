const Settings = require('../../database/models/Settings');
const { reply, isGroupAdmin } = require('../../lib/commandHelpers');

module.exports = {
  name: 'welcome',
  aliases: [],
  category: 'group',
  description: 'Enable or disable welcome messages. Usage: welcome on / off',
  async execute({ sock, remoteJid, sender, args, isGroup, msg }) {
    if (!isGroup) return reply(sock, remoteJid, 'This command can only be used in groups.', msg);
    if (!(await isGroupAdmin(sock, remoteJid, sender))) return reply(sock, remoteJid, 'Only group admins can use this command.', msg);

    const mode = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) return reply(sock, remoteJid, 'Usage: welcome on  or  welcome off', msg);

    await Settings.findOneAndUpdate({ scope: remoteJid }, { $set: { welcome: mode === 'on' } }, { upsert: true });
    await reply(sock, remoteJid, `Welcome messages turned ${mode}.`, msg);
  }
};
